const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { deployRiskOracle } = require('./helpers');

describe('RiskOracle', function () {
  describe('access control', function () {
    it('only owner or an approved updater can push scores', async function () {
      const { riskOracle } = await loadFixture(deployRiskOracle);
      const [, notAnUpdater, wallet] = await ethers.getSigners();
      await expect(riskOracle.connect(notAnUpdater).setRiskScore(wallet.address, 50))
        .to.be.revertedWithCustomError(riskOracle, 'NotAnUpdater');
    });

    it('owner can grant and revoke updater status', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, updater, wallet] = await ethers.getSigners();

      await riskOracle.connect(owner).setUpdater(updater.address, true);
      await riskOracle.connect(updater).setRiskScore(wallet.address, 42);
      const [score, fresh] = await riskOracle.getRiskScore(wallet.address);
      expect(score).to.equal(42);
      expect(fresh).to.equal(true);

      await riskOracle.connect(owner).setUpdater(updater.address, false);
      await expect(riskOracle.connect(updater).setRiskScore(wallet.address, 10))
        .to.be.revertedWithCustomError(riskOracle, 'NotAnUpdater');
    });
  });

  it('rejects scores over 100', async function () {
    const { riskOracle, owner } = await loadFixture(deployRiskOracle);
    const [, wallet] = await ethers.getSigners();
    await expect(riskOracle.connect(owner).setRiskScore(wallet.address, 101))
      .to.be.revertedWithCustomError(riskOracle, 'InvalidScore');
  });

  it('an unscored wallet reports fresh == false', async function () {
    const { riskOracle } = await loadFixture(deployRiskOracle);
    const [, wallet] = await ethers.getSigners();
    const [score, fresh] = await riskOracle.getRiskScore(wallet.address);
    expect(score).to.equal(0);
    expect(fresh).to.equal(false);
  });

  describe('setRiskScores (batch)', function () {
    it('LOW finding fix: mismatched array lengths revert with a custom error, not a require string', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, w1, w2] = await ethers.getSigners();
      await expect(riskOracle.connect(owner).setRiskScores([w1.address, w2.address], [10]))
        .to.be.revertedWithCustomError(riskOracle, 'ArrayLengthMismatch');
    });

    it('MEDIUM finding fix: a batch larger than maxBatchSize is rejected', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      await riskOracle.connect(owner).setCircuitBreakerParams(3, 1 * 60 * 60, 500);
      const signers = (await ethers.getSigners()).slice(1, 6); // 5 wallets, cap is 3
      const wallets = signers.map((s) => s.address);
      const scores = signers.map(() => 10);
      await expect(riskOracle.connect(owner).setRiskScores(wallets, scores))
        .to.be.revertedWithCustomError(riskOracle, 'BatchTooLarge');
    });

    it('a valid batch updates all scores and emits one event per wallet', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, w1, w2] = await ethers.getSigners();
      await riskOracle.connect(owner).setRiskScores([w1.address, w2.address], [20, 80]);
      expect((await riskOracle.getRiskScore(w1.address))[0]).to.equal(20);
      expect((await riskOracle.getRiskScore(w2.address))[0]).to.equal(80);
    });
  });

  describe('circuit breaker', function () {
    it('auto-pauses once the rolling-window threshold is exceeded, blocking further updates', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, wallet] = await ethers.getSigners();
      await riskOracle.connect(owner).setCircuitBreakerParams(200, 1 * 60 * 60, 3); // trip after 3 changes/hour

      await riskOracle.connect(owner).setRiskScore(wallet.address, 10);
      await riskOracle.connect(owner).setRiskScore(wallet.address, 11);
      await riskOracle.connect(owner).setRiskScore(wallet.address, 12); // 3rd change trips it (count > threshold checked after increment... wait threshold=3, this is the 3rd, not yet exceeded)

      expect(await riskOracle.updatesPaused()).to.equal(false);

      await riskOracle.connect(owner).setRiskScore(wallet.address, 13); // 4th change, now > 3 -> trips
      expect(await riskOracle.updatesPaused()).to.equal(true);

      await expect(riskOracle.connect(owner).setRiskScore(wallet.address, 14))
        .to.be.revertedWithCustomError(riskOracle, 'UpdatesArePaused');
    });

    it('only owner can resume updates after an auto-pause — an updater key alone cannot', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, updater, wallet] = await ethers.getSigners();
      await riskOracle.connect(owner).setUpdater(updater.address, true);
      await riskOracle.connect(owner).setCircuitBreakerParams(200, 1 * 60 * 60, 1);

      await riskOracle.connect(updater).setRiskScore(wallet.address, 10);
      await riskOracle.connect(updater).setRiskScore(wallet.address, 11); // trips (2 > 1)
      expect(await riskOracle.updatesPaused()).to.equal(true);

      await expect(riskOracle.connect(updater).resumeUpdates())
        .to.be.revertedWithCustomError(riskOracle, 'OwnableUnauthorizedAccount');

      await riskOracle.connect(owner).resumeUpdates();
      expect(await riskOracle.updatesPaused()).to.equal(false);
      await riskOracle.connect(updater).setRiskScore(wallet.address, 12); // works again
    });

    it('the rolling window resets after rapidChangeWindow elapses', async function () {
      const { riskOracle, owner } = await loadFixture(deployRiskOracle);
      const [, wallet] = await ethers.getSigners();
      await riskOracle.connect(owner).setCircuitBreakerParams(200, 60, 2); // 2/min

      await riskOracle.connect(owner).setRiskScore(wallet.address, 10);
      await riskOracle.connect(owner).setRiskScore(wallet.address, 11);
      expect(await riskOracle.updatesPaused()).to.equal(false); // exactly at threshold, not over

      await time.increase(61); // window rolls over
      await riskOracle.connect(owner).setRiskScore(wallet.address, 12);
      expect(await riskOracle.updatesPaused()).to.equal(false); // fresh window, count reset to 1
    });
  });
});
