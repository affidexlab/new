const { ethers } = require('hardhat');

/**
 * Shared fixtures for the rwa-institutional test suite. Each returns freshly
 * deployed contracts wired together, for use with hardhat-network-helpers'
 * loadFixture (snapshot/revert between tests, so tests don't leak state into
 * each other and don't re-pay deployment gas every time).
 */

async function deployIdentityRegistry() {
  const [owner] = await ethers.getSigners();
  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry');
  const identityRegistry = await IdentityRegistry.deploy(owner.address);
  await identityRegistry.waitForDeployment();
  return { identityRegistry, owner };
}

async function deployComplianceRules(maxHolders = 10) {
  const { identityRegistry, owner } = await deployIdentityRegistry();
  const ComplianceRules = await ethers.getContractFactory('ComplianceRules');
  const complianceRules = await ComplianceRules.deploy(owner.address, await identityRegistry.getAddress(), maxHolders);
  await complianceRules.waitForDeployment();
  return { identityRegistry, complianceRules, owner };
}

/**
 * Full stack: IdentityRegistry -> ComplianceRules -> RWAToken, wired together
 * (setToken called), with emergencyCouncil/escrow as separate named signers.
 */
async function deployFullStack(maxHolders = 10) {
  const [owner, emergencyCouncil, escrow, ...rest] = await ethers.getSigners();
  const { identityRegistry, complianceRules } = await deployComplianceRules(maxHolders);

  const RWAToken = await ethers.getContractFactory('RWAToken');
  const token = await RWAToken.deploy(
    'RWA Test Token', 'RWAT', owner.address, await complianceRules.getAddress(), emergencyCouncil.address
  );
  await token.waitForDeployment();
  await complianceRules.connect(owner).setToken(await token.getAddress());

  return { identityRegistry, complianceRules, token, owner, emergencyCouncil, escrow, rest };
}

async function deployRiskOracle() {
  const [owner] = await ethers.getSigners();
  const RiskOracle = await ethers.getContractFactory('RiskOracle');
  const riskOracle = await RiskOracle.deploy(owner.address);
  await riskOracle.waitForDeployment();
  return { riskOracle, owner };
}

/** Verifies `wallet` in IdentityRegistry with sensible defaults, as `owner` (who is always an implicit verifier). */
async function verifyWallet(identityRegistry, owner, wallet, { jurisdictionEligible = true, accreditedInvestor = false, evidenceHash = ethers.ZeroHash } = {}) {
  await identityRegistry.connect(owner).setIdentity(wallet.address, jurisdictionEligible, accreditedInvestor, evidenceHash);
}

module.exports = { deployIdentityRegistry, deployComplianceRules, deployFullStack, deployRiskOracle, verifyWallet };
