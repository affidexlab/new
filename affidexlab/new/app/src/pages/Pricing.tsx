import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] text-white">
      <div className="pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>

            <div className="inline-flex items-center gap-4 bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-full p-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full transition ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full transition ${
                  billingPeriod === 'yearly'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">🔒 Privacy SDK Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                  <div className="text-sm font-bold text-purple-400">FREE</div>
                </div>
                
                <div className="text-4xl font-bold mb-2">
                  $0
                  <span className="text-lg text-gray-400">/forever</span>
                </div>
                
                <p className="text-gray-300 mb-6">Perfect for getting started</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Full functionality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited usage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Community support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">"Powered by DecaFlow" badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Multi-language SDKs</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://docs.decaflow.xyz/sdk/quickstart', '_blank')} className="w-full bg-purple-600 hover:bg-purple-700">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border-2 border-purple-500/50 rounded-2xl p-8 relative transform md:scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <div className="text-sm font-bold text-purple-400">PREMIUM</div>
                </div>
                
                <div className="text-4xl font-bold mb-2">
                  ${billingPeriod === 'monthly' ? '500' : '415'}
                  <span className="text-lg text-gray-400">/{billingPeriod === 'monthly' ? 'mo' : 'mo'}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <div className="text-sm text-green-400 mb-4">$4,980/year (billed annually)</div>
                )}
                
                <p className="text-gray-300 mb-6">For established protocols</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300"><strong>Everything in Free</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">White-label (remove branding)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Priority support (24hr SLA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Custom routing logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Dedicated Slack channel</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/premium', '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                  <div className="text-sm font-bold text-purple-400">ENTERPRISE</div>
                </div>
                
                <div className="text-4xl font-bold mb-2">Custom</div>
                
                <p className="text-gray-300 mb-6">For top-tier protocols</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300"><strong>Everything in Premium</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Custom features development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">99.99% uptime SLA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Co-marketing support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Dedicated account manager</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/enterprise', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10">
                  Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">📊 MEV Dashboard Pricing</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">FREE</div>
                <div className="text-3xl font-bold mb-4">$0</div>
                <p className="text-gray-300 mb-6 text-sm">For individual users</p>
                
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">30-day historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Public dashboard access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Basic filters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Community support</span>
                  </li>
                </ul>

                <Button onClick={() => window.location.href = '/mev-dashboard'} className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-2">
                  Start Free
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">PRO</div>
                <div className="text-3xl font-bold mb-1">
                  ${billingPeriod === 'monthly' ? '99' : '82'}
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {billingPeriod === 'monthly' ? '/month' : '/mo, billed yearly'}
                </div>
                <p className="text-gray-300 mb-6 text-sm">For power users</p>
                
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">6-month historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">CSV exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">API (1000 calls/day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Email support</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/pro', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10 text-sm py-2">
                  Upgrade
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur border-2 border-purple-500/50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                
                <div className="text-sm font-bold text-purple-400 mb-2">ENTERPRISE</div>
                <div className="text-3xl font-bold mb-1">
                  ${billingPeriod === 'monthly' ? '499' : '415'}
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {billingPeriod === 'monthly' ? '/month' : '/mo, billed yearly'}
                </div>
                <p className="text-gray-300 mb-6 text-sm">For trading firms</p>
                
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Full historical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Unlimited API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Real-time webhooks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/enterprise', '_blank')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm py-2">
                  Contact Sales
                </Button>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition">
                <div className="text-sm font-bold text-purple-400 mb-2">CUSTOM</div>
                <div className="text-3xl font-bold mb-4">Custom</div>
                <p className="text-gray-300 mb-6 text-sm">For institutions</p>
                
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Custom data feeds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">SLA guarantees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">White-label options</span>
                  </li>
                </ul>

                <Button onClick={() => window.open('https://calendly.com/decaflow/custom', '_blank')} variant="outline" className="w-full border-purple-500/30 hover:bg-purple-500/10 text-sm py-2">
                  Contact Us
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">🎓 <strong>Academic Researchers</strong>: Get Enterprise tier for FREE</p>
              <Button onClick={() => window.open('https://decaflow.xyz/academic', '_blank')} variant="link" className="text-purple-400 hover:text-purple-300">
                Apply for Academic Program →
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Plan?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We offer flexible pricing for protocols with unique requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.open('https://calendly.com/decaflow/custom-plan', '_blank')} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Schedule Call <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => window.open('mailto:sales@decaflow.xyz', '_blank')} variant="outline" size="lg" className="border-purple-500/30 hover:bg-purple-500/10">
                Email Sales
              </Button>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 text-purple-400">Can I start free and upgrade later?</h3>
                <p className="text-gray-300 text-sm">
                  Yes! Start with the free tier and upgrade anytime. No credit card required to start.
                </p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 text-purple-400">What payment methods do you accept?</h3>
                <p className="text-gray-300 text-sm">
                  We accept credit cards, bank transfers, and crypto (USDC, ETH) for annual plans.
                </p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 text-purple-400">Can I cancel anytime?</h3>
                <p className="text-gray-300 text-sm">
                  Yes, cancel anytime. No long-term contracts. Annual plans are non-refundable.
                </p>
              </div>

              <div className="bg-[#1a1f3a]/50 backdrop-blur border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 text-purple-400">Do you offer discounts for DAOs?</h3>
                <p className="text-gray-300 text-sm">
                  Yes! Contact us for special DAO pricing and governance-based payment options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
