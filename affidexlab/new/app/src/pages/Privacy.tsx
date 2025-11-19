import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
      
      <Card className="p-8">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">
            Last Updated: November 18, 2025
          </p>

          <h2>1. Overview</h2>
          <p>
            DECAFLOW is a non-custodial, decentralized trading protocol. This Privacy Policy explains how we handle
            information related to your use of the Protocol.
          </p>

          <h2>2. Information We Do Not Collect</h2>
          <p>
            As a non-custodial protocol, we do not collect, store, or process:
          </p>
          <ul>
            <li>Your name, email address, or other personal identifiers</li>
            <li>Your private keys or seed phrases</li>
            <li>Your wallet passwords or authentication credentials</li>
            <li>Your transaction history beyond what is publicly available on-chain</li>
          </ul>

          <h2>3. Information Automatically Collected</h2>
          <p>
            When you use the Protocol, certain information may be automatically collected:
          </p>
          
          <h3>Blockchain Data</h3>
          <ul>
            <li><strong>Wallet Addresses:</strong> Your public wallet address is visible when you interact with smart contracts</li>
            <li><strong>Transaction Data:</strong> All transactions are recorded on public blockchains (Arbitrum, Base, Optimism, Polygon)</li>
            <li><strong>Token Balances:</strong> Token holdings in your wallet are publicly visible on-chain</li>
          </ul>

          <h3>Usage Analytics (Optional)</h3>
          <p>
            We may use privacy-respecting analytics tools to collect aggregate, non-identifying information about how the Protocol is used:
          </p>
          <ul>
            <li>Pages visited</li>
            <li>Features used (swap, bridge, pools)</li>
            <li>Network selected</li>
            <li>General geographic region (country-level, not precise location)</li>
          </ul>
          <p>
            This data is anonymized and cannot be linked to your wallet address or identity.
          </p>

          <h3>IP Address and Geolocation</h3>
          <p>
            To enforce regional restrictions (e.g., blocking US users), we may temporarily check your IP address to determine your
            approximate geographic location. This information is not stored or linked to your wallet.
          </p>

          <h2>4. How We Use Information</h2>
          <p>
            Information collected is used only to:
          </p>
          <ul>
            <li>Enable Protocol functionality (routing transactions, fetching quotes)</li>
            <li>Enforce geographic restrictions required by our Terms of Service</li>
            <li>Improve Protocol performance and user experience</li>
            <li>Detect and prevent fraud, spam, or abuse</li>
            <li>Comply with legal obligations if required</li>
          </ul>

          <h2>5. Third-Party Services</h2>
          <p>
            The Protocol integrates with third-party services that may collect information independently:
          </p>
          
          <h3>RPC Providers</h3>
          <p>
            Your wallet connects to blockchain networks via RPC providers (e.g., Infura, Alchemy, public nodes).
            These providers may log IP addresses and request metadata.
          </p>

          <h3>DEX Aggregators</h3>
          <ul>
            <li><strong>0x Protocol:</strong> Swap quotes are fetched from 0x API, which may log request metadata</li>
            <li><strong>CoW Protocol:</strong> Intent submissions are sent to CoW's solver network</li>
            <li><strong>Socket:</strong> Bridge quotes are fetched from Socket API</li>
          </ul>

          <h3>WalletConnect</h3>
          <p>
            If you use WalletConnect to connect your wallet, WalletConnect may collect session metadata to facilitate connections.
          </p>

          <h3>Analytics</h3>
          <p>
            We may use privacy-focused analytics tools (e.g., Plausible, Fathom) that do not use cookies or track individual users.
          </p>

          <h2>6. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your information with third parties except:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party APIs and infrastructure providers necessary to operate the Protocol</li>
            <li><strong>Legal Compliance:</strong> If required by law, regulation, or valid legal process</li>
            <li><strong>Blockchain Networks:</strong> Transaction data is inherently public on blockchain networks</li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            As a non-custodial protocol, we do not store sensitive user data. However, you are responsible for:
          </p>
          <ul>
            <li>Securing your wallet and private keys</li>
            <li>Using secure, trusted RPC endpoints</li>
            <li>Verifying contract addresses before approving transactions</li>
            <li>Keeping your devices and browsers secure</li>
          </ul>

          <h2>8. Cookies and Local Storage</h2>
          <p>
            The Protocol may use browser local storage to:
          </p>
          <ul>
            <li>Remember your preferences (theme, slippage settings)</li>
            <li>Cache token lists and logos for faster loading</li>
            <li>Store session data for wallet connection</li>
          </ul>
          <p>
            No personal information is stored in cookies or local storage.
          </p>

          <h2>9. Your Rights</h2>
          <p>
            Since we do not collect personal information:
          </p>
          <ul>
            <li><strong>Access:</strong> All blockchain data is publicly accessible via block explorers</li>
            <li><strong>Deletion:</strong> Blockchain transactions are immutable and cannot be deleted</li>
            <li><strong>Portability:</strong> You control your wallet and can export data at any time</li>
            <li><strong>Opt-Out:</strong> You can block analytics by using privacy tools or browser extensions</li>
          </ul>

          <h2>10. Children's Privacy</h2>
          <p>
            The Protocol is not intended for users under 18 years of age. We do not knowingly collect information from minors.
          </p>

          <h2>11. International Users</h2>
          <p>
            The Protocol is hosted on decentralized infrastructure and blockchain networks. By using the Protocol, you consent
            to your information being processed globally, including in jurisdictions with different data protection laws.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
            Continued use of the Protocol constitutes acceptance of the updated policy.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about this Privacy Policy, please contact us at privacy@decaflow.vercel.app.
          </p>
        </div>
      </Card>
    </div>
  );
}
