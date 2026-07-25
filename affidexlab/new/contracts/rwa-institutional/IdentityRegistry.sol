// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
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
 *
 * @title IdentityRegistry
 * @notice Reference implementation of an ERC-3643-style identity registry —
 *         records a wallet's verification status and jurisdiction without
 *         storing personally identifiable information on-chain.
 */
contract IdentityRegistry is Ownable {
    struct Identity {
        bool verified;          // Has this wallet passed KYC with an approved provider?
        bytes2 countryCode;     // ISO 3166-1 alpha-2, e.g. "US", "GB" — not full PII.
        uint40 verifiedAt;      // Unix timestamp of verification, for re-verification policies.
        bool accreditedInvestor; // Self-contained flag; see NatSpec on setIdentity for caveats.
    }

    mapping(address => Identity) private _identities;

    // Addresses allowed to call setIdentity — in production this should be a small,
    // audited set of backend services tied to a real KYC provider integration, not
    // a wide-open allowlist.
    mapping(address => bool) public isVerifier;

    event IdentitySet(address indexed wallet, bytes2 countryCode, bool accreditedInvestor);
    event IdentityRevoked(address indexed wallet);
    event VerifierUpdated(address indexed verifier, bool allowed);

    error NotAVerifier();

    modifier onlyVerifier() {
        if (!isVerifier[msg.sender] && msg.sender != owner()) revert NotAVerifier();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Records the outcome of an off-chain KYC check for a wallet.
     * @dev This function does NOT perform verification itself — it records the
     *      result of a check that already happened elsewhere (your KYC provider).
     *      `accreditedInvestor` in particular must come from a real accredited-investor
     *      verification process (income/net-worth check, or a licensed third-party
     *      verifier like the ones used for Reg D offerings) — never set this from
     *      unverified self-attestation if the token relies on it for compliance.
     */
    function setIdentity(
        address wallet,
        bytes2 countryCode,
        bool accreditedInvestor
    ) external onlyVerifier {
        _identities[wallet] = Identity({
            verified: true,
            countryCode: countryCode,
            verifiedAt: uint40(block.timestamp),
            accreditedInvestor: accreditedInvestor
        });
        emit IdentitySet(wallet, countryCode, accreditedInvestor);
    }

    function revokeIdentity(address wallet) external onlyVerifier {
        delete _identities[wallet];
        emit IdentityRevoked(wallet);
    }

    function setVerifier(address verifier, bool allowed) external onlyOwner {
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
