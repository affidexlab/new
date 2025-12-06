# DecaFlow Brand Guidelines

Official brand guidelines for DecaFlow partner integrations.

## Logo Usage

### Logo Files

All logo files are provided in the `/brand/logos/` directory:

- `decaflow-logo-light.svg` - Full logo for light backgrounds
- `decaflow-logo-dark.svg` - Full logo for dark backgrounds
- `decaflow-icon-light.svg` - Icon only for light backgrounds
- `decaflow-icon-dark.svg` - Icon only for dark backgrounds
- `decaflow-wordmark-light.svg` - Wordmark only for light backgrounds
- `decaflow-wordmark-dark.svg` - Wordmark only for dark backgrounds

PNG versions (1x, 2x, 3x) are also provided for each.

### Clear Space

Maintain a minimum clear space around the logo equal to the height of the "D" in DecaFlow.

```
┌─────────────────────────┐
│                         │
│     [D]                 │
│      ↕ = clear space    │
│   ←→ DECAFLOW ←→        │
│                         │
└─────────────────────────┘
```

### Minimum Size

- Full logo: Minimum width of 120px
- Icon only: Minimum size of 32px × 32px
- Wordmark: Minimum width of 100px

### What NOT to Do

❌ Don't change the logo colors  
❌ Don't rotate or distort the logo  
❌ Don't add effects (shadows, outlines, glows)  
❌ Don't place on busy backgrounds without proper contrast  
❌ Don't recreate or modify the logo

## Color Palette

### Primary Colors

```
DecaFlow Purple
Hex: #4F46E5
RGB: 79, 70, 229
Used for: Primary actions, links, highlights
```

```
DecaFlow Blue
Hex: #0EA5E9
RGB: 14, 165, 233
Used for: Secondary actions, informational elements
```

### Neutral Colors

```
Dark Gray (Backgrounds)
Hex: #111827
RGB: 17, 24, 39

Medium Gray (Text)
Hex: #6B7280
RGB: 107, 114, 128

Light Gray (Borders)
Hex: #E5E7EB
RGB: 229, 231, 235

White
Hex: #FFFFFF
RGB: 255, 255, 255
```

### Semantic Colors

```
Success Green
Hex: #10B981
RGB: 16, 185, 129

Warning Yellow
Hex: #F59E0B
RGB: 245, 158, 11

Error Red
Hex: #EF4444
RGB: 239, 68, 68
```

## Typography

### Primary Font: Inter

- **Headings**: Inter Bold (700)
- **Body**: Inter Regular (400)
- **UI Elements**: Inter Medium (500)
- **Captions**: Inter Regular (400)

Available at: https://fonts.google.com/specimen/Inter

### Font Sizes

```
Hero: 48px / 3rem (Bold)
H1: 32px / 2rem (Bold)
H2: 24px / 1.5rem (Bold)
H3: 20px / 1.25rem (Semibold)
Body: 16px / 1rem (Regular)
Small: 14px / 0.875rem (Regular)
Caption: 12px / 0.75rem (Regular)
```

### Code/Monospace: JetBrains Mono

For API keys, code snippets, and terminal outputs.

## "Powered by DecaFlow" Badge

Partners can optionally display the "Powered by DecaFlow" badge in their integration.

### Badge Variations

- Light background version
- Dark background version
- Compact version (icon + wordmark)
- Full version (icon + "Powered by DecaFlow")

### Placement Guidelines

- Place badge in footer or discrete area of the interface
- Minimum size: 100px wide
- Maintain 16px padding around badge
- Badge should link to https://decaflow.xyz

### Badge HTML

```html
<a href="https://decaflow.xyz" target="_blank" rel="noopener">
  <img 
    src="/brand/badges/powered-by-decaflow-light.svg" 
    alt="Powered by DecaFlow"
    width="120"
  />
</a>
```

## Co-Branding

### Partner + DecaFlow Lockup

When co-branding materials (announcements, blog posts, presentations):

1. Partner logo on the left, DecaFlow logo on the right
2. Maintain equal visual weight
3. Separate logos with appropriate spacing
4. Use same background treatment for both logos

### Approval Process

All co-branded materials require mutual approval:
- Submit drafts to partnerships@decaflow.xyz
- Allow 2-3 business days for review
- Receive written approval before publication

## UI Integration Examples

### Swap Interface

```
┌─────────────────────────────────┐
│  Swap                           │
│                                 │
│  From: [USDC input]             │
│  To:   [ETH input]              │
│                                 │
│  [Swap Button]                  │
│                                 │
│  Powered by DecaFlow  →         │
└─────────────────────────────────┘
```

### Widget Attribution

Widgets should include subtle "Powered by DecaFlow" attribution:
- 12px font size
- 60% opacity
- Bottom of widget
- Optional link to decaflow.xyz

## Social Media

### Profile Images

Use the icon-only logo for:
- Twitter/X profile picture
- Discord server icon
- Telegram group icon

### Cover Images

Template cover images provided for:
- Twitter/X header (1500×500px)
- LinkedIn banner (1584×396px)
- Discord server banner (960×540px)

## Assets Package

All brand assets are available in the `/brand/` directory:

```
/brand
  /logos          - Logo files (SVG, PNG)
  /badges         - "Powered by" badges
  /colors         - Color swatches (ASE, CSS, JSON)
  /social         - Social media assets
  /presentation   - PowerPoint/Keynote templates
  README.md       - Asset inventory
```

## Questions?

For brand-related questions or approval requests:
- Email: partnerships@decaflow.xyz
- Include mockups or drafts for review
- Response time: 2-3 business days

## License

DecaFlow brand assets are proprietary and licensed for use only by authorized partners. Unauthorized use is prohibited.

---

**Last Updated**: December 2025  
**Version**: 1.0
