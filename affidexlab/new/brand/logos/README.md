# DecaFlow Logo Files

## Available Formats

### SVG (Recommended)
Vector format, infinitely scalable without quality loss.
- `decaflow-logo-light.svg` - Full logo for light backgrounds
- `decaflow-logo-dark.svg` - Full logo for dark backgrounds
- `decaflow-icon-light.svg` - Icon only, light
- `decaflow-icon-dark.svg` - Icon only, dark
- `decaflow-wordmark-light.svg` - Text only, light
- `decaflow-wordmark-dark.svg` - Text only, dark

### PNG (Raster)
For platforms that don't support SVG.

**1x (Standard resolution)**
- `decaflow-logo-light.png` (1200×400px)
- `decaflow-logo-dark.png` (1200×400px)
- `decaflow-icon-light.png` (512×512px)
- `decaflow-icon-dark.png` (512×512px)

**2x (Retina displays)**
- `decaflow-logo-light@2x.png` (2400×800px)
- `decaflow-logo-dark@2x.png` (2400×800px)
- `decaflow-icon-light@2x.png` (1024×1024px)
- `decaflow-icon-dark@2x.png` (1024×1024px)

**3x (High DPI displays)**
- `decaflow-logo-light@3x.png` (3600×1200px)
- `decaflow-logo-dark@3x.png` (3600×1200px)
- `decaflow-icon-light@3x.png` (1536×1536px)
- `decaflow-icon-dark@3x.png` (1536×1536px)

## Usage Guide

### When to Use Each Version

**Full Logo (Icon + Wordmark)**
- Website headers
- Marketing materials
- Presentations
- Partner announcements

**Icon Only**
- Social media avatars
- App icons
- Favicons
- Small UI elements

**Wordmark Only**
- Text-heavy layouts
- Footer attributions
- Horizontal space constraints

### Light vs Dark

**Light Version** (Dark logo on light background)
- Use on: White, light gray, light blue backgrounds
- Minimum contrast ratio: 4.5:1

**Dark Version** (Light logo on dark background)
- Use on: Black, dark gray, dark blue backgrounds
- Minimum contrast ratio: 4.5:1

## Implementation

### HTML

```html
<!-- SVG (Recommended) -->
<img src="/brand/logos/decaflow-logo-light.svg" alt="DecaFlow" width="180" />

<!-- PNG with Retina support -->
<img 
  src="/brand/logos/decaflow-logo-light.png" 
  srcset="/brand/logos/decaflow-logo-light@2x.png 2x,
          /brand/logos/decaflow-logo-light@3x.png 3x"
  alt="DecaFlow" 
  width="180"
/>
```

### CSS

```css
.logo {
  width: 180px;
  height: auto;
}

.logo-icon {
  width: 40px;
  height: 40px;
}
```

## Notes

- **Do not modify** these logo files
- **Maintain aspect ratio** when resizing
- **Use appropriate version** for background color
- See `BRAND_GUIDELINES.md` for complete usage rules

## Creating Your Own Formats

If you need the logo in a different format:
1. Start with SVG file
2. Use professional design software (Figma, Adobe Illustrator)
3. Export at appropriate resolution/format
4. Verify quality and colors

## Questions?

Contact partnerships@decaflow.xyz for:
- Custom logo formats
- Special use cases
- Brand guideline clarifications
