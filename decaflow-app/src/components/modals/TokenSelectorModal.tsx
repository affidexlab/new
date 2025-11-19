import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  address: string;
  balance?: string;
  usdValue?: string;
}

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
}

const TokenSelectorModal = ({ isOpen, onClose, onSelectToken }: TokenSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const popularTokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'ARB'];
  
  const tokens: Token[] = [
    { symbol: 'ETH', name: 'Ethereum', address: '0x...', balance: '0.5234', usdValue: '$1,234.56' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x...', balance: '1000.00', usdValue: '$1,000.00' },
    { symbol: 'USDT', name: 'Tether USD', address: '0x...', balance: '500.00', usdValue: '$500.00' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x...', balance: '0.0123', usdValue: '$567.89' },
    { symbol: 'ARB', name: 'Arbitrum', address: '0x...', balance: '100.00', usdValue: '$150.00' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x...', balance: '50.00', usdValue: '$750.00' },
  ];

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-card border border-accent/20 rounded-xl shadow-high z-[1000] max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Select a token</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 pb-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or paste address"
                  className="w-full bg-background-elevated border border-white/10 rounded-md pl-12 pr-4 py-3 text-white placeholder:text-text-tertiary focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all"
                />
              </div>
            </div>

            {/* Popular Tokens */}
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {popularTokens.map((token) => (
                  <button
                    key={token}
                    onClick={() => {
                      const selectedToken = tokens.find((t) => t.symbol === token);
                      if (selectedToken) onSelectToken(selectedToken);
                    }}
                    className="px-4 py-2 bg-background-elevated border border-accent/30 rounded-full text-sm font-semibold text-accent hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            {/* Token List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-1">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((token) => (
                    <button
                      key={token.address}
                      onClick={() => onSelectToken(token)}
                      className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {token.symbol.substring(0, 2)}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white">{token.symbol}</div>
                          <div className="text-xs text-text-secondary">{token.name}</div>
                        </div>
                      </div>
                      
                      {token.balance && (
                        <div className="text-right">
                          <div className="text-white font-medium">{token.balance}</div>
                          <div className="text-xs text-text-secondary">{token.usdValue}</div>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-text-secondary">No tokens found</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TokenSelectorModal;
