import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Network } from 'lucide-react';

const ProtocolSections = () => {
  const arbitrumRef = useRef(null);
  const bridgeRef = useRef(null);
  
  const arbitrumInView = useInView(arbitrumRef, { once: true, margin: '-100px' });
  const bridgeInView = useInView(bridgeRef, { once: true, margin: '-100px' });

  return (
    <>
      {/* Arbitrum Integration Section */}
      <section id="CardArbitrum" className="section bg-background-elevated relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="container-custom px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image/Illustration Left */}
            <motion.div
              ref={arbitrumRef}
              initial={{ opacity: 0, x: -50 }}
              animate={arbitrumInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                {/* Illustration Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl border border-accent/30 p-8 backdrop-blur-sm">
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-strong">
                      <Network size={64} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-semibold mb-2">Arbitrum Network</p>
                      <p className="text-text-tertiary text-sm">Layer 2 Scaling Solution</p>
                    </div>
                    {/* Network Nodes Visualization */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="h-12 bg-accent/20 rounded-lg border border-accent/30"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl -z-10" />
              </div>
            </motion.div>

            {/* Content Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={arbitrumInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="card p-8 lg:p-12">
                <h2 className="text-heading-3 md:text-heading-2 font-bold text-white mb-6">
                  Integrating Arbitrum's Layer 2 Scaling Solution
                </h2>
                <p className="text-body-lg text-text-secondary leading-relaxed mb-6">
                  DecaFlow leverages Arbitrum's cutting-edge Layer 2 technology for secure and efficient 
                  cross-chain swaps. This innovative protocol boasts industry-leading security through its 
                  decentralized network and optimistic rollup architecture, allowing for the seamless transfer 
                  of both data and tokens between blockchains with minimal fees and maximum speed.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="badge">
                    <span>🔒 Secure</span>
                  </div>
                  <div className="badge">
                    <span>⚡ Fast</span>
                  </div>
                  <div className="badge">
                    <span>💰 Low Fees</span>
                  </div>
                  <div className="badge">
                    <span>🌐 Decentralized</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bridge Protocol Section */}
      <section id="CardBridge" className="section bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="container-custom px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Left */}
            <motion.div
              ref={bridgeRef}
              initial={{ opacity: 0, x: -50 }}
              animate={bridgeInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="card p-8 lg:p-12">
                <h2 className="text-heading-3 md:text-heading-2 font-bold text-white mb-6">
                  Multi-Protocol Bridging - CCTP, CCIP & Socket
                </h2>
                <p className="text-body-lg text-text-secondary leading-relaxed mb-6">
                  DecaFlow supports multiple bridging protocols for maximum flexibility. Circle's CCTP eliminates 
                  the need for complex conversions by facilitating direct USDC swaps between supported blockchains. 
                  Combined with Chainlink's CCIP and Socket aggregator, we offer the most comprehensive bridging 
                  solution with a reliable burn and mint mechanism.
                </p>
                <p className="text-body-lg text-text-secondary leading-relaxed mb-6">
                  Our protocol streamlines transactions, minimizing processing times and fees, allowing users to 
                  swap assets across chains efficiently and cost-effectively.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-text-secondary">USDC Native (CCTP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-text-secondary">Chainlink CCIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-text-secondary">Socket Aggregator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span className="text-text-secondary">Burn & Mint</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image/Illustration Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={bridgeInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Illustration Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-primary/30 p-8 backdrop-blur-sm">
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-strong">
                      <Shield size={64} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-primary font-semibold mb-2">Bridge Protocols</p>
                      <p className="text-text-tertiary text-sm">CCTP • CCIP • Socket</p>
                    </div>
                    {/* Bridge Visualization */}
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <div className="flex-1 h-12 bg-accent/20 rounded-lg border border-accent/30 flex items-center justify-center">
                        <span className="text-xs text-accent font-semibold">Chain A</span>
                      </div>
                      <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex gap-1"
                      >
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        <div className="w-1 h-1 bg-accent rounded-full" />
                      </motion.div>
                      <div className="flex-1 h-12 bg-primary/20 rounded-lg border border-primary/30 flex items-center justify-center">
                        <span className="text-xs text-primary font-semibold">Chain B</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-secondary opacity-20 blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProtocolSections;
