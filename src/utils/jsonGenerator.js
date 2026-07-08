/**
 * Generates and downloads a JSON data file containing all details of the specified brand kit,
 * organized into the 4 parent sections requested:
 * 1. Core Profile & Voice
 * 2. Brand Assets & Guidelines
 * 3. Color Palette
 * 4. Typography & Spacing
 */
export function downloadBrandKitJSON(brandKit) {
  if (!brandKit) {
    if (typeof window !== 'undefined') {
      alert("Please select or create a Brand Kit first before downloading the JSON data spec.");
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

  // Generates 50-950 scale details
  const getScaleTokens = (baseHex) => {
    const rgb = hexToRgb(baseHex);
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    const scale = {};
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
      scale[shade] = {
        hex: hex.toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      };
    });
    return scale;
  };

  const resolveColorHex = (type, customVal) => {
    if (type === 'primary') return colors.primary;
    if (type === 'secondary') return colors.secondary;
    if (type === 'accent') return colors.accent;
    if (type === 'neutral') return '#64748b';
    if (type === 'white') return '#ffffff';
    if (type === 'black') return '#000000';
    return customVal || '#6366f1';
  };

  const exportData = {
    version: brandKit?.version || "1.0.0",
    exportedAt: new Date().toISOString(),
    brandName: bName,
    specifications: {
      "1_brandFoundation": {
        brandName: bName,
        tagline: brandKit?.tagline || "",
        industry: brandKit?.industry || "General",
        website: brandKit?.website || "",
        description: brandKit?.description || "",
        mission: `To provide modern visual solutions for clients in the ${brandKit?.industry || "General"} industry.`,
        voice: brandKit?.brandVoice || "Professional & Visionary",
        customCategories: brandKit?.customCategories || []
      },
      "2_brandAssetsGuidelines_logoSystem": {
        logoImage: brandKit?.logoImage ? "(Base64 Data String)" : null,
        logoVariants: [`${bName} Primary`, `${bName} Dark`],
        favicon: brandKit?.favicon || "✨"
      },
      "3_colorPalette_colorSystem": {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        success: colors.success || '#10b981',
        warning: colors.warning || '#f59e0b',
        error: colors.error || '#ef4444',
        scales: {
          primary: getScaleTokens(colors.primary),
          secondary: getScaleTokens(colors.secondary),
          accent: getScaleTokens(colors.accent)
        }
      },
      "4_typographySpacing_typography": {
        titleFont: typography.titleFont || typography.headingFont || 'Outfit',
        headingFont: typography.headingFont || 'Outfit',
        subheadingFont: typography.subheadingFont || typography.headingFont || 'Outfit',
        bodyFont: typography.bodyFont || 'Inter',
        titleSize: `${typography.titleSize || 48}px`,
        headingSize: `${typography.headingSize || 32}px`,
        subheadingSize: `${typography.subheadingSize || 20}px`,
        bodySize: `${typography.bodySize || 14}px`,
        titleColor: typography.titleColor || 'primary',
        titleCustomColor: typography.titleCustomColor || '#6366f1',
        titleResolvedColorHex: resolveColorHex(typography.titleColor || 'primary', typography.titleCustomColor),
        titleWeight: typography.titleWeight || '800',
        headingColor: typography.headingColor || 'secondary',
        headingCustomColor: typography.headingCustomColor || '#a855f7',
        headingResolvedColorHex: resolveColorHex(typography.headingColor || 'secondary', typography.headingCustomColor),
        headingWeight: typography.headingWeight || '700',
        subheadingColor: typography.subheadingColor || 'accent',
        subheadingCustomColor: typography.subheadingCustomColor || '#06b6d4',
        subheadingResolvedColorHex: resolveColorHex(typography.subheadingColor || 'accent', typography.subheadingCustomColor),
        subheadingWeight: typography.subheadingWeight || '600',
        bodyColor: typography.bodyColor || 'neutral',
        bodyCustomColor: typography.bodyCustomColor || '#475569',
        bodyResolvedColorHex: resolveColorHex(typography.bodyColor || 'neutral', typography.bodyCustomColor),
        bodyWeight: typography.bodyWeight || '400'
      },
      "5_spacingSystem": {
        grid: "8-point layout grid",
        padding: "16px",
        margin: "16px",
        scale: [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192]
      },
      "6_radiusSystem": {
        borderRadius: `${spacing.borderRadius || 8}px`,
        scale: {
          none: "0px",
          xs: "2px",
          sm: "4px",
          md: `${Math.max(2, Math.round((spacing.borderRadius || 8) / 2))}px`,
          lg: `${spacing.borderRadius || 8}px`,
          xl: `${(spacing.borderRadius || 8) * 1.5}px`,
          full: "9999px"
        }
      },
      "7_shadowSystem": {
        flat: "none",
        raised: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        overlay: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
        popover: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
        modal: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)"
      },
      "8_bordersAndOutlines": {
        defaultWidth: "1px",
        focusOutlineWidth: "2px",
        focusRingColor: colors.primary,
        style: "solid"
      },
      "9_motionSystem": {
        hoverTransition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        modalTransition: "transform 0.3s ease-out, opacity 0.3s ease-out",
        microAnimation: "hover:scale-105 active:scale-95 duration-150"
      },
      "10_iconographySystemBuilder_iconLibrary": {
        defaultStrokeWidth: brandKit?.iconStyle?.strokeWidth !== undefined ? `${brandKit.iconStyle.strokeWidth}px` : "2px",
        lineCap: "round",
        lineJoin: "round",
        recommendedLibrary: brandKit?.iconStyle?.library || "Lucide React",
        selectedIcons: brandKit?.icons || [],
        stylingSpec: brandKit?.iconStyle || {
          bgType: 'none',
          radius: 8,
          borderWidth: 0,
          strokeWidth: 2,
          colorType: 'primary',
          library: 'Lucide React'
        }
      },
      "11_gridAndLayout": {
        layoutWidth: "1280px (max-w-7xl)",
        columns: 12,
        gap: "24px (gap-6)",
        mobileColumns: 4
      },
      "12_componentLibraryStyling_componentLab": {
        componentsList: ["Button", "Input", "Card", "Badge", "BadgeOutline", "Alert", "Checkbox", "Radio", "Switch", "Select"],
        specifications: {
          button: {
            padding: "10px 16px",
            borderRadius: brandKit?.buttonStyle?.radius !== undefined ? `${brandKit.buttonStyle.radius}px` : `${spacing.borderRadius || 8}px`,
            colors: {
              background: btnColorHex,
              text: "#ffffff"
            },
            stylingSpec: brandKit?.buttonStyle || {
              bgType: 'solid',
              radius: 8,
              borderWidth: 0,
              borderStyle: 'solid',
              shadow: 'sm',
              colorType: 'primary',
              customColor: '#6366f1'
            }
          },
          badge: brandKit?.badgeStyle || {
            bgType: 'soft',
            radius: 'full'
          },
          label: brandKit?.labelStyle || {
            fontWeight: 'semibold',
            textTransform: 'uppercase'
          },
          notificationAlert: brandKit?.alertStyle || {
            leftBorder: true,
            bgType: 'soft',
            radius: 8
          }
        }
      },
      "13_pagePatterns": {
        landingPage: ["Hero section", "Core features grid", "Specs comparison", "Sign up CTA"],
        dashboardLayout: ["Fixed Header", "Collapsible Sidebar", "Main content workspace grid"]
      },
      "14_accessibility": {
        wcagTargetGrade: "WCAG AA Compliance (Contrast > 4.5:1)",
        screenReaderAriaTags: true,
        reducedMotionPreference: true
      },
      "15_designTokens": {
        colorTokens: {
          "color-primary": colors.primary,
          "color-secondary": colors.secondary,
          "color-accent": colors.accent
        },
        radiusTokens: {
          "radius-brand": `${spacing.borderRadius || 8}px`
        }
      },
      "16_fileStructure": {
        projectDirectory: {
          "design-system/": {
            "tokens/": ["colors.json", "spacing.json", "typography.json"],
            "components/": ["Button.jsx", "Button.css", "Input.jsx"],
            "storybook/": []
          }
        }
      },
      "17_namingConvention": {
        prefix: "ds-",
        format: "kebab-case",
        tokenFormula: "ds-[category]-[property]-[shade]"
      },
      "18_documentation": {
        format: ["markdown", "html", "pdf", "storybook"],
        license: "MIT"
      },
      "19_figmaTokens": {
        color: {
          Primary: { value: colors.primary, type: "color" },
          Secondary: { value: colors.secondary, type: "color" },
          Accent: { value: colors.accent, type: "color" }
        },
        radius: {
          brand: { value: `${spacing.borderRadius || 8}px`, type: "borderRadius" }
        }
      },
      "20_changeLogHistory": {
        changelog: brandKit?.changelog || [],
        history: brandKit?.history || []
      }
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `${fileName}-brand-kit.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
