import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Users, DollarSign, Sparkles } from "lucide-react";

interface HomeProps {
  onLaunchApp: () => void;
}

export default function Home({ onLaunchApp }: HomeProps) {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const AnimatedNumber = ({ end, duration = 2000, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!statsVisible) return;

      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [statsVisible, end, duration]);

    return (
      <span>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  const chains = [
    { name: "Arbitrum", color: "#28A0F0" },
    { name: "Base", color: "#0052FF" },
    { name: "Optimism", color: "#FF0420" },
    { name: "Polygon", color: "#8247E5" },
    { name: "Ethereum", color: "#627EEA" },
    { name: "Avalanche", color: "#E84142" }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 pb-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm px-6 py-3 text-sm animate-fade-in">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">
                Powered by Chainlink CCIP
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-6xl sm:text-7xl md:text-8xl font-black tracking-tight animate-fade-in-up">
              <span className="block mb-2">Defy Limits</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Embrace Anonymity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-12 text-xl sm:text-2xl text-muted-foreground animate-fade-in-up animation-delay-200 max-w-3xl mx-auto leading-relaxed">
              Where Privacy Meets Secure Cross-Chain Swaps
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Button
                size="lg"
                onClick={onLaunchApp}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Access Platform
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Privacy Swap
              </Button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in-up animation-delay-600">
              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  <AnimatedNumber end={3590} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Trades</div>
              </div>

              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  <AnimatedNumber end={10} prefix="$" suffix="M+" />
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Volume</div>
              </div>

              <div className="group">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  <AnimatedNumber end={1820} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Wallets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border border-blue-500/20 rounded-lg rotate-12 animate-float" />
        <div className="absolute bottom-20 right-10 w-16 h-16 border border-purple-500/20 rounded-lg -rotate-12 animate-float animation-delay-1000" />
      </section>

      {/* Scrolling Logos */}
      <section className="py-12 border-t border-b border-border/50 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 overflow-hidden">
        <div className="flex gap-12 animate-scroll">
          {[...chains, ...chains].map((chain, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 whitespace-nowrap hover:scale-110 transition-transform"
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chain.color }} />
              <span className="font-medium">{chain.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-5xl sm:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Why DECAFLOW?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for traders who demand the best execution, privacy, and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Best Pricing",
                description: "Aggregates quotes from 0x, CoW Protocol, and native pools to find you the best rate on every trade.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Shield,
                title: "MEV Protection",
                description: "Optional privacy mode routes trades through CoW intents and Flashbots Protect to shield you from front-running.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Globe,
                title: "Cross-Chain Bridging",
                description: "Bridge assets via CCTP (USDC native), CCIP (Chainlink), or Socket aggregator with real-time route comparison.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: TrendingUp,
                title: "Smart Routing",
                description: "Automatically selects the best liquidity source and route to minimize slippage and maximize output.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: DollarSign,
                title: "Low Fees",
                description: "Built on Arbitrum for fast, cheap transactions. No protocol fees—only pay gas and DEX fees.",
                gradient: "from-cyan-500 to-blue-500"
              },
              {
                icon: Users,
                title: "Community Pools",
                description: "Create and provide liquidity to custom AMM pools with flexible fee tiers and TVL caps.",
                gradient: "from-pink-500 to-purple-500"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-2"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 group-hover:scale-110 transition-transform`}>
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                    <feature.icon className={`h-6 w-6 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-5xl sm:text-6xl font-bold">
              Ready to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Trade?
              </span>
            </h2>
            <p className="mb-12 text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of traders who choose privacy, speed, and best execution
            </p>
            <Button
              size="lg"
              onClick={onLaunchApp}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-8 text-xl font-semibold rounded-xl shadow-2xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                Launch DECAFLOW
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
