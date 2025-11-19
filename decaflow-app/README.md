# DecaFlow Marketing Website

## Overview
This is the marketing landing page for DecaFlow - A DeFi protocol powered by Arbitrum blockchain. Built to replicate ChainSwap.tech's UI/UX exactly, with DecaFlow branding.

## Tech Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Package Manager:** Bun

## Features Implemented

### ✅ Phase 1 - MVP Components
- [x] Header/Navigation with mobile menu
- [x] Hero Section with animated background and particles
- [x] Stats Section with counting animations
- [x] Partner logos infinite carousel
- [x] Introducing DecaFlow section with 3 feature cards
- [x] What We Do section with interactive tabs
- [x] Footer with all links and social media

### 🎨 Design System
- Complete color palette matching ChainSwap
- Typography system with Inter font
- Spacing system (4px grid)
- Animation system with Framer Motion
- Custom Tailwind configuration with design tokens

## Getting Started

### Prerequisites
- Node.js 20+ or Bun 1.2+

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Main navigation
│   │   └── Footer.tsx        # Footer with links
│   ├── sections/
│   │   ├── HeroSection.tsx           # Hero with CTA
│   │   ├── StatsSection.tsx          # Stats + Logo carousel
│   │   ├── IntroducingSection.tsx    # Feature cards
│   │   └── WhatWeDoSection.tsx       # Interactive tabs
│   └── ui/                    # Reusable UI components
├── assets/                    # Images and icons
├── App.tsx                    # Main app component
├── index.css                  # Global styles + Tailwind
└── main.tsx                   # Entry point
```

## Design Specifications

This implementation follows the detailed specifications in:
- `DecaFlow_UI_UX_Specification.md` (65+ page specification)
- `IMPLEMENTATION_CHECKLIST.md` (Phase-by-phase tasks)
- `README_SPECIFICATION.md` (Overview and quick start)

### Key Design Elements
- **Colors:** Primary Blue (#3396FF), Accent (#47A1FF)
- **Fonts:** Inter (400, 500, 600, 700, 800)
- **Animations:** Fade-in, scale, slide, glow pulse
- **Responsive:** Mobile-first, breakpoints at 768px and 1024px

## Customization

### Updating Brand Colors
Edit `tailwind.config.js` and update the color tokens:

```js
colors: {
  primary: '#3396FF',  // Main brand color
  accent: '#47A1FF',   // Accent color
  // ... other colors
}
```

### Adding New Sections
1. Create component in `src/components/sections/`
2. Import and add to `App.tsx`
3. Follow existing patterns for animations and styling

## Next Steps (Phase 2)

- [ ] Add protocol integration sections (Arbitrum, Bridge)
- [ ] Add intra-chain swaps section
- [ ] Implement scroll animations
- [ ] Add particle effects system
- [ ] Optimize for production (code splitting, lazy loading)

## Contributing

When adding new features:
1. Follow existing component patterns
2. Use Tailwind utility classes
3. Add Framer Motion animations
4. Ensure mobile responsiveness
5. Update this README

## License

Proprietary - DecaFlow Team

## Reference

- **ChainSwap (Reference):** https://www.chainswap.tech
- **DecaFlow (Current):** https://decaflow.vercel.app

---

**Built with ❤️ for DecaFlow**
