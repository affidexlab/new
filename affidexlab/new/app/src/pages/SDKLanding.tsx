import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Code2, Shield, Zap, Github, BookOpen, Terminal, Menu, X } from "lucide-react";

export default function SDKLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] text-white">
      <nav className="fixed top-0 w-full bg-[#0A0E27]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/decaflow-logo.svg" alt="DecaFlow" className="h-8" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}/>
              <div>
                <div className="font-bold text-xl">DecaFlow SDK</div>
                <div className="text-xs text-gray-400">Privacy Protection for DeFi</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm hover:text-purple-400 transition">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm hover:text-purple-400 transition">Pricing</button>
              <button onClick={() => scrollToSection('docs')} className="text-sm hover:text-purple-400 transition">Docs</button>
              <a href="https://github.com/decaflow" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition">GitHub</a>
              <Button onClick={() => window.open('https://docs.decaflow.xyz/sdk', '_blank')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View Docs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block text-sm hover:text-purple-400 transition">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="block text-sm hover:text-purple-400 transition">Pricing</button>
              <button onClick={() => scrollToSection('docs')} className="block text-sm hover:text-purple-400 transition">Docs</button>
              <a href="https://github.com/decaflow" target="_blank" rel="noopener noreferrer" className="block text-sm hover:text-purple-400 transition">GitHub</a>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
              🔒 Open Source • Multi-Language • Free Forever
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              MEV Protection for Your Protocol in 5 Minutes
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Open-source SDK. Multi-language support. Free forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button onClick={() => window.open('https://docs.decaflow.xyz/sdk/quickstart', '_blank')} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => window.open('https://calendly.com/decaflow/integration', '_blank')} variant="outline" size="lg" className="border-purple-500/30 hover:bg-purple-500/10 text-lg px-8 py-6">
                Schedule Integration Call
              </Button>
            </div>

            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Quick Install</span>
              </div>
              <div className="bg-black/40 rounded-xl p-6 font-mono text-left text-sm md:text-base overflow-x-auto">
                <div className="text-gray-500"># npm</div>
                <div className="text-purple-400">npm install @decaflow/privacy-sdk</div>
                <div className="text-gray-500 mt-4"># yarn</div>
                <div className="text-purple-400">yarn add @decaflow/privacy-sdk</div>
                <div className="text-gray-500 mt-4"># pip</div>
                <div className="text-purple-400">pip install decaflow-sdk</div>
              </div>
            </div>
          </div>

          <div id="problem" className="mb-20">
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">The Problem</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-red-400 mb-2">$6.24M</div>
                  <div className="text-gray-300">MEV extracted on Arbitrum last month</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-orange-400 mb-2">188k+</div>
                  <div className="text-gray-300">Transactions affected</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">$33</div>
                  <div className="text-gray-300">Average loss per victim</div>
                </div>
              </div>

              <div className="text-center text-xl text-gray-300">
                <p className="mb-2">Your users are bleeding value to bots</p>
                <p className="text-2xl font-bold text-red-400">Every sandwich attack = unhappy user</p>
              </div>
            </div>
          </div>

          <div id="solution" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">The Solution</h2>
            
            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 md:p-12 mb-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">TypeScript/JavaScript</h3>
                  <div className="bg-black/40 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300">{`import { DecaFlowSDK } from '@decaflow/privacy-sdk';

const sdk = new DecaFlowSDK({ apiKey: 'your_key' });

const quote = await sdk.getPrivacySwapQuote({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amount: '1000000000000000000'
});

await sdk.executePrivacySwap(quote);`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 text-pink-400">Python</h3>
                  <div className="bg-black/40 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300">{`from decaflow import DecaFlowClient

client = DecaFlowClient(api_key="your_key")

quote = client.get_privacy_swap_quote(
    token_in="0x...",
    token_out="0x...",
    amount="1000000000000000000"
)

client.execute_privacy_swap(quote)`}</pre>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-2xl font-bold text-green-400">That's it. MEV protection deployed.</p>
              </div>
            </div>
          </div>

          <div id="features" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition">
                <Code2 className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Multi-Language Support</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> TypeScript/JavaScript</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Python</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Solidity</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> React Hooks</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition">
                <Shield className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Advanced Protection</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> CoW Protocol integration</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Real-time risk scoring</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Transaction privacy</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Frontrunning protection</li>
                </ul>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition">
                <Zap className="h-12 w-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Zero Maintenance</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Auto-updates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> 99.9% uptime SLA</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> Managed infrastructure</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> 24/7 monitoring</li>
                </ul>
              </div>
            </div>
          </div>

          <div id="who-uses" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Who's Using It</h2>
            
            <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-12 text-center">
              <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Be the First
              </div>
              <p className="text-xl text-gray-300 mb-8">
                Join the first wave of protocols protecting their users from MEV
              </p>
              <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                  <div className="text-gray-400">Protocols</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                  <div className="text-gray-400">Users Protected</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">$0</div>
                  <div className="text-gray-400">Volume Protected</div>
                </div>
              </div>
            </div>
          </div>

          <div id="pricing" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">FREE</div>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-gray-400">/forever</span></div>
                <p className="text-gray-300 mb-6">Perfect for getting started</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Full functionality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Unlimited usage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Community support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">"Powered by DecaFlow" badge</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://docs.decaflow.xyz/sdk/quickstart', '_blank')} className="w-full bg-purple-600 hover:bg-purple-700">
                  Get Started
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border-2 border-purple-500/50 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
                
                <div className="text-sm font-bold text-purple-400 mb-2">PREMIUM</div>
                <div className="text-4xl font-bold mb-4">$500<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-300 mb-6">For established protocols</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">White-label (remove branding)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Priority support (24hr SLA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Custom routing logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Advanced analytics</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/premium', '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Contact Sales
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">ENTERPRISE</div>
                <div className="text-4xl font-bold mb-4">Custom</div>
                <p className="text-gray-300 mb-6">For top-tier protocols</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Custom features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">SLA guarantees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Co-marketing support</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/enterprise', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>

          <div id="docs" className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Developer Resources</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <a href="https://docs.decaflow.xyz/sdk" target="_blank" rel="noopener noreferrer" className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition group">
                <BookOpen className="h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-2xl font-bold mb-2">Documentation</h3>
                <p className="text-gray-300">Complete guides, API references, and examples</p>
              </a>

              <a href="https://github.com/decaflow/privacy-sdk" target="_blank" rel="noopener noreferrer" className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/40 transition group">
                <Github className="h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-2xl font-bold mb-2">GitHub</h3>
                <p className="text-gray-300">View source code, examples, and contribute</p>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur border border-purple-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Protect Your Users?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Start integrating MEV protection in 5 minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.open('https://docs.decaflow.xyz/sdk/quickstart', '_blank')} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                View Docs <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => window.open('https://calendly.com/decaflow/integration', '_blank')} variant="outline" size="lg" className="border-purple-500/30 hover:bg-purple-500/10 text-lg px-8 py-6">
                Schedule Call
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 DecaFlow. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="https://twitter.com/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Twitter</a>
            <a href="https://github.com/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">GitHub</a>
            <a href="https://docs.decaflow.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Docs</a>
            <a href="https://discord.gg/decaflow" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
