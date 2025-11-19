import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SwapCard from '../components/swap/SwapCard';
import SettingsModal from '../components/modals/SettingsModal';

const DAppPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', active: false },
    { name: 'Swap', href: '/swap', active: true },
    { name: 'Docs', href: '#docs', active: false },
    { name: 'Support', href: '#support', active: false },
    { name: 'List Token', href: '#list', active: false },
    { name: 'Revenue Share', href: '#revenue', active: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* DApp Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-white/5">
        <div className="container-custom">
          <div className="flex items-center justify-between h-[70px] px-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">DECAFLOW</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`
                    text-[15px] font-medium transition-all duration-150 pb-1 border-b-2
                    ${
                      link.active
                        ? 'text-white border-accent'
                        : 'text-text-secondary border-transparent hover:text-white'
                    }
                  `}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-150"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
              
              <div className="hidden sm:block">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <SwapCard />
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default DAppPage;
