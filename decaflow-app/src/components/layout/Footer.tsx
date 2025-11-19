import { Link } from 'react-router-dom';
import { Twitter, Send, Github, FileText, BookOpen } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    findUs: [
      { name: 'CoinMarketCap', href: '#' },
      { name: 'CoinGecko', href: '#' },
      { name: 'DexScreener', href: '#' },
      { name: 'DexTools', href: '#' },
      { name: 'Arbitrum Explorer', href: '#' },
    ],
    socials: [
      { name: 'Telegram', href: '#' },
      { name: 'Twitter/X', href: '#' },
      { name: 'Discord', href: '#' },
      { name: 'Medium', href: '#' },
      { name: 'LinkTree', href: '#' },
    ],
    website: [
      { name: 'Home', href: '#' },
      { name: 'Arbitrum Integration', href: '#arbitrum' },
      { name: 'Bridge Protocols', href: '#bridge' },
      { name: 'Statistics', href: '#stats' },
    ],
    developers: [
      { name: 'GitBook/Docs', href: '#' },
      { name: 'Audit Reports', href: '#' },
      { name: 'Report Bug', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'List Token', href: '#' },
    ],
  };

  const socialIcons = [
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Send size={20} />, href: '#', label: 'Telegram' },
    { icon: <Github size={20} />, href: '#', label: 'GitHub' },
    { icon: <FileText size={20} />, href: '#', label: 'Medium' },
    { icon: <BookOpen size={20} />, href: '#', label: 'GitBook' },
  ];

  return (
    <footer className="bg-[#0A0E1F] border-t border-white/10">
      {/* Badge */}
      <div className="container-custom px-4 pt-12 pb-8">
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-background-card border border-accent/20 rounded-full px-6 py-2">
            <div className="w-5 h-5 bg-gradient-primary rounded-full" />
            <span className="text-sm text-text-secondary">
              Cross Chain <span className="text-accent font-semibold">SECURED WITH Arbitrum</span>
            </span>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-white font-bold text-xl">DECAFLOW</span>
            </div>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Where Privacy Meets Secure Cross-Chain Swaps
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-150"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Find Us Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Find Us</h4>
            <ul className="space-y-3">
              {footerLinks.findUs.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent hover:underline text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Website & Socials Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Website</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.website.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent hover:underline text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mb-4">Socials</h4>
            <ul className="space-y-3">
              {footerLinks.socials.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent hover:underline text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Developers</h4>
            <ul className="space-y-3">
              {footerLinks.developers.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-accent hover:underline text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="text-center mb-12">
          <h4 className="text-white font-semibold mb-4">Start using DecaFlow today</h4>
          <Link to="/swap" className="btn-primary">
            Open DApp
          </Link>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-text-tertiary text-xs">
            Website by SavageSquad | Copyright © DecaFlow 2024 | Powered by{' '}
            <span className="text-accent">Arbitrum</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
