// A simulator for AI Brand Kit generation based on description and industry

const INDUSTRY_PALETTES = {
  tech: {
    primary: '#2563eb', // Blue
    secondary: '#7c3aed', // Violet
    accent: '#0d9488', // Teal
    neutral: '#4b5563',
    background: '#090d16',
    surface: '#111827',
    text: '#f9fafb'
  },
  finance: {
    primary: '#0f766e', // Deep Teal
    secondary: '#15803d', // Green
    accent: '#b45309', // Amber
    neutral: '#57534e',
    background: '#fafaf9',
    surface: '#ffffff',
    text: '#1c1917'
  },
  health: {
    primary: '#0891b2', // Cyan
    secondary: '#0d9488', // Teal
    accent: '#db2777', // Pink
    neutral: '#4b5563',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a'
  },
  creative: {
    primary: '#ec4899', // Pink
    secondary: '#f97316', // Orange
    accent: '#8b5cf6', // Purple
    neutral: '#6b7280',
    background: '#0f0c1b',
    surface: '#1b1435',
    text: '#fdf2f8'
  },
  food: {
    primary: '#dc2626', // Red
    secondary: '#ea580c', // Orange
    accent: '#ca8a04', // Yellow
    neutral: '#78716c',
    background: '#fdfcfa',
    surface: '#ffffff',
    text: '#292524'
  },
  eco: {
    primary: '#16a34a', // Green
    secondary: '#65a30d', // Lime
    accent: '#d97706', // Amber
    neutral: '#57534e',
    background: '#fcfcf9',
    surface: '#ffffff',
    text: '#1c1917'
  }
};

const MOODS = [
  {
    keywords: ['future', 'tech', 'cyber', 'space', 'quantum', 'ai', 'robot', 'metaverse', 'digital'],
    colors: {
      primary: '#6366f1', // Indigo
      secondary: '#d946ef', // Fuchsia
      accent: '#06b6d4', // Cyan
      background: '#030712',
      surface: '#0f172a',
      text: '#f9fafb'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      headingWeight: '800',
      scale: '1.25'
    },
    logos: ['🌌', '⚡', '🤖', '🔮', '🧬']
  },
  {
    keywords: ['nature', 'green', 'eco', 'organic', 'plant', 'clean', 'earth', 'sustain', 'garden', 'coffee'],
    colors: {
      primary: '#047857', // Emerald
      secondary: '#84cc16', // Lime
      accent: '#b45309', // Amber
      background: '#fafaf6',
      surface: '#ffffff',
      text: '#172554'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      headingWeight: '600',
      scale: '1.33'
    },
    logos: ['🌱', '🍃', '☕', '🪵', '☀️']
  },
  {
    keywords: ['luxury', 'premium', 'gold', 'royal', 'diamond', 'fashion', 'elegance', 'classic', 'art'],
    colors: {
      primary: '#111827', // Black
      secondary: '#b45309', // Amber/Gold
      accent: '#6b7280', // Gray
      background: '#1c1917',
      surface: '#292524',
      text: '#fafaf9'
    },
    typography: {
      headingFont: 'Cinzel',
      bodyFont: 'Lora',
      headingWeight: '400',
      scale: '1.2'
    },
    logos: ['👑', '💎', '✨', '⚜️', '🗝️']
  },
  {
    keywords: ['fun', 'kids', 'game', 'play', 'bold', 'juice', 'happy', 'bright', 'yellow', 'creative'],
    colors: {
      primary: '#f97316', // Orange
      secondary: '#eab308', // Yellow
      accent: '#ec4899', // Pink
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#431407'
    },
    typography: {
      headingFont: 'Fredoka',
      bodyFont: 'Quicksand',
      headingWeight: '700',
      scale: '1.41'
    },
    logos: ['🎮', '🎈', '🍭', '🎨', '🦁']
  }
];

