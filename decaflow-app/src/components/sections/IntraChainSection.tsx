import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const IntraChainSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const blockchains = [
    { name: 'Arbitrum', color: '#28A0F0', featured: true },
    { name: 'Ethereum', color: '#627EEA' },
    { name: 'Avalanche', color: '#E84142' },
    { name: 'BSC', color: '#F3BA2F' },
    { name: 'Optimism', color: '#FF0420' },
    { name: 'Polygon', color: '#8247E5' },
    { name: 'Base', color: '#0052FF' },
  ];

  return (
    <section className="section bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(71, 161, 255, 0.4) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container-custom px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-heading-2 md:text-heading-1 font-bold text-white mb-6">
            Intra-Chain Swaps and Future Multi-Chain DEX
          </h2>
          <p className="text-body-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Swap tokens directly on any of the supported blockchains that DecaFlow integrates including{' '}
            <span className="text-accent font-semibold">Arbitrum</span>, Ethereum, Avalanche, Binance Smart Chain, 
            Optimism, Polygon, and Base.
          </p>
        </motion.div>

        {/* Animated Blockchain Logos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-4xl mx-auto mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {blockchains.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="relative group"
              >
                {/* Connection Lines (SVG paths between logos) */}
                {index < blockchains.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-accent/50 to-transparent -translate-y-1/2 z-0" />
                )}
                
                {/* Logo Card */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center p-4
                    border-2 transition-all duration-300 cursor-pointer
                    ${
                      chain.featured
                        ? 'bg-gradient-primary border-accent shadow-glow scale-110'
                        : 'bg-background-card border-white/10 hover:border-accent/50 hover:shadow-glow-strong'
                    }
                  `}
                  style={{
                    boxShadow: chain.featured ? `0 0 30px ${chain.color}40` : undefined,
                  }}
                >
                  {/* Icon/Logo Placeholder */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2
                      ${chain.featured ? 'bg-white/20 text-white' : 'bg-white/10 text-text-secondary'}
                      group-hover:scale-110 transition-transform
                    `}
                    style={{
                      backgroundColor: chain.featured ? `${chain.color}40` : undefined,
                    }}
                  >
                    {chain.name.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Chain Name */}
                  <span
                    className={`
                      text-xs font-semibold text-center
                      ${chain.featured ? 'text-white' : 'text-text-secondary group-hover:text-white'}
                    `}
                  >
                    {chain.name}
                  </span>

                  {/* Featured Badge */}
                  {chain.featured && (
                    <div className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      Primary
                    </div>
                  )}

                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"
                    style={{
                      backgroundColor: chain.color,
                      filter: 'blur(20px)',
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Central Connection Hub Visualization */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none hidden lg:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full border-2 border-accent/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 border-2 border-primary/20 rounded-full"
            />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <a href="#docs" className="btn-secondary inline-flex items-center gap-2">
            Learn More
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default IntraChainSection;
