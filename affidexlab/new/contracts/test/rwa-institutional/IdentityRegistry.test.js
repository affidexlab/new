const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { deployIdentityRegistry } = require('./helpers');

describe('IdentityRegistry', function () {
  it('owner is an implicit verifier and can set an identity', async function () {
    const { identityRegistry, owner } = await loadFixture(deployIdentityRegistry);
    const [, wallet] = await ethers.getSigners();

    await expect(identityRegistry.connect(owner).setIdentity(wallet.address, true, true, ethers.ZeroHash))
      .to.emit(identityRegistry, 'IdentitySet')
      .withArgs(wallet.address, true, true, ethers.ZeroHash);

    expect(await identityRegistry.isVerified(wallet.address)).to.equal(true);
    const identity = await identityRegistry.getIdentity(wallet.address);
    expect(identity.verified).to.equal(true);
    expect(identity.jurisdictionEligible).to.equal(true);
    expect(identity.accreditedInvestor).to.equal(true);
  });

  it('a non-verifier, non-owner address cannot set an identity', async function () {
    const { identityRegistry } = await loadFixture(deployIdentityRegistry);
    const [, attacker, victim] = await ethers.getSigners();

    await expect(
      identityRegistry.connect(attacker).setIdentity(victim.address, true, true, ethers.ZeroHash)
    ).to.be.revertedWithCustomError(identityRegistry, 'NotAVerifier');
  });

  it('owner can grant verifier status to another address, which can then set identities', async function () {
    const { identityRegistry, owner } = await loadFixture(deployIdentityRegistry);
    const [, verifier, wallet] = await ethers.getSigners();

    await expect(identityRegistry.connect(owner).setVerifier(verifier.address, true))
      .to.emit(identityRegistry, 'VerifierUpdated').withArgs(verifier.address, true);

    await identityRegistry.connect(verifier).setIdentity(wallet.address, true, false, ethers.ZeroHash);
    expect(await identityRegistry.isVerified(wallet.address)).to.equal(true);

    // Revoking verifier status takes it away again
    await identityRegistry.connect(owner).setVerifier(verifier.address, false);
    await expect(
      identityRegistry.connect(verifier).setIdentity(wallet.address, true, false, ethers.ZeroHash)
    ).to.be.revertedWithCustomError(identityRegistry, 'NotAVerifier');
  });

  it('revokeIdentity clears a wallet back to unverified', async function () {
    const { identityRegistry, owner } = await loadFixture(deployIdentityRegistry);
    const [, wallet] = await ethers.getSigners();

    await identityRegistry.connect(owner).setIdentity(wallet.address, true, true, ethers.ZeroHash);
    expect(await identityRegistry.isVerified(wallet.address)).to.equal(true);

    await expect(identityRegistry.connect(owner).revokeIdentity(wallet.address))
      .to.emit(identityRegistry, 'IdentityRevoked').withArgs(wallet.address);

    expect(await identityRegistry.isVerified(wallet.address)).to.equal(false);
    const identity = await identityRegistry.getIdentity(wallet.address);
    expect(identity.jurisdictionEligible).to.equal(false); // struct fully cleared, not just `verified`
  });

  it('a wallet that was never set is unverified by default', async function () {
    const { identityRegistry } = await loadFixture(deployIdentityRegistry);
    const [, someone] = await ethers.getSigners();
    expect(await identityRegistry.isVerified(someone.address)).to.equal(false);
  });
});
