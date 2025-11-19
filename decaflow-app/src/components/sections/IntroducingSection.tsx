import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Zap, Network } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="card-hover group"
    >
      {/* Icon */}
      <div className="mb-6 w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-heading-4 font-bold text-white mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-body text-text-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const IntroducingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: <Network size={36} className="text-white" />,
      title: 'Integration Challenges',
      description:
        "Web3's evolution requires asset movement across blockchains, however, the fragmented ecosystem is complex and risky, hindering widespread crypto adoption.",
    },
    {
      icon: <Shield size={36} className="text-white" />,
      title: 'DecaFlow Solution',
      description:
        'DecaFlow bridges blockchains using advanced security protocols optimized for Arbitrum. This ensures a highly secure environment for cross-chain transactions, facilitating secure asset transfers.',
    },
    {
      icon: <Zap size={36} className="text-white" />,
      title: 'Simplified Transactions',
      description:
        'DecaFlow supports secure swaps through a multi-chain DEX. It enables cross-chain swaps, privacy-focused transactions, and smooth token distribution in one environment.',
    },
  ];

  return (
    <section className="section bg-gradient-hero relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />

      <div className="container-custom px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-2 md:text-heading-1 font-bold text-white mb-6">
            Introducing DecaFlow
          </h2>
          <p className="text-body-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            A New Era of Interoperability and Privacy
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroducingSection;
