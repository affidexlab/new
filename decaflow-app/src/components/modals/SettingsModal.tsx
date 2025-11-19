import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Theme = 'light' | 'dark' | 'auto';
type SlippageTolerance = '0.1' | '0.5' | '1.0' | 'custom';
type TransactionSpeed = 'standard' | 'fast' | 'instant';

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [slippage, setSlippage] = useState<SlippageTolerance>('0.5');
  const [customSlippage, setCustomSlippage] = useState('');
  const [txSpeed, setTxSpeed] = useState<TransactionSpeed>('standard');

  const slippageOptions = [
    { value: '0.1' as const, label: '0.1%', note: 'Low slippage' },
    { value: '0.5' as const, label: '0.5%', note: 'Recommended' },
    { value: '1.0' as const, label: '1.0%', note: 'Higher tolerance' },
  ];

  const txSpeedOptions = [
    { value: 'standard' as const, label: 'Standard', time: '~2 min', gas: 'Normal' },
    { value: 'fast' as const, label: 'Fast', time: '~30 sec', gas: '+10%' },
    { value: 'instant' as const, label: 'Instant', time: '~15 sec', gas: '+30%' },
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-card border border-accent/20 rounded-xl shadow-high z-[1000] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-gradient-card z-10">
              <h3 className="text-xl font-bold text-white">Settings</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Selector */}
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-4">Theme</h4>
                <div className="flex gap-3">
                  {[
                    { value: 'light' as const, icon: <Sun size={18} />, label: 'Light' },
                    { value: 'dark' as const, icon: <Moon size={18} />, label: 'Dark' },
                    { value: 'auto' as const, icon: <Monitor size={18} />, label: 'Auto' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`
                        flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all
                        ${
                          theme === option.value
                            ? 'bg-gradient-primary border-accent shadow-glow text-white'
                            : 'bg-background-elevated border-white/10 text-text-secondary hover:border-accent/50 hover:text-white'
                        }
                      `}
                    >
                      {option.icon}
                      <span className="text-xs font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slippage Tolerance */}
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-2">Slippage Tolerance</h4>
                <p className="text-xs text-text-tertiary mb-4 leading-relaxed">
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </p>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {slippageOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSlippage(option.value)}
                      className={`
                        p-3 rounded-lg border text-sm font-semibold transition-all
                        ${
                          slippage === option.value
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'bg-background-elevated border-white/10 text-text-secondary hover:border-accent/50'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSlippage('custom')}
                    className={`
                      p-3 rounded-lg border text-sm font-semibold transition-all
                      ${
                        slippage === 'custom'
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-background-elevated border-white/10 text-text-secondary hover:border-accent/50'
                      }
                    `}
                  >
                    Custom
                  </button>
                </div>

                {slippage === 'custom' && (
                  <input
                    type="number"
                    value={customSlippage}
                    onChange={(e) => setCustomSlippage(e.target.value)}
                    placeholder="0.50"
                    step="0.01"
                    min="0.01"
                    max="50"
                    className="w-full input text-sm"
                  />
                )}

                {parseFloat(customSlippage) > 5 && (
                  <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-2">
                    <span className="text-warning">⚠️</span>
                    <p className="text-xs text-warning">
                      High slippage! Transaction may be frontrun.
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction Speed */}
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-4">Transaction Speed</h4>
                <div className="space-y-2">
                  {txSpeedOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTxSpeed(option.value)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-lg border transition-all
                        ${
                          txSpeed === option.value
                            ? 'bg-accent/10 border-accent'
                            : 'bg-background-elevated border-white/10 hover:border-accent/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${txSpeed === option.value ? 'border-accent' : 'border-white/20'}
                          `}
                        >
                          {txSpeed === option.value && (
                            <div className="w-3 h-3 bg-accent rounded-full" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                          <div className="text-xs text-text-tertiary">{option.time}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-accent">{option.gas}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-4">Language</h4>
                <select className="input w-full">
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                  <option value="zh">🇨🇳 Chinese</option>
                </select>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
