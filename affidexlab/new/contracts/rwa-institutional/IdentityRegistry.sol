// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
 *
 * Status update: Guardian Enterprises' 31 Jul 2026 findings against the OTHER files
 * in this folder (RWAToken.sol, ComplianceRules.sol, RiskOracle.sol,
 * ZKIdentityGate.sol) have been remediated — see README.md. This file itself wasn't
 * a Guardian finding target, and item 5 below (multi-sig for the owner role) is
 * still open. Remediating other files' findings is not the same as an audit or
 * re-audit of this one. Still not for real securities.
 *
 * This is a starting point for the roadmap's Phase 1-2 (Identity Layer), not a
 * finished product. Before this — or anything built on top of it — touches a
 * real securities offering, it needs, at minimum:
 *   1. A professional smart contract security audit.
 *   2. Review by securities counsel in every jurisdiction the offering touches.
 *   3. A real KYC/identity verification provider behind `setIdentity` — this
 *      contract only records a status; it verifies nothing on its own.
 *   4. A decision on ZK-proof integration (Phase 2's stated mid-term goal) if
 *      you don't want raw jurisdiction/status data sitting on a public chain.
 *   5. Real key management for the owner role — a single EOA owner (as scaffolded
 *      here) is not appropriate for production; use a multi-sig.
 *   6. A real off-chain "Compliance Vault" that `evidenceHash` below can be
 *      checked against — this contract only stores the commitment, not the
 *      underlying KYC/accreditation record that hash is supposed to anchor.
 *
 * @title IdentityRegistry
 * @notice Reference implementation of an ERC-3643-style identity registry.
 *
 *         Revision note: earlier version of this contract stored a raw ISO
 *         country code on-chain. Changed after external counsel review flagged
 *         two real problems with that: (1) a country code, while not a name or
 *         passport number, is still personal data under GDPR once combined with
 *         a public wallet address, and blockchain immutability makes the "right
 *         to erasure" impossible to honor for data already written; (2) a single
 *         country code is legally inadequate for Regulation S "U.S. person"
 *         determinations anyway, which turn on residency, domicile,
 *         incorporation, AND physical location at time of purchase — nuance a
 *         smart contract was never the right place to encode.
 *
 *         Now: `jurisdictionEligible` is a single yes/no conclusion, computed
 *         OFF-CHAIN by whoever actually has the full residency/domicile/
 *         incorporation/location picture for a specific offering's rules — the
 *         chain only records the answer, not the reasoning or the underlying
 *         data. `evidenceHash` is a commitment to whatever off-chain record
 *         (KYC documents, accreditation verification method, the jurisdiction
 *         determination itself) justified this wallet's status, so it can be
 *         proven against later without ever having lived on a public ledger.
 */
contract IdentityRegistry is Ownable {
    struct Identity {
        bool verified;              // Has this wallet passed KYC with an approved provider?
        bool jurisdictionEligible;  // Off-chain-determined: eligible for this offering's jurisdiction rules? No raw country/residency data stored here — see class NatSpec.
        bool accreditedInvestor;    // Still a flag; see setIdentity's NatSpec for why evidenceHash matters more here than the boolean itself.
        bytes32 evidenceHash;       // keccak256 commitment to the off-chain record backing the three fields above. Never the record itself.
        uint40 verifiedAt;          // Unix timestamp of verification, for re-verification policies.
    }

    mapping(address => Identity) private _identities;

    // Addresses allowed to call setIdentity — in production this should be a small,
    // audited set of backend services tied to a real KYC provider integration, not
    // a wide-open allowlist.
    mapping(address => bool) public isVerifier;

    event IdentitySet(address indexed wallet, bool jurisdictionEligible, bool accreditedInvestor, bytes32 evidenceHash);
    event IdentityRevoked(address indexed wallet);
    event VerifierUpdated(address indexed verifier, bool allowed);

    error NotAVerifier();
    error ZeroAddress();
    error EmptyEvidenceHash();

    modifier onlyVerifier() {
        if (!isVerifier[msg.sender] && msg.sender != owner()) revert NotAVerifier();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Records the outcome of an off-chain KYC/jurisdiction/accreditation
     *         check for a wallet. Does NOT perform any of those checks itself.
     * @param jurisdictionEligible The off-chain conclusion of whether this wallet
     *        is currently eligible under this offering's jurisdiction rules
     *        (Reg S, Reg D, or whatever else applies) — compute this considering
     *        residency, domicile, incorporation, and location, not just a country
     *        field, per counsel's guidance. This contract has no way to enforce
     *        that you did that correctly; it only records that you're asserting it.
     * @param accreditedInvestor Must come from a real accredited-investor
     *        verification process (income/net-worth check, or a licensed
     *        third-party verifier) if this offering relies on Rule 506(c) —
     *        never set this from unverified self-attestation in that case.
     * @param evidenceHash keccak256 commitment to the actual off-chain record
     *        (documents, verification method, timestamps) that justifies the two
     *        flags above. Store the real record in an off-chain compliance vault,
     *        not on any chain — this hash is what lets you later prove which
     *        record backed a given on-chain status, without exposing the record.
     */
    function setIdentity(
        address wallet,
        bool jurisdictionEligible,
        bool accreditedInvestor,
        bytes32 evidenceHash
    ) external onlyVerifier {
        if (wallet == address(0)) revert ZeroAddress();
        if (evidenceHash == bytes32(0)) revert EmptyEvidenceHash();

        _identities[wallet] = Identity({
            verified: true,
            jurisdictionEligible: jurisdictionEligible,
            accreditedInvestor: accreditedInvestor,
            evidenceHash: evidenceHash,
            verifiedAt: uint40(block.timestamp)
        });
        emit IdentitySet(wallet, jurisdictionEligible, accreditedInvestor, evidenceHash);
    }

    function revokeIdentity(address wallet) external onlyVerifier {
        if (wallet == address(0)) revert ZeroAddress();
        delete _identities[wallet];
        emit IdentityRevoked(wallet);
    }

    function setVerifier(address verifier, bool allowed) external onlyOwner {
        if (verifier == address(0)) revert ZeroAddress();
        isVerifier[verifier] = allowed;
        emit VerifierUpdated(verifier, allowed);
    }

    function isVerified(address wallet) external view returns (bool) {
        return _identities[wallet].verified;
    }

    function getIdentity(address wallet) external view returns (Identity memory) {
        return _identities[wallet];
    }
}
