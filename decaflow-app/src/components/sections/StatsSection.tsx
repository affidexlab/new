import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  delay?: number;
}

const StatCard = ({ value, label, delay = 0 }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    // Extract number from value string
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    const hasPlus = value.includes('+');
    const isDollar = value.includes('$');
    const hasM = value.includes('M');
    const hasK = value.includes('K');

    let currentValue = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      currentValue = numericValue * progress;

      let formattedValue = Math.floor(currentValue).toLocaleString();
      
      if (isDollar) formattedValue = '$' + formattedValue;
      if (hasM) formattedValue += 'M';
      if (hasK) formattedValue += 'K';
      if (hasPlus) formattedValue += '+';

      setDisplayValue(formattedValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="card-hover text-center p-8"
    >
      <div className="text-5xl md:text-6xl font-bold text-white mb-3">
        {displayValue}
      </div>
      <div className="text-body-lg text-text-secondary font-medium">
        {label}
      </div>
    </motion.div>
  );
};

const LogoCarousel = () => {
  const logos = [
    { name: 'Arbitrum', width: 120 },
    { name: 'Ethereum', width: 120 },
    { name: 'Polygon', width: 120 },
    { name: 'Avalanche', width: 120 },
    { name: 'BSC', width: 80 },
    { name: 'Optimism', width: 120 },
    { name: 'Base', width: 100 },
  ];

  return (
    <div className="relative overflow-hidden mt-16">
      <div className="flex animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
            style={{ width: logo.width }}
          >
            <div className="h-16 bg-white/10 rounded-lg flex items-center justify-center text-text-secondary font-semibold">
              {logo.name}
            </div>
          </div>
        ))}
      </div>

      {/* Add scroll animation in global CSS */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    { value: '3590+', label: 'Total Trades' },
    { value: '$10M+', label: 'Total Volume' },
    { value: '1820+', label: 'Total Wallets' },
  ];

  return (
    <section className="section bg-background-elevated">
      <div className="container-custom px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Partner Logos Carousel */}
        <LogoCarousel />
      </div>
    </section>
  );
};

export default StatsSection;