export function simulateAIBrandKit(description, industry) {
  const descLower = description.toLowerCase();
  const indLower = (industry || '').toLowerCase();
  
  // 1. Determine mood based on keywords in description
  let selectedMood = MOODS[0]; // Default to tech
  for (const mood of MOODS) {
    if (mood.keywords.some(keyword => descLower.includes(keyword))) {
      selectedMood = mood;
      break;
    }
  }
  
  // 2. Select base colors
  let baseColors = { ...selectedMood.colors };
  
  // If industry matches a predefined palette, blend or use it
  let industryKey = 'tech';
  if (indLower.includes('finan') || indLower.includes('bank') || indLower.includes('crypto')) industryKey = 'finance';
  else if (indLower.includes('health') || indLower.includes('med') || indLower.includes('doctor')) industryKey = 'health';
  else if (indLower.includes('art') || indLower.includes('design') || indLower.includes('creat')) industryKey = 'creative';
  else if (indLower.includes('food') || indLower.includes('rest') || indLower.includes('drink')) industryKey = 'food';
  else if (indLower.includes('eco') || indLower.includes('green') || indLower.includes('earth')) industryKey = 'eco';
  
  const indColors = INDUSTRY_PALETTES[industryKey];
  
  // Blend primary and secondary
  const finalColors = {
    primary: indColors?.primary || baseColors.primary,
    secondary: baseColors.secondary,
    accent: indColors?.accent || baseColors.accent,
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    neutral: indColors?.neutral || '#6b7280',
    background: baseColors.background,
    surface: baseColors.surface,
    text: baseColors.text
  };
  
  // 3. Generate Brand Name and Tagline if description is short or create a mock name
  let brandName = 'AI Generated Brand';
  const words = description.split(' ').filter(w => w.length > 3);
  if (words.length > 0) {
    // Capitalize first word or two
    brandName = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).replace(/[^a-zA-Z]/g, '')).join(' ');
  }
  if (brandName.length < 3) {
    brandName = 'Apex' + (industryKey.charAt(0).toUpperCase() + industryKey.slice(1));
  }
  
  // 4. Create tagline
  let tagline = 'Empowering ' + (industry || 'Innovation');
  if (descLower.includes('space')) tagline = 'Beyond the Horizon';
  else if (descLower.includes('coffee')) tagline = 'Sip the Sustainability';
  else if (descLower.includes('finance')) tagline = 'Secure Future Wealth';
  else if (descLower.includes('health')) tagline = 'Wellness Reimagined';
  else if (descLower.includes('eco') || descLower.includes('green')) tagline = 'For a Greener Tomorrow';
  else if (descLower.includes('game') || descLower.includes('play')) tagline = 'Level Up Your Experience';
  
  // 5. Select logo symbol
  const symbol = selectedMood.logos[Math.floor(Math.random() * selectedMood.logos.length)];
  
  // 6. Typography
  const typography = {
    headingFont: selectedMood.typography.headingFont,
    bodyFont: selectedMood.typography.bodyFont,
    headingSize: 32,
    bodySize: 16,
    headingWeight: selectedMood.typography.headingWeight,
    bodyWeight: '400',
    scale: selectedMood.typography.scale
  };
  
  // 7. Spacing & Grids
  const spacing = {
    grid: 8,
    borderRadius: descLower.includes('premium') || descLower.includes('luxury') ? 4 : 12,
    padding: 16,
    margin: 24,
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
  };
  
  return {
    name: brandName,
    description: description,
    industry: industry || 'Technology',
    tagline: tagline,
    website: 'https://' + brandName.toLowerCase().replace(/\s+/g, '') + '.io',
    logo: `${symbol} ${brandName.toUpperCase()}`,
    logoVariants: [`${brandName} Primary`, `${brandName} Monochrome`, `${brandName} Accent`],
    favicon: symbol,
    socials: { twitter: '@' + brandName.toLowerCase().replace(/\s+/g, '') },
    colors: finalColors,
    typography,
    spacing,
    icons: ['Sparkles', 'Activity', 'Layers', 'TrendingUp', 'Globe', 'Compass'].slice(0, 4)
  };
}
