import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Features', href: '#features' },
    { name: 'Roadmap', href: '#roadmap' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="container-custom">
        <div className="flex items-center justify-between h-[70px] px-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">DECAFLOW</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-text-secondary hover:text-white transition-colors duration-150 font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-150"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            
            <Link to="/swap" className="btn-primary hidden sm:block">
              ENTER DAPP
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background-card border-t border-white/5 overflow-hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-text-secondary hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-150 font-medium"
                >
                  {link.name}
                </a>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                <Link to="/swap" className="btn-primary w-full block text-center">
                  ENTER DAPP
                </Link>
                <a
                  href="#privacy"
                  className="block text-center text-text-secondary hover:text-accent py-3 transition-colors"
                >
                  Privacy Swap
                </a>
                <a
                  href="https://t.me/DecaFlowBot"
                  className="block text-center text-text-secondary hover:text-accent py-3 transition-colors"
                >
                  Solana TG Bot
                </a>
                <a
                  href="#dashboard"
                  className="block text-center text-text-secondary hover:text-accent py-3 transition-colors"
                >
                  Revenue Dashboard
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
