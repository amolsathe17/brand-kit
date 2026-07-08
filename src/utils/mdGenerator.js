/**
 * Generates and downloads a design.md file populated with the active brand kit details,
 * structured under the 4 parent headers:
 * 1. Core Profile & Voice
 * 2. Brand Assets & Guidelines
 * 3. Color Palette
 * 4. Typography & Spacing
 */
export function downloadBrandKitMarkdown(brandKit) {
  if (!brandKit) {
    if (typeof window !== 'undefined') {
      alert("Please select or create a Brand Kit first before downloading the Markdown specification.");
    }
    return;
  }

  const colors = brandKit?.colors || { primary: '#6366f1', secondary: '#a855f7', accent: '#06b6d4' };
  const typography = brandKit?.typography || { titleFont: 'Outfit', headingFont: 'Outfit', subheadingFont: 'Outfit', bodyFont: 'Inter', titleSize: 48, headingSize: 32, subheadingSize: 20, bodySize: 14 };
  const spacing = brandKit?.spacing || { borderRadius: 8 };
  const bName = brandKit?.name || 'Brand System';

  const getButtonColorHex = () => {
    const type = brandKit?.buttonStyle?.colorType || 'primary';
    if (type === 'primary') return colors.primary;
    if (type === 'secondary') return colors.secondary;
    if (type === 'accent') return colors.accent;
    return brandKit?.buttonStyle?.customColor || '#6366f1';
  };
  const btnColorHex = getButtonColorHex();

  const resolveColorHex = (type, customVal) => {
    if (type === 'primary') return `${colors.primary} (Primary Brand)`;
    if (type === 'secondary') return `${colors.secondary} (Secondary Brand)`;
    if (type === 'accent') return `${colors.accent} (Accent Brand)`;
    if (type === 'neutral') return `#64748B (Neutral Slate)`;
    if (type === 'white') return `#FFFFFF (White)`;
    if (type === 'black') return `#000000 (Black)`;
    return `${customVal || '#6366f1'} (Custom)`;
  };

  const titleSize = typography.titleSize || 48;
  const headingSize = typography.headingSize || 32;
  const subheadingSize = typography.subheadingSize || 20;
  const bodySize = typography.bodySize || 14;
  const bRadius = spacing.borderRadius || 8;

  // Helper to convert hex to rgb
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Helper to convert hex to hsl
  const hexToHsl = (hex) => {
    let { r, g, b } = hexToRgb(hex);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Contrast ratio check helper
  const getContrastRatio = (hex1, hex2) => {
    const getLuminance = (hex) => {
      const rgb = hexToRgb(hex);
      const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    const l1 = getLuminance(hex1) + 0.05;
    const l2 = getLuminance(hex2) + 0.05;
    return l1 > l2 ? l1 / l2 : l2 / l1;
  };

  // Generates 50-950 scale details
  const getScaleSpecsMarkdown = (colorName, baseHex) => {
    const rgb = hexToRgb(baseHex);
    let markdown = `| Shade | HEX | RGB | HSL | CSS Variable |\n|---|---|---|---|---|\n`;
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    shades.forEach((shade, idx) => {
      let r, g, b;
      if (idx < 5) {
        const t = (5 - idx) / 5 * 0.85;
        r = Math.round(rgb.r + (255 - rgb.r) * t);
        g = Math.round(rgb.g + (255 - rgb.g) * t);
        b = Math.round(rgb.b + (255 - rgb.b) * t);
      } else if (idx === 5) {
        r = rgb.r; g = rgb.g; b = rgb.b;
      } else {
        const t = (idx - 5) / 5 * 0.7;
        r = Math.round(rgb.r * (1 - t));
        g = Math.round(rgb.g * (1 - t));
        b = Math.round(rgb.b * (1 - t));
      }
      const hex = '#' + [r, g, b].map(x => {
        const s = x.toString(16);
        return s.length === 1 ? '0' + s : s;
      }).join('');
      const hsl = hexToHsl(hex);
      markdown += `| ${shade} | \`${hex.toUpperCase()}\` | \`rgb(${r}, ${g}, ${b})\` | \`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\` | \`--color-${colorName}-${shade}\` |\n`;
    });
    return markdown;
  };

  const mdContent = `---
version: ${brandKit?.version || '1.0.0'}
name: ${bName}
description: ${brandKit?.description || 'A custom design system.'}
logoImage: ${brandKit?.logoImage ? '"' + brandKit.logoImage.substring(0, 100) + '... (Base64)"' : 'null'}
industry: ${brandKit?.industry || 'General'}
website: ${brandKit?.website || 'N/A'}
---

# ${bName} Design System Specification

Welcome to the official design system documentation for **${bName}**.

---

## 1. Brand Foundation
* **Brand Name**: ${bName}
* **Tagline**: ${brandKit?.tagline || 'Simplifying complexity through design.'}
* **Industry Sector**: ${brandKit?.industry || 'General'}
* **Website URL**: ${brandKit?.website || 'N/A'}
* **Description**: ${brandKit?.description || 'A custom design system.'}
* **Mission**: To provide modern visual solutions for clients in the ${brandKit?.industry || 'General'} industry.
* **Voice**: ${brandKit?.brandVoice || 'Professional & Visionary'}

---

## 2. Brand Assets & Guidelines / Logo System
* **Primary Logo**: Combined geometric symbol and wordmark.
* **Logo variants**: Primary, Dark, Monochrome
* **Favicon**: ${brandKit?.favicon || '✨'}
* **Logo Image**: ${brandKit?.logoImage ? 'Base64 image asset loaded' : 'Not provided'}

---

## 3. Color Palette / Color System
* **Primary Color**: \`${colors.primary}\`
* **Secondary Color**: \`${colors.secondary}\`
* **Accent Color**: \`${colors.accent}\`
* **Success Color**: \`#10b981\`
* **Warning Color**: \`#f59e0b\`
* **Error Color**: \`#ef4444\`
* **Contrast White**: ${getContrastRatio(colors.primary, '#ffffff').toFixed(2)}:1
* **Contrast Dark**: ${getContrastRatio(colors.primary, '#0f172a').toFixed(2)}:1

${getScaleSpecsMarkdown('primary', colors.primary)}
${getScaleSpecsMarkdown('secondary', colors.secondary)}
${getScaleSpecsMarkdown('accent', colors.accent)}

---

## 4. Typography & Spacing / Typography
* **Title Typeface**: \`${typography.titleFont || typography.headingFont || 'Outfit'}\` (Size: \`${typography.titleSize || 48}px\`, Color: \`${resolveColorHex(typography.titleColor || 'primary', typography.titleCustomColor)}\`, Weight/Boldness: \`${typography.titleWeight || '800'}\`)
* **Heading Typeface**: \`${typography.headingFont || 'Outfit'}\` (Size: \`${typography.headingSize || 32}px\`, Color: \`${resolveColorHex(typography.headingColor || 'secondary', typography.headingCustomColor)}\`, Weight/Boldness: \`${typography.headingWeight || '700'}\`)
* **Sub-heading Typeface**: \`${typography.subheadingFont || typography.headingFont || 'Outfit'}\` (Size: \`${typography.subheadingSize || 20}px\`, Color: \`${resolveColorHex(typography.subheadingColor || 'accent', typography.subheadingCustomColor)}\`, Weight/Boldness: \`${typography.subheadingWeight || '600'}\`)
* **Body Line Height**: \`${typography.lineHeight || '1.5'}\`
* **Heading Letter Spacing**: \`${typography.letterSpacing || '0px'}\`
* **Heading Font Scale**: \`${typography.scale || '1.25'}\`

| Token | Font Size | Line Height | Font Weight | Letter Spacing | Use Case |
|---|---|---|---|---|---|
| Display XXL | \`64px\` | \`72px\` | \`800\` | \`-0.02em\` | Large hero headers |
| Display XL | \`48px\` | \`56px\` | \`800\` | \`-0.02em\` | Medium hero headlines |
| Heading H1 | \`36px\` | \`44px\` | \`700\` | \`-0.015em\` | Landing titles |
| Heading H2 | \`30px\` | \`38px\` | \`700\` | \`-0.015em\` | Section starts |
| Heading H3 | \`24px\` | \`32px\` | \`700\` | \`-0.01em\` | Cards headlines |
| Heading H4 | \`20px\` | \`28px\` | \`600\` | \`-0.01em\` | Sidebar menus |
| Body XL | \`18px\` | \`28px\` | \`400\` | \`0em\` | Lead paragraphs |
| Body Default | \`14px\` | \`22px\` | \`400\` | \`0em\` | Standard body text |
| Small Caption | \`12px\` | \`18px\` | \`500\` | \`0.01em\` | Meta info, labels |
| Label Overline | \`10px\` | \`14px\` | \`700\` | \`0.08em\` | Small category tags |

---

## 5. Spacing System
* **Layout Grid**: 8-point layout grid.
* **Scale Tokens (px)**: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192

---

## 6. Radius System
* **none**: \`0px\` - Used for full-bleed borders.
* **xs**: \`2px\` - Sub-elements, checkboxes.
* **sm**: \`4px\` - Button elements.
* **md**: \`${Math.max(2, Math.round(bRadius / 2))}px\` - Small cards, inputs.
* **lg**: \`${bRadius}px\` - Default card corners, dropdown lists.
* **xl**: \`${bRadius * 1.5}px\` - Large dashboards, modals.
* **full**: \`9999px\` - Avatars, pills.

---

## 7. Shadow System
| Token | Box Shadow Value | Blur | Spread | Elevation Map |
|---|---|---|---|---|
| XS | \`0 1px 2px 0 rgba(0,0,0,0.05)\` | \`2px\` | \`0px\` | Buttons, inputs |
| SM | \`0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)\` | \`3px\` | \`0px\` | Small cards, badges |
| MD | \`0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)\` | \`6px\` | \`-1px\` | Dropdown menus, selects |
| LG | \`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)\` | \`15px\` | \`-3px\` | Modals, flyout drawers |
| XL | \`0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)\` | \`25px\` | \`-5px\` | Large popovers |

---

## 8. Borders & Outlines
* **Default Border**: 1px solid stroke.
* **Focus Ring Outline**: 2px outline width with primary offset glow.
* **Style**: Solid style.

---

## 9. Motion System
* **Transitions**: hover: \`all 0.2s ease\`, modal: \`transform 0.3s ease-out, opacity 0.3s ease-out\`.
* **Micro-animations**: Subtle scales and fades on active hover states.

---

## 10. Iconography System Builder / Icon Library
* **Icon Library Source**: ${brandKit?.iconStyle?.library || "Lucide React"}
* **Outline Stroke Weight**: ${brandKit?.iconStyle?.strokeWidth !== undefined ? `${brandKit.iconStyle.strokeWidth}px` : "2px"}
* **Geometry**: Rounded caps and joins.
* **Background Container Style**: ${brandKit?.iconStyle?.bgType || 'none'}
* **Container Radius**: ${brandKit?.iconStyle?.radius !== undefined ? `${brandKit.iconStyle.radius}px` : "8px"}
* **Container Border Width**: ${brandKit?.iconStyle?.borderWidth !== undefined ? `${brandKit.iconStyle.borderWidth}px` : "0px"}
* **Color Basis**: ${brandKit?.iconStyle?.colorType || 'primary'}
* **Selected Icons**: ${(brandKit?.icons || []).map(icon => `\`${icon}\``).join(', ')}

---

## 11. Grid & Layout
* **Max Width**: \`1280px (max-w-7xl)\`
* **Columns**: 12 columns grid.
* **Gaps**: \`24px (gap-6)\` for desktop, \`16px (gap-4)\` for tablet, and \`12px (gap-3)\` for mobile.

---

## 12. Component Library Styling (Buttons, Badges, Labels & Alerts) / Component Lab
* **List of Core Components**: Button, Input, Select, Card, Badge, Alert, Checkbox, Radio, Switch, Modal.
* **Button Specifications**: 
  * **Color Type Basis**: ${brandKit?.buttonStyle?.colorType || 'primary'}
  * **Custom Specs HEX Color**: \`${brandKit?.buttonStyle?.customColor || '#6366f1'}\`
  * **Resolved Button Color (HEX)**: \`${btnColorHex}\`
  * **Background Style**: ${brandKit?.buttonStyle?.bgType || 'solid'}
  * **Corner Roundness (Border Radius)**: ${brandKit?.buttonStyle?.radius !== undefined ? `${brandKit.buttonStyle.radius}px` : `${bRadius}px`}
  * **Border Width**: ${brandKit?.buttonStyle?.borderWidth !== undefined ? `${brandKit.buttonStyle.borderWidth}px` : "0px"}
  * **Border Style**: ${brandKit?.buttonStyle?.borderStyle || 'solid'}
  * **Shadow/Elevation**: ${brandKit?.buttonStyle?.shadow || 'sm'}
  * **Padding**: 10px 16px
  * **Text Color**: #ffffff (white)
* **Badge Specifications**:
  * **Background Fill Style**: ${brandKit?.badgeStyle?.bgType || 'soft'}
  * **Corner Roundness**: ${brandKit?.badgeStyle?.radius || 'full'}
  * **Padding**: 4px 10px
* **Label Specifications**:
  * **Font Weight**: ${brandKit?.labelStyle?.fontWeight || 'semibold'}
  * **Text Capitalization**: ${brandKit?.labelStyle?.textTransform || 'uppercase'}
* **Notification Alert Specifications**:
  * **Background Fill Style**: ${brandKit?.alertStyle?.bgType || 'soft'}
  * **Corner Radius**: ${brandKit?.alertStyle?.radius !== undefined ? `${brandKit.alertStyle.radius}px` : "8px"}
  * **Left Accent Border Bar**: ${brandKit?.alertStyle?.leftBorder ? "Enabled (4px thickness)" : "Disabled"}
  * **Padding**: 14px 16px

---

## 13. Page Patterns
* **Landing Page Pattern**: Hero section -> Core Features grid -> Specs comparison -> Sign up CTA.
* **Dashboard Layout**: Fixed header + Sidebar list + Flex responsive main workspace repository.

---

## 14. Accessibility
* **WCAG Target**: WCAG AA Compliance (contrast > 4.5:1).
* **Tags**: Screen reader ARIA labels supported.
* **Reduced Motion**: Fallback transitions enabled if client settings request reduced animation.

---

## 15. Design Tokens
\`\`\`css
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --border-radius-brand: ${bRadius}px;
  --button-radius: ${brandKit?.buttonStyle?.radius !== undefined ? `${brandKit.buttonStyle.radius}px` : `${bRadius}px`};
  --button-color: ${btnColorHex};
}
\`\`\`

---

## 16. File Structure
\`\`\`bash
design-system/
├── tokens/
│   ├── colors.json
│   ├── spacing.json
│   └── typography.json
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.css
│   └── Input/
├── styles/
│   └── global.css
└── storybook/
\`\`\`

---

## 17. Naming Convention
* **Prefix**: \`ds-\`
* **Format**: kebab-case.
* **Token formula**: \`ds-[category]-[property]-[shade]\` (e.g., \`ds-color-primary-500\`).

---

## 18. Documentation
* **Supported Formats**: Markdown documentation, JSON configurations, PDF specimens, Storybook stories.
* **License**: MIT.

---

## 19. Figma Tokens
\`\`\`json
{
  "global": {
    "primary": { "value": "${colors.primary}", "type": "color" },
    "secondary": { "value": "${colors.secondary}", "type": "color" },
    "accent": { "value": "${colors.accent}", "type": "color" },
    "radius": { "value": "${bRadius}px", "type": "borderRadius" }
  }
}
\`\`\`

---

## 20. Change Log / History
* ### Version history & change log
| Version | Date | Changes Summary | Author |
|---|---|---|---|
|${(brandKit?.changelog || [{ version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: 'Initial presets configuration', user: 'admin@brandkit.ai' }])
  .map(log => `| v${log.version} | ${log.date} | ${log.changes} | ${log.user} |`).join('\n')}

### Guidelines Custom Categories & Notes
${(brandKit?.customCategories || []).map(cat => `#### ${cat.name}\n${cat.content}\n`).join('\n')}
`;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${bName.replace(/\s+/g, '_')}_design.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
