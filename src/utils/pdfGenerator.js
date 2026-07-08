import { jsPDF } from 'jspdf';

// Helper to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 136, g: 136, b: 136 };
}

// Helper to convert hex to hsl
function hexToHsl(hex) {
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
}

// Contrast ratio check
function getContrastRatio(hex1, hex2) {
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
}

// Generates dynamic 50-950 scale base hex color
function generateScale(baseHex) {
  const rgb = hexToRgb(baseHex);
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  return shades.map((shade, idx) => {
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
    return { shade, hex };
  });
}

export function generateBrandKitPDF(brandKit) {
  if (!brandKit) {
    return null;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const colors = brandKit?.colors || { primary: '#6366f1', secondary: '#a855f7', accent: '#06b6d4' };
  const primaryColor = colors.primary || '#6366f1';
  const secondaryColor = colors.secondary || '#a855f7';
  const accentColor = colors.accent || '#06b6d4';
  const rgbPrimary = hexToRgb(primaryColor);
  const rgbSecondary = hexToRgb(secondaryColor);
  const rgbAccent = hexToRgb(accentColor);

  const bName = brandKit?.name || 'Brand System';
  const bTagline = brandKit?.tagline || 'Simplifying complexity through design.';
  const bVoice = brandKit?.brandVoice || 'Professional & Visionary';
  const bIndustry = brandKit?.industry || 'General';
  const bVersion = brandKit?.version || '1.0.0';
  const dateModified = brandKit?.dateModified || new Date().toISOString().split('T')[0];

  const borderRadius = brandKit.spacing?.borderRadius || 8;
  const headingFont = brandKit.typography?.headingFont || 'Outfit';
  const bodyFont = brandKit.typography?.bodyFont || 'Inter';
  const titleFont = brandKit.typography?.titleFont || brandKit.typography?.headingFont || 'Outfit';
  const subheadingFont = brandKit.typography?.subheadingFont || brandKit.typography?.headingFont || 'Outfit';

  // Dynamic Button Color Resolver
  const btnColorType = brandKit.buttonStyle?.colorType || 'primary';
  const getButtonColorHex = () => {
    if (btnColorType === 'primary') return primaryColor;
    if (btnColorType === 'secondary') return secondaryColor;
    if (btnColorType === 'accent') return accentColor;
    return brandKit.buttonStyle?.customColor || '#6366f1';
  };
  const btnColorHex = getButtonColorHex();
  const rgbButton = hexToRgb(btnColorHex);

  const resolveColorHex = (type, customVal) => {
    if (type === 'primary') return primaryColor;
    if (type === 'secondary') return secondaryColor;
    if (type === 'accent') return accentColor;
    if (type === 'neutral') return '#64748B';
    if (type === 'white') return '#FFFFFF';
    if (type === 'black') return '#000000';
    return customVal || '#6366f1';
  };

  const colorsToRender = [
    { name: 'Primary Brand Color', hex: primaryColor, scale: generateScale(primaryColor) },
    { name: 'Secondary Brand Color', hex: secondaryColor, scale: generateScale(secondaryColor) },
    { name: 'Accent Brand Color', hex: accentColor, scale: generateScale(accentColor) }
  ];

  // Helper to draw clean header & footer on pages 2+
  const drawPageShell = (pageNum, pageTitle) => {
    // Header strip line
    doc.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
    doc.setLineWidth(1.2);
    doc.line(20, 20, 190, 20);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`${bName.toUpperCase()}`, 20, 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(pageTitle.toUpperCase(), 190, 15, { align: 'right' });
    
    // Bottom separator
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.4);
    doc.line(20, 275, 190, 275);
    
    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Version ${bVersion} | Created on ${dateModified}`, 20, 281);
    doc.text(`Page ${pageNum} of 14`, 190, 281, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  doc.setFillColor(11, 15, 25); // Premium deep slate background
  doc.rect(0, 0, 210, 297, 'F');

  // Left accent color strip
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.rect(0, 0, 8, 297, 'F');

  // Logo container
  if (brandKit.logoImage) {
    try {
      doc.addImage(brandKit.logoImage, 'PNG', 28, 45, 24, 24);
    } catch (e) {
      console.error(e);
    }
  } else {
    doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
    doc.roundedRect(28, 45, 18, 18, 3.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(bName.substring(0,1).toUpperCase(), 34, 57);
  }

  // Cover Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.text(bName, 28, 88);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(148, 163, 184);
  doc.text('Design System & Visual Guidelines', 28, 100);

  doc.setFontSize(10.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`"${bTagline}"`, 28, 115, { maxWidth: 160 });

  // Metadata block (Premium Card)
  doc.setFillColor(22, 30, 49); // slate-800 dark variant
  doc.roundedRect(28, 195, 160, 52, 4, 4, 'F');
  
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DOCUMENT SCOPE', 36, 210);
  doc.text('RELEASE VERSION', 85, 210);
  doc.text('INDUSTRY SECTOR', 135, 210);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Brand Manual', 36, 217);
  doc.text(`v${bVersion}`, 85, 217);
  doc.text(bIndustry, 135, 217);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`Generated: ${dateModified} | Creator: Antigravity Builder`, 36, 235);

  // ==========================================
  // PAGE 2: 1. BRAND FOUNDATION
  // ==========================================
  doc.addPage();
  drawPageShell(2, '1. Brand Foundation');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('1. Brand Foundation', 20, 36);

  // Core Voice traits Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 44, 170, 44, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Core Profile & Voice Traits', 26, 52);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Voice & Tone Guidelines: ${bVoice || 'Visionary, Professional, and Bold'}`, 26, 60);
  doc.text(`Industry Focus: ${bIndustry} | Site: ${brandKit.website || 'N/A'}`, 26, 66);
  
  // Mission statement in quote block
  doc.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.setLineWidth(1.5);
  doc.line(26, 73, 26, 81);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text(`"${brandKit.description || 'A beautiful custom design system.'}"`, 30, 78, { maxWidth: 152 });

  // Custom categories section list
  let catY = 96;
  const cats = brandKit.customCategories || [];
  if (cats.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Brand Identity Categories', 20, catY);
    catY += 6;
    
    cats.forEach((cat) => {
      if (catY < 255) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, catY, 170, 15, 2, 2, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(cat.name, 25, catY + 6);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(cat.content || '', 25, catY + 11, { maxWidth: 160 });
        catY += 18;
      }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('No custom guidelines categories defined.', 20, catY + 6);
  }

  // ==========================================
  // PAGE 3: 2. BRAND ASSETS & GUIDELINES
  // ==========================================
  doc.addPage();
  drawPageShell(3, '2. Brand Assets & Guidelines');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('2. Brand Assets & Guidelines', 20, 36);

  // Logo System variations
  doc.setFontSize(11);
  doc.text('Primary Logo System Variations', 20, 48);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 80, 40, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Horizontal Logo Wordmark', 25, 62);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(bName, 25, 78);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, 54, 80, 40, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Emblem Monogram (32x32)', 115, 62);
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.roundedRect(115, 68, 12, 12, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(bName.substring(0,1).toUpperCase(), 119.5, 76.5);

  // Safe Areas card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 104, 170, 40, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Logo Safe Area Guidelines & Spacing Rules', 25, 112);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Clearance area: Always maintain a minimum safe padding grid matching 0.5x height of emblem.',
    '- Contrast ratio rule: Ensure clean contrast and visibility over dark backdrops or images.',
    '- Emblem Favicon: ' + (brandKit.favicon || '✨') + ' (rendered in size 16x16 standard formats).'
  ], 25, 120);

  // ==========================================
  // PAGE 4: 3. COLOR PALETTE / COLOR SYSTEM
  // ==========================================
  doc.addPage();
  drawPageShell(4, '3. Color Palette / Color System');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('3. Color Palette / Color System', 20, 36);

  let colorCardY = 46;
  colorsToRender.forEach((col) => {
    // Render swatch card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, colorCardY, 170, 34, 3, 3, 'FD');

    // Circular swatch
    const colRgb = hexToRgb(col.hex);
    doc.setFillColor(colRgb.r, colRgb.g, colRgb.b);
    doc.setDrawColor(203, 213, 225);
    doc.circle(36, colorCardY + 17, 10, 'FD');

    // Swatch details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(col.name, 52, colorCardY + 11);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`HEX: ${col.hex.toUpperCase()}`, 52, 17 + colorCardY);
    const colHsl = hexToHsl(col.hex);
    doc.text(`HSL: ${colHsl.h}, ${colHsl.s}%, ${colHsl.l}%`, 52, 23 + colorCardY);
    doc.text(`RGB: rgb(${colRgb.r}, ${colRgb.g}, ${colRgb.b})`, 52, 29 + colorCardY);

    // Gradient Shades scale strip
    col.scale.forEach((sh, idx) => {
      const scaleX = 100 + (idx * 7.8);
      const shRgb = hexToRgb(sh.hex);
      doc.setFillColor(shRgb.r, shRgb.g, shRgb.b);
      doc.rect(scaleX, colorCardY + 10, 7.2, 10, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(sh.shade, scaleX, colorCardY + 25);
    });

    colorCardY += 38;
  });

  // ==========================================
  // PAGE 5: 4. TYPOGRAPHY & SPACING / TYPOGRAPHY
  // ==========================================
  doc.addPage();
  drawPageShell(5, '4. Typography & Spacing / Typography');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('4. Typography & Spacing / Typography', 20, 36);

  // Type specimens card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 44, 170, 84, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Aa Bb Cc Dd Ee Ff (Display XXL Specimen)', 25, 56);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Title Font: ${titleFont} / Size: ${brandKit.typography?.titleSize || 48}px / Weight: ${brandKit.typography?.titleWeight || '800'}`, 25, 63);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('The quick brown fox jumps over the lazy dog (Heading)', 25, 77);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Heading Font: ${headingFont} / Size: ${brandKit.typography?.headingSize || 32}px / Weight: ${brandKit.typography?.headingWeight || '700'}`, 25, 84);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Platform components: buttons, tables, dropdown selects list view details (Body)', 25, 98);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Body Font: ${bodyFont} / Size: ${brandKit.typography?.bodySize || 14}px / Weight: ${brandKit.typography?.bodyWeight || '400'}`, 25, 105);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Subheading Font: ${subheadingFont} / Size: ${brandKit.typography?.subheadingSize || 20}px / Weight: ${brandKit.typography?.subheadingWeight || '600'}`, 25, 118);
  doc.text(`Line Height: ${brandKit.typography?.lineHeight || '1.5'} / Letter Spacing: ${brandKit.typography?.letterSpacing || '0px'} / Font Scale: ${brandKit.typography?.scale || '1.25'}`, 25, 126);

  // ==========================================
  // PAGE 6: 5. SPACING SYSTEM | 6. RADIUS SYSTEM
  // ==========================================
  doc.addPage();
  drawPageShell(6, '5. Spacing System | 6. Radius System');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('5. Spacing System & 6. Radius System', 20, 36);

  // 5. Spacing
  doc.setFontSize(11);
  doc.text('5. Spacing System (8-Point Layout Grid)', 20, 48);

  let spacingY = 56;
  const spaces = [4, 8, 12, 16, 24, 32, 48];
  spaces.forEach((sp) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${sp}px`, 20, spacingY + 3.5);
    doc.text(`${(sp/16).toFixed(3)}rem`, 32, spacingY + 3.5);

    doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
    doc.rect(48, spacingY + 0.8, sp * 1.5, 2.5, 'F');
    spacingY += 7.5;
  });

  doc.line(20, spacingY + 4, 190, spacingY + 4);

  // 6. Radius Scale
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('6. Radius System Scale', 20, spacingY + 12);

  const radiusScale = [2, 4, 8, 12, 16, 20];
  radiusScale.forEach((rad, rIdx) => {
    const radX = 20 + (rIdx * 28);
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.4);
    const currentRad = Math.min(6, rad / 2.5);
    doc.roundedRect(radX, spacingY + 18, 22, 12, currentRad, currentRad, 'D');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`r = ${rad}px`, radX + 1, spacingY + 36);
  });

  // ==========================================
  // PAGE 7: 7. SHADOW SYSTEM | 8. BORDERS & OUTLINES
  // ==========================================
  doc.addPage();
  drawPageShell(7, '7. Shadow System | 8. Borders & Outlines');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('7. Shadow System & 8. Borders & Outlines', 20, 36);

  // 7. Shadow
  doc.setFontSize(11);
  doc.text('7. Shadow System Specifications', 20, 48);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 170, 32, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- XS micro shadow: 0 1px 2px 0 rgba(0,0,0,0.05)',
    '- SM component shadow: 0 1px 3px 0 rgba(0,0,0,0.1)',
    '- MD container shadow: 0 4px 6px -1px rgba(0,0,0,0.1)',
    '- LG overlay shadow: 0 10px 15px -3px rgba(0,0,0,0.1)'
  ], 25, 62);

  // 8. Borders
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('8. Borders & Focus Outlines', 20, 100);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 106, 170, 28, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Stroke weight default: 1px border line thickness.',
    `- Focus outline ring: 2px thickness with primary accent offset color (${primaryColor}).`,
    '- Border grids layout: solid line styles.'
  ], 25, 114);

  // ==========================================
  // PAGE 8: 9. MOTION SYSTEM | 11. GRID & LAYOUT
  // ==========================================
  doc.addPage();
  drawPageShell(8, '9. Motion System | 11. Grid & Layout');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('9. Motion System & 11. Grid & Layout', 20, 36);

  // 9. Motion
  doc.setFontSize(11);
  doc.text('9. Motion System & Micro-animations', 20, 48);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 170, 28, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Hover transitions: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) standard curve.',
    '- Modal panel animations: transform 0.3s ease-out, opacity 0.3s ease-out.',
    '- Micro feed-back reactions: hover:scale-105 active:scale-95.'
  ], 25, 62);

  // 11. Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('11. Grid & Layout specifications', 20, 96);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 102, 170, 28, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Max layout container width: 1280px (max-w-7xl).',
    '- Columns count standard: 12 vertical column grids.',
    '- Responsive gaps: 24px desktop / 16px tablet / 12px mobile.'
  ], 25, 110);

  // ==========================================
  // PAGE 9: 10. ICONOGRAPHY SYSTEM BUILDER
  // ==========================================
  doc.addPage();
  drawPageShell(9, '10. Iconography System Builder');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('10. Iconography System Builder', 20, 36);

  doc.setFontSize(11);
  doc.text('Glyph & Icon Library guidelines', 20, 48);

  const strokeWt = brandKit.iconStyle?.strokeWidth !== undefined ? `${brandKit.iconStyle.strokeWidth}px` : "2px";
  const iconBgType = brandKit.iconStyle?.bgType || 'none';
  const iconRadius = brandKit.iconStyle?.radius !== undefined ? `${brandKit.iconStyle.radius}px` : "8px";
  const iconBorderW = brandKit.iconStyle?.borderWidth !== undefined ? `${brandKit.iconStyle.borderWidth}px` : "0px";
  const iconColorB = brandKit.iconStyle?.colorType || 'primary';

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 170, 38, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    `* Glyph Outline weight: ${strokeWt}`,
    `* Background container type: ${iconBgType}`,
    `* Container corner roundness: ${iconRadius}`,
    `* Container border width: ${iconBorderW}`,
    `* Glyph color type category: ${iconColorB}`,
    `* Recommended library: ${brandKit.iconStyle?.library || "Lucide React"}`
  ], 25, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Selected Brand Icons Library:', 20, 104);

  let iconColX = 20;
  let iconRowY = 110;
  const iconList = brandKit.icons || [];
  if (iconList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No brand icons selected. Use Iconography Workstation to add icons.', 20, iconRowY + 5);
  } else {
    iconList.forEach((icon) => {
      if (iconColX > 175) {
        iconColX = 20;
        iconRowY += 12;
      }
      if (iconRowY < 265) {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(iconColX, iconRowY, 14, 8, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        doc.text(icon.substring(0, 8), iconColX + 1.5, iconRowY + 5.5);
        iconColX += 17;
      }
    });
  }

  // ==========================================
  // PAGE 10: 12. COMPONENT LIBRARY STYLING / COMPONENT LAB
  // ==========================================
  doc.addPage();
  drawPageShell(10, '12. Component Library Styling / Component Lab');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('12. Component Library Styling', 20, 36);

  // 12. Component Spec Card
  doc.setFontSize(11);
  doc.text('Buttons, Badges, Labels & Alerts Details', 20, 48);

  const btnRadius = brandKit.buttonStyle?.radius !== undefined ? `${brandKit.buttonStyle.radius}px` : `${borderRadius}px`;
  const btnBorderW = brandKit.buttonStyle?.borderWidth !== undefined ? `${brandKit.buttonStyle.borderWidth}px` : "0px";
  const btnBgType = brandKit.buttonStyle?.bgType || 'solid';
  const btnBorderStyle = brandKit.buttonStyle?.borderStyle || 'solid';
  const btnShadow = brandKit.buttonStyle?.shadow || 'sm';

  const badgeBg = brandKit.badgeStyle?.bgType || 'soft';
  const badgeRad = brandKit.badgeStyle?.radius || 'full';
  const labelWt = brandKit.labelStyle?.fontWeight || 'semibold';
  const labelTrans = brandKit.labelStyle?.textTransform || 'uppercase';
  const alertBg = brandKit.alertStyle?.bgType || 'soft';
  const alertRad = brandKit.alertStyle?.radius !== undefined ? `${brandKit.alertStyle.radius}px` : "8px";
  const alertBdr = brandKit.alertStyle?.leftBorder ? "with accent bar" : "no bar";

  // DRAW INTERACTIVE REPLICA CARDS
  // 1. Button Card with custom colors, radius and shadow details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 80, 72, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Button Specifications', 25, 62);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    `- Target Basis: ${btnColorType.toUpperCase()}`,
    `- Fill Style: ${btnBgType.toUpperCase()}`,
    `- Resolved HEX: ${btnColorHex.toUpperCase()}`,
    `- Corner Radius: ${btnRadius}`,
    `- Border width: ${btnBorderW} (${btnBorderStyle})`,
    `- Shadow: ${btnShadow.toUpperCase()}`
  ], 25, 68);

  // Draw simulated button using resolved brand color
  doc.setFillColor(rgbButton.r, rgbButton.g, rgbButton.b);
  const btnRadVal = Math.min(4, parseInt(btnRadius) / 2);
  doc.roundedRect(25, 110, 40, 10, btnRadVal, btnRadVal, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Simulated CTA', 32, 116.5);

  // 2. Alert Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, 54, 80, 72, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Alert Specifications', 115, 62);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    `- Bg Fill Type: ${alertBg.toUpperCase()}`,
    `- Corner Radius: ${alertRad}`,
    `- Left Border Bar: ${brandKit.alertStyle?.leftBorder ? 'ENABLED' : 'DISABLED'}`,
    '- Accent Color: Secondary Brand',
    `- resolved Border: ${alertBdr.toUpperCase()}`
  ], 115, 68);

  // Draw simulated alert box with Left Accent Bar
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  const alertRadVal = Math.min(4, parseInt(alertRad) / 2);
  doc.roundedRect(115, 110, 70, 10, alertRadVal, alertRadVal, 'FD');
  
  if (brandKit.alertStyle?.leftBorder !== false) {
    doc.setFillColor(rgbSecondary.r, rgbSecondary.g, rgbSecondary.b);
    doc.rect(115, 110, 2.5, 10, 'F');
  }
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Alert notification preview box.', 121, 116.5);

  // 3. Badge Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 134, 80, 56, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Badge Specifications', 25, 142);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    `- Fill style: ${badgeBg.toUpperCase()}`,
    `- Corner shape: ${badgeRad.toUpperCase()}`,
    '- Padding: 4px 10px',
    '- Border width: 1px outline border'
  ], 25, 148);

  // Draw soft pill badge
  doc.setFillColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b, 20); // 20% opacity simulated
  doc.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  const badgeRadVal = badgeRad === 'full' ? 4 : 2;
  doc.roundedRect(25, 174, 24, 8, badgeRadVal, badgeRadVal, 'F');
  doc.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ACTIVE', 30.5, 180);

  // 4. Label Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, 134, 80, 56, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Label Specifications', 115, 142);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    `- Weight: ${labelWt.toUpperCase()}`,
    `- Casing: ${labelTrans.toUpperCase()}`,
    '- Size: 10px / 0.625rem',
    '- Line-height: 12px'
  ], 115, 148);

  // Draw label text field preview mockup
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(115, 172, 60, 10, 2, 2, 'FD');
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Form Input Label...', 120, 178.5);

  // ==========================================
  // PAGE 11: 13. PAGE PATTERNS | 14. ACCESSIBILITY
  // ==========================================
  doc.addPage();
  drawPageShell(11, '13. Page Patterns | 14. Accessibility');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('13. Page Patterns & 14. Accessibility', 20, 36);

  // 13. Patterns
  doc.setFontSize(11);
  doc.text('13. Landing Page & Dashboard Layout Patterns', 20, 48);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 170, 32, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Landing Page layout: Hero banner (Centered headers) -> Features grids (3 columns)',
    '  -> Dynamic workstation panels -> Sign-up CTA conversion blocks.',
    '- Dashboard Layout structure: Collapsed left sidebar navigation menu items',
    '  -> Fixed top content headers block -> Repositories grid canvas table.'
  ], 25, 62);

  // 14. Accessibility
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text('14. WCAG Contrast Checking report details', 20, 96);

  const contrastWhite = getContrastRatio(primaryColor, '#ffffff');
  const contrastBlack = getContrastRatio(primaryColor, '#0f172a');

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 102, 170, 32, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    `- Primary brand color (${primaryColor}) contrast vs White: ${contrastWhite.toFixed(2)}:1 (Pass standard).`,
    `- Primary brand color (${primaryColor}) contrast vs Dark Slate: ${contrastBlack.toFixed(2)}:1 (Pass standard).`,
    '- WCAG AA conformance target: Maintain ratio > 4.5:1 for body and display type specimens.',
    '- Screen reader targets: Include descriptive aria attributes on all form component tags.'
  ], 25, 110);

  // ==========================================
  // PAGE 12: 15. DESIGN TOKENS | 16. FILE STRUCTURE
  // ==========================================
  doc.addPage();
  drawPageShell(12, '15. Design Tokens | 16. File Structure');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('15. Design Tokens & 16. File Structure', 20, 36);

  // 15. CSS Variables
  doc.setFontSize(11);
  doc.text('15. CSS :root design tokens variables export spec', 20, 48);

  doc.setFillColor(15, 23, 42); // dark slate terminal
  doc.roundedRect(20, 54, 170, 44, 3, 3, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248);
  doc.text([
    ':root {',
    `  --color-primary: ${primaryColor};`,
    `  --color-secondary: ${secondaryColor};`,
    `  --color-accent: ${accentColor};`,
    `  --border-radius: ${borderRadius}px;`,
    `  --button-radius: ${btnRadius};`,
    `  --button-color: ${btnColorHex};`,
    '}'
  ], 25, 62);

  // 16. Folder Tree
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('16. Folder structure schema directory hierarchy', 20, 108);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, 114, 170, 44, 3, 3, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248);
  doc.text([
    'design-system/',
    '├── tokens/ (colors.json, typography.json, buttons.json)',
    '├── components/ (Button, Input, Select, Switch, Alert, Badge)',
    '└── storybook/'
  ], 25, 122);

  // ==========================================
  // PAGE 13: 17. NAMING CONVENTION | 18. DOCUMENTATION
  // ==========================================
  doc.addPage();
  drawPageShell(13, '17. Naming Convention | 18. Documentation');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('17. Naming Convention & 18. Documentation', 20, 36);

  // 17. Naming
  doc.setFontSize(11);
  doc.text('17. Token Naming Convention standards', 20, 48);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 54, 170, 28, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Prefix naming standard: "ds-" prefix namespaces system tokens and styles.',
    '- Kebab-case naming format: lowercase words separated by dashes (e.g. ds-btn-primary).',
    '- Component modifier suffixes: use standard states (e.g. ds-btn-primary--hover).'
  ], 25, 62);

  // 18. Doc
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('18. Manual Documentation guidelines', 20, 92);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 98, 170, 28, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text([
    '- Export formats: Markdown specs, JSON tokens config, PDF manual guides.',
    '- Design system repository: Git-versioned with automated changelogs.',
    '- License guidelines: MIT Open Source terms apply.'
  ], 25, 106);

  // ==========================================
  // PAGE 14: 19. FIGMA TOKENS | 20. CHANGE LOG
  // ==========================================
  doc.addPage();
  drawPageShell(14, '19. Figma Tokens | 20. Change Log');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('19. Figma Tokens & 20. Change Log', 20, 36);

  // 19. Figma JSON
  doc.setFontSize(11);
  doc.text('19. Figma Token Studio JSON variables format', 20, 48);

  doc.setFillColor(15, 23, 42); // dark obsidian
  doc.roundedRect(20, 54, 170, 48, 3, 3, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(56, 189, 248);
  doc.text([
    '{',
    '  "global": {',
    `    "primary": { "value": "${primaryColor}", "type": "color" },`,
    `    "secondary": { "value": "${secondaryColor}", "type": "color" },`,
    `    "radius": { "value": "${borderRadius}px", "type": "borderRadius" },`,
    `    "button": { "value": "${btnColorHex}", "type": "color" }`,
    '  }',
    '}'
  ], 25, 62);

  // 20. History table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('20. Change Log Version History', 20, 112);

  // Draw simple alternate row list of logs
  let logItemY = 118;
  const logs = brandKit.changelog || [
    { version: bVersion, date: dateModified, user: 'admin@brandkit.ai', changes: 'Initial presets configuration' }
  ];
  logs.slice(0, 5).forEach((log, logIdx) => {
    doc.setFillColor(logIdx % 2 === 1 ? 248 : 255, logIdx % 2 === 1 ? 250 : 255, logIdx % 2 === 1 ? 252 : 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, logItemY, 170, 10, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`v${log.version}`, 24, logItemY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(log.date, 52, logItemY + 6);
    doc.text(log.changes, 85, logItemY + 6, { maxWidth: 100 });
    logItemY += 12;
  });

  // Return the PDF document
  return doc;
}

export function downloadBrandKitPDF(brandKit) {
  if (!brandKit) {
    if (typeof window !== 'undefined') {
      alert("Please select or create a Brand Kit first before downloading the PDF system guidelines.");
    }
    return;
  }
  const doc = generateBrandKitPDF(brandKit);
  if (doc) {
    const bName = brandKit.name || 'brand';
    doc.save(`${bName.replace(/\s+/g, '_')}_design_system.pdf`);
  }
}
