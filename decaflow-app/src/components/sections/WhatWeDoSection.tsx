import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Bot, Shield, Layers } from 'lucide-react';

interface TabContent {
  id: string;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WhatWeDoSection = () => {
  const [activeTab, setActiveTab] = useState('cross-chain');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const tabs: TabContent[] = [
    {
      id: 'cross-chain',
      label: 'Cross Chain Swap',
      icon: <ArrowRightLeft size={20} />,
      title: 'Cross Chain Swap',
      description:
        "Embrace interoperability and unlock the full potential of DeFi with DecaFlow's Cross Chain Swap utilizing Arbitrum's infrastructure and bridging protocols to trade any token effortlessly between various leading blockchains, all within a single platform.",
    },
    {
      id: 'telegram',
      label: 'Telegram Bot',
      icon: <Bot size={20} />,
      title: 'Telegram Bot',
      description:
        'DecaFlow prioritizes user efficiency by incorporating technology built upon next-generation infrastructure into our Telegram Bot.',
    },
    {
      id: 'privacy',
      label: 'Privacy Swap',
      icon: <Shield size={20} />,
      title: 'Privacy Swap',
      description:
        'Unlike traditional swaps that leave visibility to all, DecaFlow utilizes advanced techniques to ensure Privacy and complete anonymity throughout the entire Swap process.',
    },
    {
      id: 'multichain',
      label: 'Multichain DEX',
      icon: <Layers size={20} />,
      title: 'Multichain DEX',
      description:
        'Ditch the limitations of single-chain DEXs. DecaFlow shatters the walls, allowing you to trade tokens, protocols, and manage liquidity freely across multiple blockchains for unparalleled access and opportunity.',
    },
  ];

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  return (
    <section className="section bg-background-elevated">
      <div className="container-custom px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-2 md:text-heading-1 font-bold text-white mb-6">
            What do we do?
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            DecaFlow is recognized as a trusted, private, and secure platform for multichain and privacy swaps.
          </p>
        </motion.div>

        {/* Tabs Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tab List */}
          <div className="lg:w-1/3">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-lg font-semibold text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal
                    ${
                      activeTab === tab.id
                        ? 'bg-gradient-primary text-white border-l-4 border-accent shadow-glow'
                        : 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }
                  `}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-text-tertiary'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              {activeTabContent && (
                <motion.div
                  key={activeTabContent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="card p-8 lg:p-12"
                >
                  {/* Illustration Placeholder */}
                  <div className="mb-8 aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center border border-accent/20">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        {activeTabContent.icon}
                      </div>
                      <p className="text-text-tertiary text-sm">Illustration: {activeTabContent.title}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-heading-3 font-bold text-white mb-4">
                    {activeTabContent.title}
                  </h3>
                  <p className="text-body-lg text-text-secondary leading-relaxed">
                    {activeTabContent.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
