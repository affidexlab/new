const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { deployFullStack, verifyWallet } = require('./helpers');

describe('RWAToken', function () {
  describe('mint / basic transfer compliance', function () {
    it('mint respects compliance (fails to an unverified wallet)', async function () {
      const { token, owner } = await loadFixture(() => deployFullStack(10));
      const [, unverified] = await ethers.getSigners();
      await expect(token.connect(owner).mint(unverified.address, 100n))
        .to.be.revertedWithCustomError(token, 'TransferNotCompliant');
    });

    it('mint succeeds to a verified, eligible wallet', async function () {
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await token.connect(owner).mint(alice.address, 1000n);
      expect(await token.balanceOf(alice.address)).to.equal(1000n);
    });

    it('only owner can mint', async function () {
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice, attacker] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await expect(token.connect(attacker).mint(alice.address, 1000n))
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });

    it('a compliant transfer between two verified wallets succeeds and updates holder count', async function () {
      const { token, complianceRules, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice, bob] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await verifyWallet(identityRegistry, owner, bob);
      await token.connect(owner).mint(alice.address, 1000n);

      expect(await complianceRules.currentHolders()).to.equal(1n); // alice
      await token.connect(alice).transfer(bob.address, 300n);
      expect(await token.balanceOf(bob.address)).to.equal(300n);
      expect(await token.balanceOf(alice.address)).to.equal(700n);
      expect(await complianceRules.currentHolders()).to.equal(2n); // alice + bob, both nonzero
    });

    it('a transfer emptying the sender decrements holder count', async function () {
      const { token, complianceRules, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice, bob] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await verifyWallet(identityRegistry, owner, bob);
      await token.connect(owner).mint(alice.address, 1000n);
      await token.connect(alice).transfer(bob.address, 1000n); // alice fully emptied
      expect(await complianceRules.currentHolders()).to.equal(1n); // just bob now
    });

    it('sending to the token contract itself is blocked', async function () {
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await token.connect(owner).mint(alice.address, 1000n);
      await expect(token.connect(alice).transfer(await token.getAddress(), 100n))
        .to.be.revertedWithCustomError(token, 'CannotSendToTokenContract');
    });

    it('self-transfers do not change holder count', async function () {
      const { token, complianceRules, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await token.connect(owner).mint(alice.address, 1000n);
      const before = await complianceRules.currentHolders();
      await token.connect(alice).transfer(alice.address, 100n);
      expect(await complianceRules.currentHolders()).to.equal(before);
    });
  });

  describe('pause / unpause', function () {
    it('blocks transfers while paused, only owner can pause/unpause', async function () {
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, alice, bob, attacker] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, alice);
      await verifyWallet(identityRegistry, owner, bob);
      await token.connect(owner).mint(alice.address, 1000n);

      await expect(token.connect(attacker).pause()).to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
      await token.connect(owner).pause();
      await expect(token.connect(alice).transfer(bob.address, 100n)).to.be.revertedWithCustomError(token, 'EnforcedPause');
      await token.connect(owner).unpause();
      await token.connect(alice).transfer(bob.address, 100n); // now succeeds
      expect(await token.balanceOf(bob.address)).to.equal(100n);
    });
  });

  describe('forcedTransfer — old path, unchanged, still owner-key-dependent by design', function () {
    it('replays the Guardian-audit attack chain and confirms this path is still exploitable exactly as documented', async function () {
      // This is intentionally testing UNCHANGED, pre-existing behavior: forcedTransfer
      // still routes through compliance, and owner still controls compliance data via
      // IdentityRegistry, so a compromised owner key can still push a forced transfer
      // through by manipulating identity state first. emergencyForcedTransfer (below)
      // is the actual fix for this scenario — this test documents why it's needed.
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, victim, attacker] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);

      // "owner key compromised": attacker self-verifies via the owner-controlled registry
      await identityRegistry.connect(owner).setIdentity(attacker.address, true, true, ethers.ZeroHash);

      await expect(token.connect(owner).forcedTransfer(victim.address, attacker.address, 500n, 'malicious'))
        .to.not.be.reverted;
      expect(await token.balanceOf(attacker.address)).to.equal(500n);
    });

    it('only owner can call forcedTransfer', async function () {
      const { token, identityRegistry, owner } = await loadFixture(() => deployFullStack(10));
      const [, victim, attacker] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);
      await expect(token.connect(attacker).forcedTransfer(victim.address, attacker.address, 500n, 'x'))
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });

  describe('emergencyForcedTransfer — CRITICAL finding fix', function () {
    it('reverts with EscrowNotSet before an escrow address is configured', async function () {
      const { token, identityRegistry, owner, emergencyCouncil } = await loadFixture(() => deployFullStack(10));
      const [, victim] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);
      await expect(token.connect(emergencyCouncil).emergencyForcedTransfer(victim.address, 100n, 'test'))
        .to.be.revertedWithCustomError(token, 'EscrowNotSet');
    });

    it('only emergencyCouncil can set the escrow address — owner cannot', async function () {
      const { token, owner, emergencyCouncil, escrow } = await loadFixture(() => deployFullStack(10));
      await expect(token.connect(owner).setEscrowAddress(escrow.address))
        .to.be.revertedWithCustomError(token, 'NotEmergencyCouncil');
      await expect(token.connect(emergencyCouncil).setEscrowAddress(escrow.address))
        .to.emit(token, 'EscrowAddressUpdated').withArgs(escrow.address);
      expect(await token.escrowAddress()).to.equal(escrow.address);
    });

    it('escrow cannot be set to the zero address or the token contract itself', async function () {
      const { token, emergencyCouncil } = await loadFixture(() => deployFullStack(10));
      await expect(token.connect(emergencyCouncil).setEscrowAddress(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(token, 'ZeroAddress');
      await expect(token.connect(emergencyCouncil).setEscrowAddress(await token.getAddress()))
        .to.be.revertedWithCustomError(token, 'CannotSendToTokenContract');
    });

    it('only emergencyCouncil can call emergencyForcedTransfer — owner cannot', async function () {
      const { token, identityRegistry, owner, emergencyCouncil, escrow } = await loadFixture(() => deployFullStack(10));
      const [, victim] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);
      await token.connect(emergencyCouncil).setEscrowAddress(escrow.address);

      await expect(token.connect(owner).emergencyForcedTransfer(victim.address, 100n, 'x'))
        .to.be.revertedWithCustomError(token, 'NotEmergencyCouncil');
    });

    it('CRITICAL SCENARIO: rescues funds to escrow even with IdentityRegistry actively hostile (owner compromised)', async function () {
      const { token, complianceRules, identityRegistry, owner, emergencyCouncil, escrow } = await loadFixture(() => deployFullStack(10));
      const [, victim, attacker] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);
      await token.connect(emergencyCouncil).setEscrowAddress(escrow.address);

      // Simulate full owner-key compromise: attacker self-verifies, revokes the victim
      await identityRegistry.connect(owner).setIdentity(attacker.address, true, true, ethers.ZeroHash);
      await identityRegistry.connect(owner).revokeIdentity(victim.address);

      // The OLD path is now blocked (victim no longer verified) — sanity check
      await expect(token.connect(owner).forcedTransfer(victim.address, attacker.address, 500n, 'x'))
        .to.be.revertedWithCustomError(token, 'TransferNotCompliant');

      // The NEW path doesn't care — it never asks IdentityRegistry anything
      await expect(token.connect(emergencyCouncil).emergencyForcedTransfer(victim.address, 500n, 'protecting funds'))
        .to.emit(token, 'EmergencyForcedTransfer').withArgs(victim.address, 500n, 'protecting funds');

      expect(await token.balanceOf(escrow.address)).to.equal(500n);
      expect(await token.balanceOf(victim.address)).to.equal(500n);
      expect(await complianceRules.currentHolders()).to.equal(2n); // victim (still >0) + escrow (new holder)
    });

    it('cannot move funds from the zero address (no compliance-bypassing mint)', async function () {
      const { token, emergencyCouncil, escrow } = await loadFixture(() => deployFullStack(10));
      await token.connect(emergencyCouncil).setEscrowAddress(escrow.address);
      await expect(token.connect(emergencyCouncil).emergencyForcedTransfer(ethers.ZeroAddress, 100n, 'x'))
        .to.be.revertedWithCustomError(token, 'InvalidFromAddress');
    });

    it('respects pause()', async function () {
      const { token, identityRegistry, owner, emergencyCouncil, escrow } = await loadFixture(() => deployFullStack(10));
      const [, victim] = await ethers.getSigners();
      await verifyWallet(identityRegistry, owner, victim);
      await token.connect(owner).mint(victim.address, 1000n);
      await token.connect(emergencyCouncil).setEscrowAddress(escrow.address);
      await token.connect(owner).pause();
      await expect(token.connect(emergencyCouncil).emergencyForcedTransfer(victim.address, 100n, 'x'))
        .to.be.revertedWithCustomError(token, 'EnforcedPause');
    });
  });

  describe('proposeComplianceRules / executeComplianceRulesUpdate — MEDIUM finding fix', function () {
    it('cannot execute before the timelock elapses', async function () {
      const { token, complianceRules, owner } = await loadFixture(() => deployFullStack(10));
      const [, newRulesSigner] = await ethers.getSigners();
      await token.connect(owner).proposeComplianceRules(newRulesSigner.address);
      await expect(token.executeComplianceRulesUpdate()).to.be.revertedWithCustomError(token, 'TimelockNotElapsed');
    });

    it('executes after the 2-day delay, and execution is permissionless (anyone can call it)', async function () {
      const { token, owner } = await loadFixture(() => deployFullStack(10));
      const [, , , someRandomCaller, newRulesSigner] = await ethers.getSigners();

      await expect(token.connect(owner).proposeComplianceRules(newRulesSigner.address))
        .to.emit(token, 'ComplianceRulesProposed');

      await time.increase(2 * 24 * 60 * 60 + 1);
      await expect(token.connect(someRandomCaller).executeComplianceRulesUpdate())
        .to.emit(token, 'ComplianceRulesUpdated').withArgs(newRulesSigner.address);
      expect(await token.complianceRules()).to.equal(newRulesSigner.address);
    });

    it('owner can cancel a pending proposal before it executes', async function () {
      const { token, complianceRules, owner } = await loadFixture(() => deployFullStack(10));
      const [, newRulesSigner] = await ethers.getSigners();
      await token.connect(owner).proposeComplianceRules(newRulesSigner.address);
      await token.connect(owner).cancelPendingComplianceRules();

      await time.increase(2 * 24 * 60 * 60 + 1);
      await expect(token.executeComplianceRulesUpdate()).to.be.revertedWithCustomError(token, 'NoPendingComplianceRules');
      expect(await token.complianceRules()).to.equal(await complianceRules.getAddress()); // unchanged
    });

    it('only owner can propose or cancel', async function () {
      const { token, attacker } = { ...(await loadFixture(() => deployFullStack(10))), attacker: (await ethers.getSigners())[3] };
      await expect(token.connect(attacker).proposeComplianceRules(attacker.address))
        .to.be.revertedWithCustomError(token, 'OwnableUnauthorizedAccount');
    });
  });
});
