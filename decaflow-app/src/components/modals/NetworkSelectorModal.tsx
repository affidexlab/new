import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Network {
  name: string;
  chainId: number;
  icon: string;
}

interface NetworkSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNetwork: (network: Network) => void;
  currentNetwork?: string;
}

const NetworkSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelectNetwork,
  currentNetwork 
}: NetworkSelectorModalProps) => {
  const networks: Network[] = [
    { name: 'Arbitrum', chainId: 42161, icon: '🔵' },
    { name: 'Ethereum', chainId: 1, icon: '⟠' },
    { name: 'Polygon', chainId: 137, icon: '🟣' },
    { name: 'Optimism', chainId: 10, icon: '🔴' },
    { name: 'Base', chainId: 8453, icon: '🔵' },
    { name: 'Avalanche', chainId: 43114, icon: '🔺' },
    { name: 'BSC', chainId: 56, icon: '🟡' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-card border border-accent/20 rounded-xl shadow-high z-[1000]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Select a network</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Network List */}
            <div className="p-6 space-y-2">
              {networks.map((network) => (
                <button
                  key={network.chainId}
                  onClick={() => {
                    onSelectNetwork(network);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-lg transition-all
                    ${
                      currentNetwork === network.name
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-2xl">
                      {network.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{network.name}</div>
                      <div className="text-xs text-text-secondary">Chain ID: {network.chainId}</div>
                    </div>
                  </div>
                  
                  {currentNetwork === network.name && (
                    <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NetworkSelectorModal;
