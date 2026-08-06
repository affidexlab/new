// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ██  UNAUDITED REFERENCE IMPLEMENTATION — DO NOT USE FOR REAL SECURITIES  ██
 * See IdentityRegistry.sol for the full pre-production checklist. It applies here too.
 * Read this file's NatSpec fully before assuming it does more than it does.
 *
 * @title ZKIdentityGate
 * @notice Roadmap Phase 2 ("ZK-Proof Integration... using tools like Sismo or
 *         Polygon ID"). Being precise about what's actually here:
 *
 *         This integrates the REAL, audited Semaphore protocol (semaphore-protocol's
 *         published contracts package) — not a mock, not custom cryptography written
 *         for this project. Semaphore lets a wallet prove "I am a member of the
 *         verified-investor group" without revealing WHICH member they are. That is
 *         genuine zero-knowledge identity, using a widely-used, independently audited
 *         library rather than bespoke circuits this codebase can't properly verify.
 *
 *         WHAT THIS DOES NOT RESOLVE — real protocol design decisions, not code gaps:
 *
 *         1. How commitments get into the group. `addToVerifiedGroup` takes an
 *            identity commitment your KYC provider's off-chain flow produces. This
 *            contract has no opinion on which KYC provider, how PII maps to a
 *            commitment, or how a user's client generates their Semaphore identity —
 *            that's a real product decision, not a default this scaffold can pick.
 *
 *         2. How this relates to IdentityRegistry.sol. The existing IdentityRegistry
 *            is wallet-keyed and NOT anonymous by design (anyone can look up any
 *            wallet's status). This contract is deliberately separate rather than
 *            silently merged into it, because "make KYC anonymous" and "make KYC
 *            checkable per-wallet by a compliance contract" are in real tension —
 *            reconciling them (e.g., binding a proof's `message` field to msg.sender
 *            for a specific transfer, vs. keeping full anonymity) is a decision for
 *            whoever owns the compliance requirements, not something to default
 *            silently in either direction.
 *
 *         3. Gas cost and UX for generating proofs client-side is real and non-trivial
 *            — Semaphore proof generation happens off-chain (in the user's browser or
 *            app, via semaphore-protocol's proof-generation library), this contract
 *            only verifies.
 */
contract ZKIdentityGate is Ownable {
    ISemaphore public immutable semaphore;
    uint256 public immutable groupId;

    mapping(address => bool) public isKYCAdmin;

    /// @notice True once `wallet` has submitted at least one valid, self-bound proof
    /// of group membership. Added for the Guardian audit's HIGH "lacks Proof-to-
    /// Wallet Binding" finding so other contracts have something queryable — see
    /// verifyCompliance's NatSpec for what "self-bound" means and why it matters.
    mapping(address => bool) public hasVerifiedCompliance;

    /// @notice The nullifier from `wallet`'s most recent successful verification —
    /// exposed alongside hasVerifiedCompliance in case a caller wants to distinguish
    /// "verified once, a while ago" from "verified again just now" without re-parsing
    /// event logs.
    mapping(address => uint256) public lastVerifiedNullifier;

    event MemberAdded(uint256 identityCommitment);
    event MemberRemoved(uint256 identityCommitment);
    event ComplianceProofVerified(uint256 indexed nullifier, uint256 message);
    event KYCAdminUpdated(address indexed admin, bool allowed);

    error NotKYCAdmin();
    error ProofNotBoundToCaller();

    modifier onlyKYCAdmin() {
        if (!isKYCAdmin[msg.sender] && msg.sender != owner()) revert NotKYCAdmin();
        _;
    }

    /// @param _semaphore Address of a deployed Semaphore.sol instance (the real
    ///        protocol contract, not something this file deploys itself — either
    ///        point at a canonical deployment on your target chain, or deploy your
    ///        own Semaphore + SemaphoreVerifier from the same npm package).
    constructor(ISemaphore _semaphore, address initialOwner) Ownable(initialOwner) {
        semaphore = _semaphore;
        groupId = _semaphore.createGroup(address(this));
    }

    function setKYCAdmin(address admin, bool allowed) external onlyOwner {
        isKYCAdmin[admin] = allowed;
        emit KYCAdminUpdated(admin, allowed);
    }

    /// @notice Adds a verified investor's identity commitment to the anonymity set.
    /// @param identityCommitment Computed off-chain from the investor's own Semaphore
    ///        identity secret — this contract never sees the secret, only the
    ///        commitment, which is the whole point of the "zero-knowledge" part.
    function addToVerifiedGroup(uint256 identityCommitment) external onlyKYCAdmin {
        semaphore.addMember(groupId, identityCommitment);
        emit MemberAdded(identityCommitment);
    }

    function addManyToVerifiedGroup(uint256[] calldata identityCommitments) external onlyKYCAdmin {
        semaphore.addMembers(groupId, identityCommitments);
    }

    function removeFromVerifiedGroup(uint256 identityCommitment, uint256[] calldata merkleProofSiblings) external onlyKYCAdmin {
        semaphore.removeMember(groupId, identityCommitment, merkleProofSiblings);
        emit MemberRemoved(identityCommitment);
    }

    /**
     * @notice Verifies a real Semaphore proof of group membership and records the
     *         nullifier to prevent replay. Delegates the actual cryptographic
     *         verification entirely to Semaphore's audited verifier — this contract
     *         does no proof math itself.
     * @dev Guardian audit HIGH "lacks Proof-to-Wallet Binding": previously this
     *      accepted any valid proof from any caller, so a submission generated for
     *      (or broadcast by) one wallet could be resubmitted by a completely
     *      different msg.sender and still pass — the proof was valid, but not
     *      actually tied to whoever was presenting it. Now requires
     *      `proof.message == uint256(uint160(msg.sender))`: callers MUST set the
     *      Semaphore proof's message field to their own address when generating the
     *      proof client-side. Because `message` is a public input baked into the
     *      proof itself, nobody can alter it to a different address after the fact
     *      without invalidating the proof — so a proof bound to wallet A cannot be
     *      replayed by wallet B. This does not deanonymize which GROUP MEMBER
     *      submitted it (that's still hidden, which is the actual zero-knowledge
     *      property Semaphore provides) — it only ties a given submission to the
     *      address that presented it, which is what makes hasVerifiedCompliance
     *      below meaningful to record at all.
     *      Still deliberately NOT wired into IdentityRegistry/ComplianceRules — per
     *      the class-level NatSpec, whether/how to merge anonymous ZK verification
     *      with the wallet-keyed compliance flow is a product decision, not
     *      something this hardening pass should default silently. This just makes
     *      the verification result queryable so that decision can be made later.
     */
    function verifyCompliance(ISemaphore.SemaphoreProof calldata proof) external returns (bool) {
        if (proof.message != uint256(uint160(msg.sender))) revert ProofNotBoundToCaller();

        semaphore.validateProof(groupId, proof);

        hasVerifiedCompliance[msg.sender] = true;
        lastVerifiedNullifier[msg.sender] = proof.nullifier;

        emit ComplianceProofVerified(proof.nullifier, proof.message);
        return true;
    }
}
