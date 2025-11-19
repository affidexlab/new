import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
      
      <Card className="p-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">
            Last Updated: November 18, 2025
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using DECAFLOW ("the Protocol"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, do not use the Protocol.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use the Protocol. The Protocol is not available to:
          </p>
          <ul>
            <li>Residents or citizens of the United States</li>
            <li>Residents of countries or territories subject to comprehensive sanctions (e.g., Cuba, Iran, North Korea, Syria, Crimea)</li>
            <li>Individuals or entities on OFAC or other sanctions lists</li>
          </ul>
          <p>
            By using the Protocol, you represent and warrant that you meet these eligibility requirements.
          </p>

          <h2>3. No Financial Advice</h2>
          <p>
            The Protocol is provided for informational and transactional purposes only. Nothing on this site constitutes
            financial, investment, legal, or tax advice. You are solely responsible for determining whether any transaction
            is appropriate for you based on your personal objectives, financial circumstances, and risk tolerance.
          </p>

          <h2>4. Non-Custodial Protocol</h2>
          <p>
            DECAFLOW is a non-custodial protocol. We do not have access to, custody, or control over your funds at any time.
            You are solely responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your wallet and private keys</li>
            <li>All transactions you execute using the Protocol</li>
            <li>Any losses incurred from compromised wallets or unauthorized access</li>
          </ul>

          <h2>5. Smart Contract Risks</h2>
          <p>
            Transactions on the Protocol interact with third-party smart contracts and decentralized protocols.
            These interactions carry inherent risks, including but not limited to:
          </p>
          <ul>
            <li>Smart contract vulnerabilities and exploits</li>
            <li>Loss of funds due to bugs or malicious code</li>
            <li>Network congestion and failed transactions</li>
            <li>Slippage and price impact during swaps</li>
            <li>Impermanent loss in liquidity pools</li>
          </ul>
          <p>
            You acknowledge and accept these risks and agree that the Protocol operators are not liable for any losses.
          </p>

          <h2>6. No Warranty</h2>
          <p>
            The Protocol is provided "as is" without warranties of any kind, either express or implied. We do not warrant that:
          </p>
          <ul>
            <li>The Protocol will operate uninterrupted or error-free</li>
            <li>Defects will be corrected</li>
            <li>The Protocol is free from viruses or harmful components</li>
            <li>Results from using the Protocol will be accurate or reliable</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the Protocol operators shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
            or any loss of data, use, goodwill, or other intangible losses resulting from:
          </p>
          <ul>
            <li>Your use or inability to use the Protocol</li>
            <li>Unauthorized access to or alteration of your wallet or transactions</li>
            <li>Any conduct or content of third parties on the Protocol</li>
            <li>Any content obtained from the Protocol</li>
          </ul>

          <h2>8. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless the Protocol operators from any claims, losses, damages, liabilities,
            and expenses (including attorneys' fees) arising out of or related to your:
          </p>
          <ul>
            <li>Use of the Protocol</li>
            <li>Violation of these Terms</li>
            <li>Violation of any rights of another party</li>
            <li>Violation of any applicable laws or regulations</li>
          </ul>

          <h2>9. Privacy</h2>
          <p>
            The Protocol does not collect personal information. Your wallet address and transaction history are publicly visible
            on the blockchain. See our <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a> for more details.
          </p>

          <h2>10. Third-Party Services</h2>
          <p>
            The Protocol integrates with third-party services including but not limited to:
          </p>
          <ul>
            <li>0x Protocol for swap aggregation</li>
            <li>CoW Protocol for intent-based trading</li>
            <li>Chainlink CCIP and Circle CCTP for bridging</li>
            <li>Socket for multi-protocol routing</li>
            <li>Flashbots Protect for MEV protection</li>
          </ul>
          <p>
            These services have their own terms and policies. We are not responsible for their availability, accuracy, or performance.
          </p>

          <h2>11. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting.
            Your continued use of the Protocol after changes constitutes acceptance of the modified Terms.
          </p>

          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where the Protocol
            operators are based, without regard to conflict of law principles. Any disputes shall be resolved through binding
            arbitration in accordance with the rules of the applicable arbitration association.
          </p>

          <h2>13. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated
            to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions or concerns about these Terms, please contact us at legal@decaflow.vercel.app.
          </p>
        </div>
      </Card>
    </div>
  );
}
