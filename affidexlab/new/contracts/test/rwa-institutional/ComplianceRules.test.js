const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, impersonateAccount, setBalance } = require('@nomicfoundation/hardhat-network-helpers');
const { deployComplianceRules, verifyWallet } = require('./helpers');

describe('ComplianceRules', function () {
  describe('canTransfer gating', function () {
    it('blocks a transfer if the sender is not verified', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, to);
      // `from` deliberately left unverified
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(false);
    });

    it('blocks a transfer if the recipient is not verified', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(false);
    });

    it('blocks a transfer if the recipient is not jurisdiction-eligible', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      await verifyWallet(identityRegistry, owner, to, { jurisdictionEligible: false });
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(false);
    });

    it('allows a transfer once both sides are verified and recipient is jurisdiction-eligible', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      await verifyWallet(identityRegistry, owner, to);
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(true);
    });

    it('requireAccreditation blocks non-accredited recipients only when turned on', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      await verifyWallet(identityRegistry, owner, to, { accreditedInvestor: false });

      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(true);

      await complianceRules.connect(owner).setRequireAccreditation(true);
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(false);

      await identityRegistry.connect(owner).setIdentity(to.address, true, true, ethers.ZeroHash);
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(true);
    });

    it('blocks a new holder once maxHolders is reached, but allows transfers to existing holders', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(1));
      const [, tokenSigner, from, to] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      await verifyWallet(identityRegistry, owner, to);

      await complianceRules.connect(owner).setToken(tokenSigner.address);
      await complianceRules.connect(tokenSigner).recordHolderChange(true); // currentHolders = 1 = maxHolders

      // toIsNewHolder = true would push past the cap
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, true)).to.equal(false);
      // toIsNewHolder = false (transfer to an existing holder) is unaffected by the cap
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, false)).to.equal(true);
    });

    it('risk oracle gating: blocks a scored-risky recipient, ignores an unscored one', async function () {
      const { complianceRules, identityRegistry, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, from, to, riskyTo] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, from);
      await verifyWallet(identityRegistry, owner, to);
      await verifyWallet(identityRegistry, owner, riskyTo);

      const RiskOracle = await ethers.getContractFactory('RiskOracle');
      const riskOracle = await RiskOracle.deploy(owner.address);
      await riskOracle.waitForDeployment();
      await complianceRules.connect(owner).setRiskOracle(await riskOracle.getAddress(), 50);

      // `to` never scored -> "fresh" is false -> not blocked (unscored != risky)
      expect(await complianceRules.canTransfer(from.address, to.address, 100n, false)).to.equal(true);

      // `riskyTo` scored above the 50 threshold -> blocked
      await riskOracle.connect(owner).setRiskScore(riskyTo.address, 80);
      expect(await complianceRules.canTransfer(from.address, riskyTo.address, 100n, false)).to.equal(false);
    });
  });

  describe('recordHolderChange', function () {
    it('only the linked token contract can call it', async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, tokenSigner, notTheToken] = await ethers.getSigners();
      await complianceRules.connect(owner).setToken(tokenSigner.address);

      await expect(complianceRules.connect(notTheToken).recordHolderChange(true))
        .to.be.revertedWithCustomError(complianceRules, 'NotToken');
    });

    it('increments and decrements currentHolders', async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, tokenSigner] = await ethers.getSigners();
      await complianceRules.connect(owner).setToken(tokenSigner.address);

      await complianceRules.connect(tokenSigner).recordHolderChange(true);
      await complianceRules.connect(tokenSigner).recordHolderChange(true);
      expect(await complianceRules.currentHolders()).to.equal(2n);

      await complianceRules.connect(tokenSigner).recordHolderChange(false);
      expect(await complianceRules.currentHolders()).to.equal(1n);
    });

    it("never underflows below zero if decremented with no holders", async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, tokenSigner] = await ethers.getSigners();
      await complianceRules.connect(owner).setToken(tokenSigner.address);

      await complianceRules.connect(tokenSigner).recordHolderChange(false);
      expect(await complianceRules.currentHolders()).to.equal(0n);
    });

    it('NEW (Guardian audit HIGH response): reverts with MaxHoldersExceeded if incrementing would exceed maxHolders, even called directly', async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(1));
      const [, tokenSigner] = await ethers.getSigners();
      await complianceRules.connect(owner).setToken(tokenSigner.address);

      await complianceRules.connect(tokenSigner).recordHolderChange(true); // currentHolders = 1 = maxHolders, OK
      await expect(complianceRules.connect(tokenSigner).recordHolderChange(true))
        .to.be.revertedWithCustomError(complianceRules, 'MaxHoldersExceeded');
    });

    it('maxHolders == 0 means uncapped', async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(0));
      const [, tokenSigner] = await ethers.getSigners();
      await complianceRules.connect(owner).setToken(tokenSigner.address);

      for (let i = 0; i < 5; i++) {
        await complianceRules.connect(tokenSigner).recordHolderChange(true);
      }
      expect(await complianceRules.currentHolders()).to.equal(5n);
    });
  });

  describe('setToken', function () {
    it('can only be set once', async function () {
      const { complianceRules, owner } = await loadFixture(() => deployComplianceRules(10));
      const [, tokenA, tokenB] = await ethers.getSigners();

      await complianceRules.connect(owner).setToken(tokenA.address);
      await expect(complianceRules.connect(owner).setToken(tokenB.address))
        .to.be.revertedWithCustomError(complianceRules, 'TokenAlreadySet');
    });
  });
});
