import { useState } from 'react';
import { ArrowDownUp, ChevronDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenInputProps {
  isReadOnly?: boolean;
}

const TokenInput = ({ isReadOnly = false }: TokenInputProps) => {
  const [amount, setAmount] = useState('');
  const [selectedToken] = useState<string | null>(null);
  const [selectedNetwork] = useState('Arbitrum');

  return (
    <div className="bg-background-input rounded-xl p-4 border border-white/10 hover:border-accent/30 transition-colors">
      {/* Network Selector */}
      <div className="mb-3">
        <button className="flex items-center gap-2 bg-background-elevated border border-white/10 rounded-md px-4 py-2 hover:border-accent/50 transition-all group">
          <div className="w-5 h-5 bg-gradient-primary rounded-full" />
          <span className="text-sm font-medium text-white">{selectedNetwork}</span>
          <ChevronDown size={16} className="text-text-tertiary group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* Amount Input & Token Selector */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <input
          type="text"
          value={amount}
          onChange={(e) => !isReadOnly && setAmount(e.target.value)}
          placeholder="0"
          readOnly={isReadOnly}
          className="flex-1 bg-transparent text-4xl font-bold text-white placeholder:text-text-disabled outline-none"
        />
        
        <button
          className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 px-4 py-2 rounded-md transition-all shadow-glow"
          onClick={() => {/* Open token selector modal */}}
        >
          {selectedToken ? (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-full" />
              <span className="font-bold text-white">{selectedToken}</span>
            </>
          ) : (
            <span className="font-bold text-white">Select Token</span>
          )}
          <ChevronDown size={16} className="text-white" />
        </button>
      </div>

      {/* Balance & Price */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button className="text-text-secondary hover:text-accent transition-colors">
            Balance: 0.0000
          </button>
          {!isReadOnly && (
            <button className="px-2 py-1 border border-accent/50 text-accent rounded-full hover:bg-gradient-primary hover:border-transparent hover:text-white transition-all">
              MAX
            </button>
          )}
        </div>
        <span className="text-text-secondary">
          {amount && amount !== '0' ? `~$${(parseFloat(amount) * 2000).toFixed(2)}` : '$0.00'}
        </span>
      </div>
    </div>
  );
};

const SwapCard = () => {
  const [smartMode, setSmartMode] = useState(true);

  const handleSwapTokens = () => {
    // Swap FROM and TO tokens
  };

  return (
    <div className="max-w-[480px] mx-auto mt-24 mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-card border border-accent/15 rounded-xl p-8 shadow-high"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Swap</h2>
          
          {/* Smart Toggle */}
          <button
            onClick={() => setSmartMode(!smartMode)}
            className={`
              relative w-16 h-8 rounded-full transition-all duration-300
              ${smartMode ? 'bg-gradient-primary' : 'bg-background-elevated'}
            `}
          >
            <motion.div
              animate={{ x: smartMode ? 32 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {smartMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* FROM Section */}
        <TokenInput />

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="w-12 h-12 bg-background-card border-2 border-accent/30 rounded-full flex items-center justify-center text-accent hover:bg-gradient-primary hover:text-white hover:border-accent hover:rotate-180 transition-all duration-300 shadow-glow"
          >
            <ArrowDownUp size={20} />
          </button>
        </div>

        {/* TO Section */}
        <TokenInput isReadOnly />

        {/* Swap Details */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between text-text-secondary hover:text-white transition-colors cursor-pointer group">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-text-tertiary group-hover:text-accent transition-colors" />
              <span>Fees & Slippage</span>
            </div>
            <span>-$0.00</span>
          </div>
          
          <div className="flex items-center justify-between text-text-secondary hover:text-white transition-colors cursor-pointer group">
            <div className="flex items-center gap-2">
              <span>⛽</span>
              <span>Gas</span>
            </div>
            <span>-$0.00</span>
          </div>
        </div>

        {/* Main Action Button */}
        <button className="w-full btn-primary mt-6 py-4 text-base">
          Connect Wallet
        </button>
      </motion.div>
    </div>
  );
};

export default SwapCard;
