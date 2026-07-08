import React, { useState } from 'react';
import { Card, Button } from './UI';
import {
  BookOpen, Image, Palette, Type, Maximize, Circle, Layers,
  Activity, Grid, FileCode, FolderTree, CheckCircle2, Clipboard, Check,
  AlertTriangle, CheckCircle, Info, Flame, Eye, Copy, Star, HelpCircle,
  Hash, Code, Shield, Columns, ArrowRight, Sun, Moon, Plus, Trash, Sparkles,
  History
} from 'lucide-react';
import { downloadBrandKitPDF } from '../utils/pdfGenerator';
import { downloadBrandKitMarkdown } from '../utils/mdGenerator';
import { downloadBrandKitJSON } from '../utils/jsonGenerator';

// Helper to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
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

// Generates dynamic 50-950 scale based on base color
function generateColorScale(baseHex) {
  const rgb = hexToRgb(baseHex);
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  return shades.map((shade, idx) => {
    const factor = idx / 10;
    let r, g, b;
    if (idx < 5) {
      // Lighten
      const t = (5 - idx) / 5 * 0.85;
      r = Math.round(rgb.r + (255 - rgb.r) * t);
      g = Math.round(rgb.g + (255 - rgb.g) * t);
      b = Math.round(rgb.b + (255 - rgb.b) * t);
    } else if (idx === 5) {
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    } else {
      // Darken
      const t = (idx - 5) / 5 * 0.7;
      r = Math.round(rgb.r * (1 - t));
      g = Math.round(rgb.g * (1 - t));
      b = Math.round(rgb.b * (1 - t));
    }
    const hex = '#' + [r, g, b].map(x => {
      const s = x.toString(16);
      return s.length === 1 ? '0' + s : s;
    }).join('');
    return { shade, hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${hexToHsl(hex).h}, ${hexToHsl(hex).s}%, ${hexToHsl(hex).l}%)` };
  });
}

// Simple WCAG contrast check
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

export default function DesignSystemSpecsPanel({
  brandName, tagline, voice, industry,
  primaryColor, secondaryColor, accentColor,
  borderRadius, headingFont, bodyFont, titleFont, subheadingFont,
  logoImage, darkMode,
  changelog = [], history = [], onRollback
}) {
  const [activeSpecTab, setActiveSpecTab] = useState(1);
  const [copiedFormat, setCopiedFormat] = useState(null);
  
  // Interactive UI configurations
  const [colorViewType, setColorViewType] = useState('grid'); // 'grid' | 'table'
  const [selectedComponent, setSelectedComponent] = useState('button'); // component viewer
  const [selectedLayout, setSelectedLayout] = useState('landing'); // layout wireframe viewer
  const [selectedTokenFormat, setSelectedTokenFormat] = useState('tailwind'); // code exporter format

  // Component state toggles
  const [switchChecked, setSwitchChecked] = useState(false);
  const [activeComponentTab, setActiveComponentTab] = useState(0);

  const bName = brandName || '';
  const bVoice = voice || 'Professional';
  const bTagline = tagline || 'A high-impact design paradigm.';
  const bIndustry = industry || 'Technology';

  // Dynamic Scale Generation
  const primaryScale = generateColorScale(primaryColor);
  const secondaryScale = generateColorScale(secondaryColor);
  const accentScale = generateColorScale(accentColor);
  const successScale = generateColorScale('#10b981');
  const warningScale = generateColorScale('#f59e0b');
  const errorScale = generateColorScale('#ef4444');
  const infoScale = generateColorScale('#06b6d4');

  const contrastWhite = getContrastRatio(primaryColor, '#ffffff');
  const contrastBlack = getContrastRatio(primaryColor, '#0f172a');

  const currentBrandKit = {
    name: bName,
    description: tagline || 'A premium brand identity.',
    industry: bIndustry,
    tagline: bTagline,
    logoImage: logoImage,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#6b7280',
      background: darkMode ? '#0b0f19' : '#fcfbf7',
      surface: darkMode ? '#161e2e' : '#ffffff',
      text: darkMode ? '#f9fafb' : '#1c1917'
    },
    typography: {
      titleFont: titleFont || headingFont || 'Outfit',
      headingFont: headingFont,
      subheadingFont: subheadingFont || headingFont || 'Outfit',
      bodyFont: bodyFont,
      titleSize: 48,
      headingSize: 32,
      subheadingSize: 20,
      bodySize: 14
    },
    spacing: {
      borderRadius: borderRadius
    },
    version: changelog[0]?.version || '1.0.0',
    changelog: changelog,
    history: history
  };

  // Specs Tabs Definition
  const specTabs = [
    { id: 1, name: '1. Brand Foundation', icon: BookOpen },
    { id: 2, name: '2. Logo System', icon: Image },
    { id: 3, name: '3. Color System', icon: Palette },
    { id: 4, name: '4. Typography System', icon: Type },
    { id: 5, name: '5. Spacing System', icon: Maximize },
    { id: 6, name: '6. Radius System', icon: Circle },
    { id: 7, name: '7. Shadow System', icon: Layers },
    { id: 8, name: '8. Borders & Outlines', icon: Hash },
    { id: 9, name: '9. Motion System', icon: Activity },
    { id: 10, name: '10. Iconography', icon: Star },
    { id: 11, name: '11. Grid & Layout', icon: Grid },
    { id: 12, name: '12. Component Library', icon: Code },
    { id: 13, name: '13. Page Patterns', icon: Columns },
    { id: 14, name: '14. Accessibility', icon: CheckCircle2 },
    { id: 15, name: '15. Design Tokens', icon: FileCode },
    { id: 16, name: '16. File Structure', icon: FolderTree },
    { id: 17, name: '17. Naming Convention', icon: HelpCircle },
    { id: 18, name: '18. Documentation', icon: Shield },
    { id: 19, name: '19. Figma Tokens', icon: Code },
    { id: 20, name: '20. Change Log / History', icon: History }
  ];

  const handleCopyToClipboard = (text, format) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const cardBg = darkMode ? 'bg-slate-950/40 border-slate-855/60 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-sm';
  const labelClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <Card className={`${cardBg} p-6 space-y-6 mt-10 w-full relative overflow-hidden transition-all duration-300 border-indigo-500/10 shadow-2xl`}>
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-orange-500 via-indigo-500 to-cyan-500" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 dark:border-slate-800 gap-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight flex items-center space-x-2">
            <Layers className="text-indigo-500 h-5 w-5" />
            <span>Design System Specifications{bName ? ` (${bName})` : ''}</span>
          </h3>
          <p className="text-xs text-slate-404 dark:text-slate-400">Scaleable tokens, assets, and specs generated in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Navigation Links (18 Sections) */}
        <div className="lg:col-span-3 flex flex-col space-y-1 max-h-[500px] overflow-y-auto pr-2 border-r dark:border-slate-800 border-slate-200">
          {specTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeSpecTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSpecTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      : 'text-slate-655 hover:text-slate-905 hover:bg-slate-50'
                }`}
              >
                <TabIcon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-9 space-y-6 overflow-y-auto max-h-[500px] pr-2">
          
          {/* 1. BRAND FOUNDATION */}
          {activeSpecTab === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">01. Brand Foundation</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">SaaS & Enterprise Core Values</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-4 rounded-xl border dark:border-slate-800 bg-slate-500/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-indigo-500">Brand Mission</span>
                  <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-300">
                    To empower products and enterprises within the <strong>{bIndustry}</strong> sector with a signature visual identity using a {bVoice} brand voice.
                  </p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl border dark:border-slate-800 bg-slate-500/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-purple-500">Brand Vision</span>
                  <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-300">
                    "{bTagline}" - Unifying customer experiences through clean aesthetics, responsive systems, and design tokens.
                  </p>
                </div>
              </div>
              <div className="space-y-3 p-4 rounded-xl border dark:border-slate-800 bg-slate-500/5">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-cyan-500">Core Values & Personality</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {['Accessible', 'Scalable', bVoice, 'High Fidelity'].map((val, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                      {val}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 border rounded-xl dark:border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">Tone of Voice</span>
                  <p className="font-semibold text-indigo-500 dark:text-indigo-400">{bVoice}</p>
                </div>
                <div className="p-3 border rounded-xl dark:border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">Design Philosophy</span>
                  <p className="font-semibold text-purple-500">Functional Minimalism</p>
                </div>
                <div className="p-3 border rounded-xl dark:border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">Emotional Keywords</span>
                  <p className="font-semibold text-cyan-500">Trust, Efficacy, Clarity</p>
                </div>
                <div className="p-3 border rounded-xl dark:border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">UX Principle</span>
                  <p className="font-semibold text-emerald-500">Intelligent Defaults</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. LOGO SYSTEM */}
          {activeSpecTab === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">02. Logo System</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Scale & Safe Boundary Rules</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Symbol</span>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                    {bName.substring(0,1).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-slate-450 mt-2 block">Min size: 16px</span>
                </div>
                <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Horizontal Wordmark</span>
                  <div className="flex items-center space-x-2">
                    <span className="h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>{bName.substring(0,1).toUpperCase()}</span>
                    <span className="font-bold text-sm">{bName}</span>
                  </div>
                  <span className="text-[10px] text-slate-450 mt-3 block">Min size: 32px</span>
                </div>
                <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">App Icon Grid</span>
                  <div className="h-12 w-12 rounded-xl border border-dashed border-indigo-500/40 flex items-center justify-center text-[8px] font-bold text-indigo-400 bg-indigo-500/5">
                    512px
                  </div>
                  <span className="text-[10px] text-slate-450 mt-2 block">App Store ready</span>
                </div>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2 text-xs">
                <span className="font-bold text-red-500 block">Incorrect Usage Guidelines</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Do not warp, stretch, or rotate the {bName} monogram.</li>
                  <li>Do not overlay the wordmark on saturated color backdrops with contrast ratio &lt; 4.5:1.</li>
                  <li>Maintain a minimum safe boundary padding equal to 50% of the emblem's diameter.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 3. COLOR SYSTEM */}
          {activeSpecTab === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">03. Color System</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">50-950 Token Scales</p>
                </div>
                <div className="flex bg-slate-500/5 p-0.5 border rounded-lg dark:border-slate-800">
                  <button
                    onClick={() => setColorViewType('grid')}
                    className={`text-[9px] font-bold px-2 py-1 rounded ${colorViewType === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Visual Grid
                  </button>
                  <button
                    onClick={() => setColorViewType('table')}
                    className={`text-[9px] font-bold px-2 py-1 rounded ${colorViewType === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Scale Table
                  </button>
                </div>
              </div>

              {colorViewType === 'grid' ? (
                <div className="space-y-4">
                  {['Primary', 'Secondary', 'Accent', 'Success', 'Warning', 'Error', 'Info'].map((scaleName) => {
                    const scale = scaleName === 'Primary' ? primaryScale :
                                  scaleName === 'Secondary' ? secondaryScale :
                                  scaleName === 'Accent' ? accentScale :
                                  scaleName === 'Success' ? successScale :
                                  scaleName === 'Warning' ? warningScale :
                                  scaleName === 'Error' ? errorScale : infoScale;
                    return (
                      <div key={scaleName} className="space-y-1.5">
                        <span className="text-[10px] font-bold block uppercase tracking-wider text-slate-400">{scaleName} Token Scale</span>
                        <div className="grid grid-cols-11 gap-1">
                          {scale.map((s) => (
                            <div key={s.shade} className="flex flex-col items-center">
                              <div className="w-full h-8 rounded border dark:border-slate-850/60 shadow-sm transition-all hover:scale-110 cursor-pointer" style={{ backgroundColor: s.hex }} title={`${s.hex}`} />
                              <span className="text-[8px] font-mono mt-1 text-slate-400">{s.shade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl dark:border-slate-855/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-[11px] min-w-[500px]">
                    <thead className={`text-[9px] uppercase font-semibold border-b ${darkMode ? 'bg-slate-900/30 border-slate-855/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <tr>
                        <th className="p-2.5">Token Name</th>
                        <th className="p-2.5">Shade</th>
                        <th className="p-2.5">HEX</th>
                        <th className="p-2.5">RGB</th>
                        <th className="p-2.5">HSL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10 font-mono">
                      {primaryScale.map((s) => (
                        <tr key={s.shade} className="hover:bg-slate-500/5">
                          <td className="p-2.5 font-bold text-indigo-400">--color-primary-{s.shade}</td>
                          <td className="p-2.5">{s.shade}</td>
                          <td className={`p-2.5 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{s.hex.toUpperCase()}</td>
                          <td className="p-2.5 text-slate-400">{s.rgb}</td>
                          <td className="p-2.5 text-slate-400">{s.hsl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. TYPOGRAPHY SYSTEM */}
          {activeSpecTab === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">04. Typography System</h4>
                <p className="text-[10px] text-slate-404 dark:text-slate-400 uppercase tracking-widest mt-0.5">Scale & Font Pairings</p>
              </div>
              <div className="overflow-x-auto border rounded-xl dark:border-slate-855/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className={`text-[9px] uppercase font-semibold border-b ${darkMode ? 'bg-slate-900/30 border-slate-855/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="p-3">Token</th>
                      <th className="p-3">Font Size</th>
                      <th className="p-3">Line Height</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Spacing</th>
                      <th className="p-3">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {[
                      { token: 'Display XXL', size: '64px', height: '72px', weight: '800', tracking: '-0.02em', usage: 'Large hero titles' },
                      { token: 'Display XL', size: '48px', height: '56px', weight: '800', tracking: '-0.02em', usage: 'Medium headlines' },
                      { token: 'Heading H1', size: '36px', height: '44px', weight: '700', tracking: '-0.015em', usage: 'Landing titles' },
                      { token: 'Heading H2', size: '30px', height: '38px', weight: '700', tracking: '-0.015em', usage: 'Section headers' },
                      { token: 'Heading H3', size: '24px', height: '32px', weight: '700', tracking: '-0.01em', usage: 'Card titles' },
                      { token: 'Heading H4', size: '20px', height: '28px', weight: '600', tracking: '-0.01em', usage: 'Sidebar labels' },
                      { token: 'Body XL', size: '18px', height: '28px', weight: '400', tracking: '0em', usage: 'Lead copy text' },
                      { token: 'Body Default', size: '14px', height: '22px', weight: '400', tracking: '0em', usage: 'Body copy, descriptions' },
                      { token: 'Small Caption', size: '12px', height: '18px', weight: '500', tracking: '0.01em', usage: 'Metadata descriptors' },
                      { token: 'Label Overline', size: '10px', height: '14px', weight: '700', tracking: '0.08em', usage: 'Uppercase tags' }
                    ].map((t) => (
                      <tr key={t.token} className="hover:bg-slate-500/5">
                        <td className="p-3 font-bold">{t.token}</td>
                        <td className="p-3 font-mono">{t.size}</td>
                        <td className="p-3 font-mono text-slate-400">{t.height}</td>
                        <td className="p-3 font-mono text-slate-405">{t.weight}</td>
                        <td className="p-3 font-mono text-slate-455">{t.tracking}</td>
                        <td className="p-3 text-slate-404">{t.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. SPACING SYSTEM */}
          {activeSpecTab === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">05. Spacing System</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">8-Point Layout Spacing Grid</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-4">
                <span className="text-[10px] font-bold block uppercase tracking-widest text-slate-400">Scale Specimen Grid</span>
                <div className="space-y-2">
                  {[2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((space) => (
                    <div key={space} className="flex items-center space-x-4 text-xs">
                      <span className="w-12 text-right font-mono text-slate-400 font-bold">{space}px</span>
                      <span className="w-12 text-right font-mono text-indigo-400">{(space/16).toFixed(3)}rem</span>
                      <div className="h-4 bg-indigo-500/20 border border-indigo-500/30 rounded" style={{ width: `${space * 2.5}px` }} />
                      <span className="text-[10px] text-slate-500 font-mono">--spacing-{space}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. RADIUS SYSTEM */}
          {activeSpecTab === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">06. Radius System</h4>
                <p className="text-[10px] text-slate-404 dark:text-slate-400 uppercase tracking-widest mt-0.5">Geometric Corner Rounding Tokens</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'none', val: '0px', usage: 'Fullbleed panels' },
                  { name: 'xs', val: '2px', usage: 'Checkboxes, selectors' },
                  { name: 'sm', val: '4px', usage: 'Action buttons' },
                  { name: 'md', val: `${Math.max(2, Math.round(borderRadius / 2))}px`, usage: 'Selects, inputs' },
                  { name: 'lg', val: `${borderRadius}px`, usage: 'Standard cards' },
                  { name: 'xl', val: `${borderRadius * 1.5}px`, usage: 'Popup menus, modals' },
                  { name: '2xl', val: `${borderRadius * 2}px`, usage: 'Outer dashboards' },
                  { name: 'full', val: '9999px', usage: 'Badges, pills' }
                ].map((r) => (
                  <div key={r.name} className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-404 dark:text-slate-400 uppercase block">{r.name} ({r.val})</span>
                    <div className="h-10 w-full bg-indigo-500/20 border border-indigo-500/30 mx-auto" style={{ borderRadius: r.val }} />
                    <span className="text-[9px] text-slate-500 block truncate">{r.usage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SHADOW SYSTEM */}
          {activeSpecTab === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">07. Shadow System</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">SaaS Elevation Levels</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'XS Shadow', shadow: 'shadow-xs', css: '0 1px 2px rgba(0,0,0,0.05)', map: 'Buttons' },
                  { name: 'SM Shadow', shadow: 'shadow-sm', css: '0 1px 3px rgba(0,0,0,0.1)', map: 'Tags, chips' },
                  { name: 'MD Shadow', shadow: 'shadow-md', css: '0 4px 6px -1px rgba(0,0,0,0.1)', map: 'Select dropdowns' },
                  { name: 'LG Shadow', shadow: 'shadow-lg', css: '0 10px 15px -3px rgba(0,0,0,0.1)', map: 'Modals, popovers' },
                  { name: 'XL Shadow', shadow: 'shadow-xl', css: '0 20px 25px -5px rgba(0,0,0,0.1)', map: 'Flyout menus' },
                  { name: '2XL Shadow', shadow: 'shadow-2xl', css: '0 25px 50px -12px rgba(0,0,0,0.25)', map: 'Global alerts' }
                ].map((sh) => (
                  <div key={sh.name} className={`p-5 border rounded-xl dark:border-slate-850 bg-slate-500/5 text-center space-y-2 ${sh.shadow}`}>
                    <span className="text-xs font-bold text-slate-350 block">{sh.name}</span>
                    <span className="text-[9px] text-indigo-400 font-mono block truncate">{sh.css}</span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Map: {sh.map}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. BORDERS & OUTLINES */}
          {activeSpecTab === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">08. Borders & Outlines</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Rules & Outlines Specifications</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 block">Border Widths</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="border border-indigo-500/40 p-2 text-center rounded">1px</div>
                    <div className="border-2 border-indigo-500/40 p-2 text-center rounded">2px</div>
                    <div className="border-4 border-indigo-500/40 p-2 text-center rounded">4px</div>
                    <div className="border-8 border-indigo-500/40 p-2 text-center rounded">8px</div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                  <span className="font-bold text-slate-400 block">Focus Rings Previews</span>
                  <div className="flex flex-wrap gap-4">
                    <button type="button" className="px-4 py-2 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 bg-indigo-650 text-white font-semibold text-xs transition-all cursor-pointer">
                      Offset 2px Ring
                    </button>
                    <button type="button" className="px-4 py-2 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-650 text-white font-semibold text-xs transition-all cursor-pointer">
                      Offset 0px Ring
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. MOTION SYSTEM */}
          {activeSpecTab === 9 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">09. Motion System</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Transition Easing Speeds</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-4">
                <span className="text-[10px] font-bold block uppercase tracking-widest text-slate-400">Duration & Easing curves preview</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Linear (150ms)', css: 'linear', transition: 'transition-all duration-150 ease-linear' },
                    { name: 'Ease-In-Out (300ms)', css: 'ease-in-out', transition: 'transition-all duration-300 ease-in-out' },
                    { name: 'Spring elastic (500ms)', css: 'cubic-bezier(0.34, 1.56, 0.64, 1)', transition: 'transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)' }
                  ].map((m) => (
                    <div key={m.name} className="p-4 border rounded-xl bg-slate-500/5 flex flex-col justify-between items-center text-center space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 block">{m.name}</span>
                      <button type="button" className={`px-4 py-2 bg-indigo-650 text-white font-semibold rounded-lg text-xs hover:scale-115 cursor-pointer ${m.transition}`}>
                        Hover Specimen
                      </button>
                      <span className="text-[9px] font-mono text-slate-500">{m.css}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. ICONOGRAPHY */}
          {activeSpecTab === 10 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">10. Iconography</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Asset Libraries & Line Weight Rules</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3 text-xs">
                <span className="font-bold text-slate-350 block">Lucide Icon Specification</span>
                <ul className="list-disc pl-4 space-y-2 text-slate-400">
                  <li>Stroke Weight: <strong>1.5px</strong> for secondary views, <strong>2px</strong> for buttons and active items.</li>
                  <li>Sizes: <strong>14px</strong> (caption labels), <strong>18px</strong> (menu bars), <strong>24px</strong> (marketing landing page features).</li>
                  <li>Library recommended: <strong>Lucide React</strong> version 8.1.0+ or custom styled outline SVGs.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 11. GRID & LAYOUT */}
          {activeSpecTab === 11 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">11. Grid & Layout</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Responsive Breakpoints Specifications</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-4">
                <span className="text-[10px] font-bold block uppercase tracking-widest text-slate-400">Grid configurations</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 border rounded-lg bg-slate-500/5">
                    <span className="font-bold block text-indigo-400 mb-1">Desktop (sm: 1280px)</span>
                    <span className="text-slate-400">12 Columns | 32px Gutter | 80px Margin</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-slate-500/5">
                    <span className="font-bold block text-purple-400 mb-1">Tablet (md: 768px)</span>
                    <span className="text-slate-400">8 Columns | 24px Gutter | 48px Margin</span>
                  </div>
                  <div className="p-3 border rounded-lg bg-slate-500/5">
                    <span className="font-bold block text-cyan-400 mb-1">Mobile (xs: 640px)</span>
                    <span className="text-slate-400">4 Columns | 16px Gutter | 16px Margin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 12. COMPONENT LIBRARY (FUNCTIONAL SPECIMEN RUNNER) */}
          {activeSpecTab === 12 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">12. Component Library Specs</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Interactive Specimen Playground</p>
                </div>
                <div className="relative">
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="text-xs rounded-lg py-1.5 px-3 focus:outline-none border dark:border-slate-800 bg-slate-905"
                  >
                    <option value="button">Action Buttons</option>
                    <option value="input">Text Inputs</option>
                    <option value="switch">Toggles Switch</option>
                    <option value="select">Dropdown Selects</option>
                  </select>
                </div>
              </div>

              {/* Working Render Sandbox */}
              <div className="p-6 border rounded-2xl dark:border-slate-800 bg-slate-500/5 flex flex-col items-center justify-center min-h-[140px] space-y-4">
                <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Live Preview Specimen</span>
                
                {selectedComponent === 'button' && (
                  <div className="flex space-x-3 w-full max-w-sm">
                    <button type="button" className="flex-1 text-xs font-semibold py-2 px-4 text-white hover:opacity-90 transition-all" style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px` }}>
                      Primary
                    </button>
                    <button type="button" className="flex-1 text-xs font-semibold py-2 px-4 border hover:bg-slate-500/5 transition-all text-slate-300" style={{ borderColor: secondaryColor, color: secondaryColor, borderRadius: `${borderRadius}px` }}>
                      Secondary
                    </button>
                  </div>
                )}

                {selectedComponent === 'input' && (
                  <div className="w-full max-w-sm space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block">Form Field Label</label>
                    <input
                      type="text"
                      placeholder="Input Focus Specimen..."
                      className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none border dark:border-slate-800 bg-slate-950/40 text-slate-100"
                      style={{ borderRadius: `${borderRadius}px` }}
                    />
                  </div>
                )}

                {selectedComponent === 'switch' && (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setSwitchChecked(!switchChecked)}
                      className={`h-5 w-10 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${switchChecked ? 'bg-indigo-650' : 'bg-slate-700'}`}
                    >
                      <span className={`h-4 w-4 rounded-full bg-white transition-transform ${switchChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs font-semibold">{switchChecked ? 'Checked State' : 'Unchecked State'}</span>
                  </div>
                )}

                {selectedComponent === 'select' && (
                  <div className="w-full max-w-sm relative">
                    <select className="w-full rounded-lg py-2 px-3 text-xs focus:outline-none border dark:border-slate-800 bg-slate-905 text-slate-300" style={{ borderRadius: `${borderRadius}px` }}>
                      <option>Inspection Option A</option>
                      <option>Inspection Option B</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Anatomy Specifications details */}
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3 text-xs">
                <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">Specifications & Accessibility guidelines</span>
                {selectedComponent === 'button' && (
                  <div className="space-y-1.5 text-slate-400">
                    <p><strong>Anatomy:</strong> Text label + Optional leading/trailing icon + border.</p>
                    <p><strong>Variants:</strong> Filled primary, outline secondary, flat ghost.</p>
                    <p><strong>Keyboard support:</strong> Tab focusable; triggers click on <code>Space</code> and <code>Enter</code> key presses.</p>
                  </div>
                )}
                {selectedComponent === 'input' && (
                  <div className="space-y-1.5 text-slate-400">
                    <p><strong>Anatomy:</strong> Label text + input text box + feedback description.</p>
                    <p><strong>States:</strong> Default, Active Focus (indigo border), Error state (red border), Success (green border).</p>
                    <p><strong>Screen readers:</strong> Must include a matching <code>id</code> and <code>htmlFor</code> association between label and input.</p>
                  </div>
                )}
                {selectedComponent === 'switch' && (
                  <div className="space-y-1.5 text-slate-400">
                    <p><strong>Anatomy:</strong> Outer track container + inner round thumb node.</p>
                    <p><strong>States:</strong> Checked active, unchecked flat, hover transition.</p>
                    <p><strong>Keyboard Support:</strong> Toggle state via <code>Space</code> key when focused.</p>
                  </div>
                )}
                {selectedComponent === 'select' && (
                  <div className="space-y-1.5 text-slate-400">
                    <p><strong>Anatomy:</strong> Selector label + Chevron drop indicator icon + options dropdown.</p>
                    <p><strong>Interaction:</strong> Clicking anywhere on the button toggles dropdown view overlay.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 13. PAGE PATTERNS */}
          {activeSpecTab === 13 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">13. Page Patterns</h4>
                  <p className="text-[10px] text-slate-405 uppercase tracking-widest mt-0.5">Wireframe Blueprint Previews</p>
                </div>
                <div className="relative">
                  <select
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value)}
                    className="text-xs rounded-lg py-1.5 px-3 focus:outline-none border dark:border-slate-800 bg-slate-905"
                  >
                    <option value="landing">Landing Page blueprint</option>
                    <option value="dashboard">Dashboard blueprint</option>
                    <option value="chat">AI Chat Specimen</option>
                  </select>
                </div>
              </div>

              {/* Wireframe Diagram Container */}
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-950 font-mono text-[9px] leading-relaxed overflow-x-auto text-indigo-400">
                {selectedLayout === 'landing' && (
                  <pre>
{`+-------------------------------------------------------------+
| [Navigation Header] Brand-kit Logo     Dashboard   Docs     |
+-------------------------------------------------------------+
|                                                             |
|                       ${bName.toUpperCase()} HERO                 |
|               "${bTagline.substring(0,35)}..."               |
|                                                             |
|               [ Primary CTA ]    [ Secondary CTA ]          |
|                                                             |
+-------------------------------------------------------------+
| [3 Column Features Grid]                                    |
| [Feature A]            [Feature B]            [Feature C]   |
+-------------------------------------------------------------+`}
                  </pre>
                )}

                {selectedLayout === 'dashboard' && (
                  <pre>
{`+-------------------------------------------------------------+
| [Header] Active BrandKit: ${bName}                Sign Out  |
+-------------------------------------------------------------+
| [Sidebar]          | [Main Workspace Panel]                 |
| - Dashboard        |                                        |
| - Builder          | +------------------------------------+ |
| - Settings         | | Stat Card: total repositories      | |
|                    | +------------------------------------+ |
|                    | | Complexity Area Chart (Recharts)   | |
|                    | +------------------------------------+ |
+--------------------+----------------------------------------+`}
                  </pre>
                )}

                {selectedLayout === 'chat' && (
                  <pre>
{`+-------------------------------------------------------------+
| [Header] AI Design Assistant Copilot             [Close x]  |
+-------------------------------------------------------------+
| (System) Welcome to ${bName} Design Spec builder.           |
| (Client) Customize border radius parameters.                |
| (System) Border radius updated to ${borderRadius}px.               |
|                                                             |
+-------------------------------------------------------------+
| [ Enter message... ]                          [ Send Icon ] |
+-------------------------------------------------------------+`}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* 14. ACCESSIBILITY */}
          {activeSpecTab === 14 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">14. Accessibility (WCAG Check)</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Real-Time Contrast checking</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-xs space-y-2">
                  <span className="font-bold block">Primary Color vs White Background</span>
                  <div className="flex justify-between items-center">
                    <span>Contrast Ratio</span>
                    <span className="font-bold font-mono">{contrastWhite.toFixed(2)}:1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>WCAG AA Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      contrastWhite >= 4.5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {contrastWhite >= 4.5 ? 'Pass (AA)' : 'Fail'}
                    </span>
                  </div>
                </div>
                <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-xs space-y-2">
                  <span className="font-bold block">Primary Color vs Dark Background</span>
                  <div className="flex justify-between items-center">
                    <span>Contrast Ratio</span>
                    <span className="font-bold font-mono">{contrastBlack.toFixed(2)}:1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>WCAG AA Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      contrastBlack >= 4.5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {contrastBlack >= 4.5 ? 'Pass (AA)' : 'Fail'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 15. DESIGN TOKENS (COPYABLE CODE BOXES) */}
          {activeSpecTab === 15 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">15. Design Tokens Exporter</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Configuration spec generators</p>
                </div>
                <div className="relative">
                  <select
                    value={selectedTokenFormat}
                    onChange={(e) => setSelectedTokenFormat(e.target.value)}
                    className="text-xs rounded-lg py-1.5 px-3 focus:outline-none border dark:border-slate-800 bg-slate-905"
                  >
                    <option value="tailwind">Tailwind CSS v4 @theme</option>
                    <option value="css">CSS Variables format</option>
                    <option value="json">JSON Tokens schema</option>
                  </select>
                </div>
              </div>

              {/* Code Container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-405">
                  <span className="uppercase font-bold">Generated tokens code</span>
                  <button
                    onClick={() => {
                      const code = selectedTokenFormat === 'tailwind' 
                        ? `@theme {\n  --color-brand-primary: ${primaryColor};\n  --color-brand-secondary: ${secondaryColor};\n  --color-brand-accent: ${accentColor};\n  --radius-brand: ${borderRadius}px;\n}`
                        : selectedTokenFormat === 'css'
                          ? `:root {\n  --color-primary: ${primaryColor};\n  --color-secondary: ${secondaryColor};\n  --color-accent: ${accentColor};\n  --border-radius-lg: ${borderRadius}px;\n}`
                          : JSON.stringify({ colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor }, radius: { brand: `${borderRadius}px` } }, null, 2);
                      handleCopyToClipboard(code, selectedTokenFormat);
                    }}
                    className="text-indigo-500 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <Copy size={11} />
                    <span>{copiedFormat === selectedTokenFormat ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto text-indigo-400 max-h-44">
                  {selectedTokenFormat === 'tailwind' && (
`@theme {
  --color-brand-primary: ${primaryColor};
  --color-brand-secondary: ${secondaryColor};
  --color-brand-accent: ${accentColor};
  --radius-brand: ${borderRadius}px;
}`
                  )}
                  {selectedTokenFormat === 'css' && (
`:root {
  --color-primary: ${primaryColor};
  --color-secondary: ${secondaryColor};
  --color-accent: ${accentColor};
  --border-radius-lg: ${borderRadius}px;
}`
                  )}
                  {selectedTokenFormat === 'json' && (
JSON.stringify({
  version: "1.0.0",
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor
  },
  typography: {
    title: titleFont || headingFont || 'Outfit',
    heading: headingFont,
    subheading: subheadingFont || headingFont || 'Outfit',
    body: bodyFont
  },
  radius: {
    brand: `${borderRadius}px`
  }
}, null, 2)
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* 16. FILE STRUCTURE */}
          {activeSpecTab === 16 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">16. Directory File Structure</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">React & Storybook Folder Hierarchy</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-xs text-slate-400">
                <span className="font-bold text-slate-205 block mb-2">React & Next.js Design System Structure</span>
                <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto text-indigo-400">
{`design-system/
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
└── storybook/`}
                </pre>
              </div>
            </div>
          )}

          {/* 17. NAMING CONVENTION */}
          {activeSpecTab === 17 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">17. Naming Convention Standard</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Token Casing & Standardizations</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-xs space-y-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 block">Colors</span>
                  <span className="text-slate-500 block">Format: color-&#123;group&#125;-&#123;shade&#125; (e.g. color-primary-500)</span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 block">React Components</span>
                  <span className="text-slate-400 block">PascalCase (e.g. &lt;Button /&gt;, &lt;CustomSelect /&gt;)</span>
                </div>
              </div>
            </div>
          )}

          {/* 18. DOCUMENTATION STANDARDS */}
          {activeSpecTab === 18 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">18. Documentation Standards</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Component checklist guidelines</p>
              </div>
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 text-xs space-y-2">
                <span className="font-bold text-slate-205 block">Component Documentation Checklist</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Anatomy diagram showing elements layout.</li>
                  <li>Props API definition with type variables.</li>
                  <li>Code examples in both React and HTML styles.</li>
                  <li>WCAG accessibility checklist & keyboard shortcuts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 19. FIGMA TOKENS */}
          {activeSpecTab === 19 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">19. Figma Variables Exporter</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Compatible with Figma Token Studio</p>
                </div>
                <button
                  onClick={() => {
                    const figmaJSON = JSON.stringify({
                      global: {
                        primary: { value: primaryColor, type: "color" },
                        secondary: { value: secondaryColor, type: "color" },
                        accent: { value: accentColor, type: "color" },
                        radius: { value: `${borderRadius}px`, type: "borderRadius" }
                      }
                    }, null, 2);
                    handleCopyToClipboard(figmaJSON, 'figma');
                  }}
                  className="text-xs text-indigo-500 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <Copy size={12} />
                  <span>{copiedFormat === 'figma' ? 'Copied!' : 'Copy Figma JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto text-indigo-400">
{`{
  "global": {
    "primary": { "value": "${primaryColor}", "type": "color" },
    "secondary": { "value": "${secondaryColor}", "type": "color" },
    "accent": { "value": "${accentColor}", "type": "color" },
    "radius": { "value": "${borderRadius}px", "type": "borderRadius" }
  }
}`}
              </pre>
            </div>
          )}

          {/* 20. CHANGE LOG & VERSION HISTORY */}
          {activeSpecTab === 20 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-2 dark:border-slate-855/60">
                <h4 className="text-sm font-bold">20. Change Log & Rollback History</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Version History & Rollback Control</p>
              </div>

              {changelog.length === 0 ? (
                <div className="p-8 border border-dashed rounded-xl text-center text-slate-500 text-xs">
                  No modifications logged. Save workstation changes to generate versions.
                </div>
              ) : (
                <div className="space-y-4">
                  {changelog.slice().reverse().map((log, idx) => {
                    // Check if there is an associated history entry to roll back to
                    const hasHistory = history.some((h) => h.version === log.version) || log.version === '1.0.0';
                    return (
                      <div key={idx} className="p-4 border rounded-xl dark:border-slate-850 bg-slate-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              v{log.version}
                            </span>
                            <span className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{log.date}</span>
                          </div>
                          <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{log.changes}</p>
                          <span className={`text-[10px] block mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-550'}`}>Modified by: {log.user}</span>
                        </div>
                        {hasHistory && onRollback && (
                          <button
                            onClick={() => onRollback(log.version)}
                            className="shrink-0 text-[10px] font-bold py-1.5 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white cursor-pointer transition-all shadow-md"
                          >
                            Rollback to v{log.version}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Card>
  );
}
