import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const incrementVersion = (currentVersion = '1.0.0') => {
  const parts = String(currentVersion).split('.').map(Number);
  if (parts.length === 3) {
    parts[2] += 1;
    return parts.join('.');
  }
  return '1.0.1';
};

const createHistoryAndChangelog = (p, changesName, userEmail) => {
  const currentVersion = p.version || '1.0.0';
  const nextVersion = incrementVersion(currentVersion);
  
  const historyEntry = {
    version: currentVersion,
    name: p.name,
    description: p.description,
    colors: { ...p.colors },
    typography: { ...p.typography },
    spacing: { ...p.spacing },
    dateModified: p.dateModified || new Date().toISOString().split('T')[0]
  };
  
  const changelogEntry = {
    version: nextVersion,
    date: new Date().toISOString().split('T')[0],
    user: userEmail || 'hello@brandkit.ai',
    changes: `Modified: ${changesName}`
  };

  return {
    version: nextVersion,
    history: [...(p.history || []), historyEntry],
    changelog: [...(p.changelog || []), changelogEntry]
  };
};

// Initial mock projects
const initialProjects = [
  {
    id: 'p1',
    name: 'Aethera Space',
    description: 'A futuristic space tourism and colonization agency making space travel accessible.',
    industry: 'Aerospace & Travel',
    tagline: 'The Stars Are Waiting',
    website: 'https://aethera.space',
    logo: '🌌 AETHERA',
    logoImage: null,
    logoVariants: ['Aethera Primary', 'Aethera Dark', 'Aethera Monochrome'],
    favicon: '🌌',
    socials: { twitter: '@aetheraspace', github: 'aethera-space' },
    colors: {
      primary: '#6366f1', // Indigo
      secondary: '#a855f7', // Purple
      accent: '#06b6d4', // Cyan
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#6b7280',
      background: '#0b0f19',
      surface: '#161e2e',
      text: '#f9fafb'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 48,
      headingSize: 32,
      subheadingSize: 20,
      bodySize: 14,
      headingWeight: '700',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 12,
      padding: 16,
      margin: 24,
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
    },
    icons: ['Rocket', 'Compass', 'Globe', 'Sparkles', 'Shield', 'Terminal']
  },
  {
    id: 'p2',
    name: 'EcoBeans Coffee',
    description: 'Sustainable, organic, fair-trade coffee roasters with zero waste packaging.',
    industry: 'Food & Beverage',
    tagline: 'Brewing a Better Planet',
    website: 'https://ecobeans.coffee',
    logo: '🌱 ECOBEANS',
    logoImage: null,
    logoVariants: ['EcoBeans Primary', 'EcoBeans Kraft', 'EcoBeans Light'],
    favicon: '🌱',
    socials: { instagram: '@ecobeans', twitter: '@ecobeans' },
    colors: {
      primary: '#15803d', // Green
      secondary: '#b45309', // Amber
      accent: '#ca8a04', // Yellow
      success: '#22c55e',
      warning: '#eab308',
      error: '#f43f5e',
      neutral: '#78716c',
      background: '#fcfbf7',
      surface: '#ffffff',
      text: '#1c1917'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      titleSize: 52,
      headingSize: 36,
      subheadingSize: 22,
      bodySize: 16,
      headingWeight: '600',
      bodyWeight: '400',
      scale: '1.33'
    },
    spacing: {
      grid: 8,
      borderRadius: 6,
      padding: 20,
      margin: 20,
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    icons: ['Coffee', 'Leaf', 'Heart', 'Sun', 'ShoppingBag', 'MapPin']
  },
  {
    id: 'p3',
    name: 'Zenith Health',
    description: 'A modern digital clinic delivering integrated personal healthcare and virtual therapeutics.',
    industry: 'Health & Wellness',
    tagline: 'Your Health in Harmony',
    website: 'https://zenithhealth.io',
    logo: '🏥 ZENITH',
    logoImage: null,
    logoVariants: ['Zenith Primary', 'Zenith Dark', 'Zenith Subtle'],
    favicon: '🏥',
    socials: { twitter: '@zenithhealth' },
    colors: {
      primary: '#059669', // Emerald
      secondary: '#0d9488', // Teal
      accent: '#34d399', // Mint
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#64748b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 44,
      headingSize: 30,
      subheadingSize: 18,
      bodySize: 14,
      headingWeight: '700',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 8,
      padding: 16,
      margin: 16,
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    icons: ['Activity', 'Heart', 'Shield', 'Sun', 'HelpCircle']
  },
  {
    id: 'p4',
    name: 'Aura Creative',
    description: 'A cutting-edge boutique agency designing premium immersive physical and digital experiences.',
    industry: 'Creative & Art',
    tagline: 'Artistry in Every Detail',
    website: 'https://auracreative.co',
    logo: '🎨 AURA',
    logoImage: null,
    logoVariants: ['Aura Primary', 'Aura Dark', 'Aura Neon'],
    favicon: '🎨',
    socials: { instagram: '@auracreative' },
    colors: {
      primary: '#e11d48', // Rose
      secondary: '#7c3aed', // Violet
      accent: '#fbbf24', // Yellow
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      neutral: '#4b5563',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#111827'
    },
    typography: {
      headingFont: 'Cinzel',
      bodyFont: 'Lora',
      titleSize: 56,
      headingSize: 38,
      subheadingSize: 24,
      bodySize: 16,
      headingWeight: '600',
      bodyWeight: '400',
      scale: '1.41'
    },
    spacing: {
      grid: 8,
      borderRadius: 4,
      padding: 24,
      margin: 32,
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
    },
    icons: ['Camera', 'Sparkles', 'Layers', 'Gift', 'Settings']
  },
  {
    id: 'p5',
    name: 'Apex Finance',
    description: 'A security-first, low-fee digital asset trading platform for next-gen global investments.',
    industry: 'Finance',
    tagline: 'Grow Wealth Securely',
    website: 'https://apex.finance',
    logo: '📊 APEX',
    logoImage: null,
    logoVariants: ['Apex Default', 'Apex Dark', 'Apex Monochrome'],
    favicon: '📊',
    socials: { twitter: '@apexfinance', github: 'apex-finance' },
    colors: {
      primary: '#1d4ed8', // Dark Blue
      secondary: '#475569', // Slate
      accent: '#d97706', // Amber
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      neutral: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 40,
      headingSize: 28,
      subheadingSize: 18,
      bodySize: 14,
      headingWeight: '800',
      bodyWeight: '400',
      scale: '1.20'
    },
    spacing: {
      grid: 8,
      borderRadius: 8,
      padding: 16,
      margin: 16,
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    icons: ['Shield', 'Database', 'Cpu', 'Terminal', 'Key', 'Lock']
  },
  {
    id: 'p6',
    name: 'Veloce Motors',
    description: 'High-performance electric vehicles crafted for race tracks and city streets alike.',
    industry: 'Automotive',
    tagline: 'Velocity Redefined',
    website: 'https://velocemotors.com',
    logo: '🏎️ VELOCE',
    logoImage: null,
    logoVariants: ['Veloce Red', 'Veloce Carbon', 'Veloce Light'],
    favicon: '🏎️',
    socials: { twitter: '@velocemotors' },
    colors: {
      primary: '#dc2626', // Crimson Red
      secondary: '#1f2937', // Charcoal
      accent: '#94a3b8', // Silver
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#4b5563',
      background: '#f1f5f9',
      surface: '#ffffff',
      text: '#0f172a'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 52,
      headingSize: 34,
      subheadingSize: 20,
      bodySize: 14,
      headingWeight: '900',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 16,
      padding: 18,
      margin: 24,
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
    },
    icons: ['Rocket', 'Compass', 'Settings', 'Shield', 'Activity']
  },
  {
    id: 'p7',
    name: 'AmberGlow Studio',
    description: 'A cozy, creative design studio utilizing warm terracotta tones and classic serif pairings.',
    industry: 'Creative & Art',
    tagline: 'Crafting Warm Visual Stories',
    website: 'https://amberglow.studio',
    logo: '🍯 AMBERGLOW',
    logoImage: null,
    logoVariants: ['AmberGlow Primary', 'AmberGlow Earth', 'AmberGlow Dark'],
    favicon: '🍯',
    socials: { instagram: '@amberglow', twitter: '@amberglow' },
    colors: {
      primary: '#d97706', // Amber 600
      secondary: '#c2410c', // Orange 700
      accent: '#f59e0b', // Amber 500
      success: '#10b981',
      warning: '#fbbf24',
      error: '#f43f5e',
      neutral: '#854d0e',
      background: '#fffdf5', // Warm Cream
      surface: '#fafaf9',
      text: '#451a03' // Deep brown/amber
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      titleSize: 50,
      headingSize: 34,
      subheadingSize: 20,
      bodySize: 15,
      headingWeight: '700',
      bodyWeight: '400',
      scale: '1.30'
    },
    spacing: {
      grid: 8,
      borderRadius: 10,
      padding: 20,
      margin: 24,
      shadow: '0 8px 30px rgba(120, 53, 4, 0.08)'
    },
    icons: ['Sparkles', 'Heart', 'Sun', 'Feather', 'Compass', 'Coffee']
  },
  {
    id: 'p8',
    name: 'Solaris Energy',
    description: 'Clean energy technologies and microgrid builders powering sustainable futures.',
    industry: 'Eco & Green',
    tagline: 'Powering a Brighter Tomorrow',
    website: 'https://solaris.energy',
    logo: '☀️ SOLARIS',
    logoImage: null,
    logoVariants: ['Solaris Primary', 'Solaris Golden', 'Solaris Dark'],
    favicon: '☀️',
    socials: { twitter: '@solarisenergy', github: 'solaris-energy' },
    colors: {
      primary: '#f97316', // Orange 500
      secondary: '#eab308', // Yellow 500
      accent: '#ef4444', // Red 500
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#78350f',
      background: '#fffbeb', // Light Amber Warmth
      surface: '#ffffff',
      text: '#1e1b4b'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 46,
      headingSize: 32,
      subheadingSize: 20,
      bodySize: 14,
      headingWeight: '800',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 14,
      padding: 16,
      margin: 24,
      shadow: '0 10px 25px -5px rgba(249, 115, 22, 0.1)'
    },
    icons: ['Sun', 'Zap', 'Activity', 'Shield', 'Globe', 'Compass']
  },
  {
    id: 'p9',
    name: 'Polaris Biotech',
    description: 'Clinical-tech and pharmaceutical pioneers researching molecular therapeutics.',
    industry: 'Health & Wellness',
    tagline: 'Precision Medicine For Life',
    website: 'https://polaris.bio',
    logo: '🧪 POLARIS',
    logoImage: null,
    logoVariants: ['Polaris Blue', 'Polaris Ice', 'Polaris Subtle'],
    favicon: '🧪',
    socials: { twitter: '@polarisbiotech', github: 'polaris-bio' },
    colors: {
      primary: '#06b6d4', // Cyan 500
      secondary: '#0f766e', // Teal 700
      accent: '#22d3ee', // Cyan 400
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#64748b',
      background: '#ecfeff', // Soft Ice Blue
      surface: '#ffffff',
      text: '#083344'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 44,
      headingSize: 30,
      subheadingSize: 18,
      bodySize: 14,
      headingWeight: '700',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 8,
      padding: 16,
      margin: 20,
      shadow: '0 4px 20px -2px rgba(6, 182, 212, 0.08)'
    },
    icons: ['Activity', 'Shield', 'Layers', 'GitBranch', 'Database', 'Key']
  },
  {
    id: 'p10',
    name: 'Nordic Cabin',
    description: 'Bespoke prefab architect cabins and premium woodland retreat builders.',
    industry: 'Creative & Art',
    tagline: 'Architectural Simplicity',
    website: 'https://nordiccabin.co',
    logo: '🌲 NORDIC',
    logoImage: null,
    logoVariants: ['Nordic Pine', 'Nordic Slate', 'Nordic Earth'],
    favicon: '🌲',
    socials: { instagram: '@nordiccabin' },
    colors: {
      primary: '#0f766e', // Teal 700
      secondary: '#334155', // Slate 700
      accent: '#5b21b6', // Violet
      success: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      neutral: '#64748b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a'
    },
    typography: {
      headingFont: 'Lora',
      bodyFont: 'Plus Jakarta Sans',
      titleSize: 52,
      headingSize: 34,
      subheadingSize: 22,
      bodySize: 15,
      headingWeight: '600',
      bodyWeight: '400',
      scale: '1.33'
    },
    spacing: {
      grid: 8,
      borderRadius: 4,
      padding: 24,
      margin: 32,
      shadow: '0 6px 18px rgba(15, 118, 110, 0.06)'
    },
    icons: ['Compass', 'MapPin', 'Home', 'Feather', 'Briefcase', 'BookOpen']
  },
  {
    id: 'p11',
    name: 'Quantix AI',
    description: 'Neural agent hosting pipelines and GPU computing services for enterprise machine learning.',
    industry: 'Technology',
    tagline: 'Supercomputing At Scale',
    website: 'https://quantix.ai',
    logo: '🔮 QUANTIX',
    logoImage: null,
    logoVariants: ['Quantix Fuchsia', 'Quantix Purple', 'Quantix Dark'],
    favicon: '🔮',
    socials: { twitter: '@quantixai', github: 'quantix-ai' },
    colors: {
      primary: '#d946ef', // Fuchsia 500
      secondary: '#8b5cf6', // Purple 500
      accent: '#06b6d4', // Cyan 500
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e',
      neutral: '#4b5563',
      background: '#090514', // Glowing Deep Obsidian
      surface: '#120d24',
      text: '#fdfaff'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      titleSize: 48,
      headingSize: 32,
      subheadingSize: 20,
      bodySize: 14,
      headingWeight: '800',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 16,
      padding: 16,
      margin: 24,
      shadow: '0 20px 40px rgba(139, 92, 246, 0.15)'
    },
    icons: ['Cpu', 'Terminal', 'Sparkles', 'Activity', 'Shield', 'Layers']
  },
  {
    id: 'p12',
    name: 'Synapse CRM',
    description: 'Sales force pipelines, lead qualifiers, and marketing sync integrations on one dashboard.',
    industry: 'E-Commerce',
    tagline: 'Synergize Your Pipeline',
    website: 'https://synapse.io',
    logo: '⚡ SYNAPSE',
    logoImage: null,
    logoVariants: ['Synapse Blue', 'Synapse Gray', 'Synapse Light'],
    favicon: '⚡',
    socials: { twitter: '@synapsecrm', github: 'synapse-sales' },
    colors: {
      primary: '#2563eb', // Blue 600
      secondary: '#475569', // Slate 600
      accent: '#3b82f6', // Blue 500
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#64748b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      titleSize: 42,
      headingSize: 28,
      subheadingSize: 18,
      bodySize: 14,
      headingWeight: '700',
      bodyWeight: '400',
      scale: '1.20'
    },
    spacing: {
      grid: 8,
      borderRadius: 8,
      padding: 16,
      margin: 16,
      shadow: '0 4px 6px -1px rgba(37, 99, 235, 0.05)'
    },
    icons: ['Users', 'Settings', 'Database', 'Activity', 'Layers', 'Mail']
  },
  {
    id: 'p13',
    name: 'Logos Analytics',
    description: 'High-frequency telemetry logging, real-time database audits, and security metrics dashboards.',
    industry: 'Technology',
    tagline: 'Log Everything. Audit Everywhere.',
    website: 'https://logos.dev',
    logo: '📟 LOGOS',
    logoImage: null,
    logoVariants: ['Logos Emerald', 'Logos Lime', 'Logos Dark'],
    favicon: '📟',
    socials: { twitter: '@logosdev', github: 'logos-telemetry' },
    colors: {
      primary: '#10b981', // Emerald 500
      secondary: '#06b6d4', // Cyan 500
      accent: '#84cc16', // Lime 500
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: '#6b7280',
      background: '#030712', // Pure Obsidian
      surface: '#0b0f19',
      text: '#f9fafb'
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Plus Jakarta Sans',
      titleSize: 46,
      headingSize: 32,
      subheadingSize: 20,
      bodySize: 14,
      headingWeight: '800',
      bodyWeight: '400',
      scale: '1.25'
    },
    spacing: {
      grid: 8,
      borderRadius: 12,
      padding: 16,
      margin: 24,
      shadow: '0 15px 30px rgba(16, 185, 129, 0.12)'
    },
    icons: ['Activity', 'Terminal', 'Database', 'Cpu', 'Lock', 'Check']
  }
];

// Initial mock technicians
const initialTechnicians = [
  { id: 't1', name: 'Elena Rostova', role: 'Brand Identity Specialist', rating: 4.9, avatar: '👩‍🎨' },
  { id: 't2', name: 'Marcus Vance', role: 'Typography & Layout Expert', rating: 4.8, avatar: '👨‍💻' },
  { id: 't3', name: 'Sarah Chen', role: 'Color Theory Consultant', rating: 5.0, avatar: '👩‍🔬' },
  { id: 't4', name: 'Oliver Bennett', role: 'Design System Architect', rating: 4.7, avatar: '👨‍🎨' }
];

// Initial mock bookings/service requests
const initialBookings = [
  {
    id: 'b1',
    userId: 'hello@brandkit.ai',
    brandName: 'Aethera Space',
    serviceType: 'Brand Audit',
    description: 'We need a full review of our color accessibility and contrast scores for WCAG AAA compliance.',
    status: 'In Progress',
    assignedTechnicianId: 't3',
    date: '2026-06-28',
    priority: 'High'
  },
  {
    id: 'b2',
    userId: 'hello@brandkit.ai',
    brandName: 'EcoBeans Coffee',
    serviceType: 'Design System Setup',
    description: 'Setting up reusable Tailwind CSS v4 design tokens and exporting React component configurations.',
    status: 'Assigned',
    assignedTechnicianId: 't4',
    date: '2026-06-29',
    priority: 'Medium'
  },
  {
    id: 'b3',
    userId: 'another@brandkit.ai',
    brandName: 'QuantumFinance',
    serviceType: 'Logo Design',
    description: 'Requesting a vector logo set and favicon variants for our blockchain-based fintech app.',
    status: 'Pending',
    assignedTechnicianId: null,
    date: '2026-06-30',
    priority: 'High'
  }
];

export const useStore = create(
  persist(
    (set, get) => ({
  // Authentication State
  user: null,
  
  // Projects & Active Brand Kit
  projects: initialProjects,
  activeProjectId: 'p1',
  
  // Bookings / Service Requests
  bookings: initialBookings,
  technicians: initialTechnicians,
  
  // Theme State
  darkMode: false,
  adminViewMode: 'admin',
  
  // Auth Actions
  login: (email, password, role = 'user') => {
    // Simulated login
    set({
      user: {
        email,
        name: role === 'admin' ? 'Admin Controller' : 'Alex Mercer',
        role,
        mobile: '+1 (555) 019-2834'
      }
    });
    return true;
  },
  
  loginMobile: (mobile) => {
    set({
      user: {
        email: 'mobile_user@brandkit.ai',
        name: 'Mobile User',
        role: 'user',
        mobile
      }
    });
    return true;
  },
  
  loginSocial: (provider, customData = null) => {
    set({
      user: {
        email: customData?.email || `${provider.toLowerCase()}_user@brandkit.ai`,
        name: customData?.name || `${provider} User`,
        role: 'user',
        mobile: null,
        avatar: customData?.avatar || null
      }
    });
    return true;
  },
  
  logout: () => {
    set({ user: null });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },
  
  // Theme Actions
  toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
  
  // Project Actions
  setActiveProject: (id) => set({ activeProjectId: id }),
  
  createProject: (name = 'New Brand', description = 'A custom design system.', industry = 'Technology') => {
    const safeName = String(name || 'New Brand');
    const newProject = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      name: safeName,
      description: description || 'A custom design system.',
      industry: industry || 'Technology',
      tagline: 'Brand Identity',
      website: '',
      logo: safeName.toUpperCase().substring(0, 1) + ' ' + safeName.toUpperCase(),
      logoVariants: [`${safeName} Primary`, `${safeName} Dark`],
      favicon: safeName.substring(0, 1) || '✨',
      socials: {},
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        neutral: '#6b7280',
        background: '#0b0f19',
        surface: '#161e2e',
        text: '#f9fafb'
      },
      logoImage: null,
      typography: {
        headingFont: 'Outfit',
        bodyFont: 'Inter',
        titleSize: 48,
        headingSize: 32,
        subheadingSize: 20,
        bodySize: 14,
        headingWeight: '700',
        bodyWeight: '400',
        scale: '1.25'
      },
      spacing: {
        grid: 8,
        borderRadius: 8,
        padding: 16,
        margin: 16,
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      icons: ['Layers', 'Settings', 'Activity']
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: newProject.id
    }));
    return newProject.id;
  },
  
  duplicateProject: (sourceId, newName) => {
    const sourceProject = get().projects.find(p => p.id === sourceId);
    if (!sourceProject) return null;

    const newId = 'p_' + Math.random().toString(36).substr(2, 9);
    const safeName = String(newName || sourceProject.name || 'New Custom Brand');
    const newProject = {
      ...sourceProject,
      id: newId,
      name: safeName,
      logo: '✨ ' + safeName.toUpperCase(),
      logoVariants: [`${safeName} Primary`, `${safeName} Light`],
      favicon: safeName.substring(0, 1) || '✨',
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: newId
    }));

    return newId;
  },

  deleteProject: (id) => {
    if (id.startsWith('p') && !id.includes('_')) {
      return false; // Prevent deleting core presets
    }
    set((state) => {
      const remainingProjects = state.projects.filter((p) => p.id !== id);
      let newActiveId = state.activeProjectId;
      if (state.activeProjectId === id) {
        newActiveId = remainingProjects[0]?.id || '';
      }
      return {
        projects: remainingProjects,
        activeProjectId: newActiveId
      };
    });
    return true;
  },

  checkAndDuplicate: (id) => {
    if (id.startsWith('p') && !id.includes('_')) {
      const sourceProject = get().projects.find(p => p.id === id);
      if (!sourceProject) return id;
      
      let newName = null;
      let isValid = false;
      let promptMsg = `You are modifying the "${sourceProject.name}" preset. Enter a brand name to save your changes to a new custom copy (cannot match original, contain "-", "copy", "custom", or "brand"):`;

      while (!isValid) {
        const input = window.prompt(promptMsg, '');
        if (input === null) return null; // Aborted
        
        const val = input.trim();
        const cleanOriginal = sourceProject.name.trim().toLowerCase();
        const cleanEntered = val.toLowerCase();
        
        if (!val) {
          promptMsg = 'Brand name cannot be empty. Please enter a new brand name:';
        } else if (cleanEntered === cleanOriginal) {
          promptMsg = `Name cannot be identical to the original "${sourceProject.name}". Please enter a new brand name:`;
        } else if (cleanEntered.includes('-') || cleanEntered.includes('copy') || cleanEntered.includes('custom') || cleanEntered.includes('brand')) {
          promptMsg = 'Name cannot contain hyphens ("-"), the word "copy", "custom", or "brand". Please enter a new brand name:';
        } else {
          newName = val;
          isValid = true;
        }
      }

      if (newName) {
        return get().duplicateProject(id, newName);
      }
      return null; // Aborted
    }
    return id;
  },

  updateProject: (id, updates) => {
    const targetId = get().checkAndDuplicate(id);
    if (!targetId) return null;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== targetId) return p;
        const keysSummary = Object.keys(updates).join(', ');
        const meta = createHistoryAndChangelog(p, keysSummary, state.user?.email);
        return {
          ...p,
          ...updates,
          ...meta,
          dateModified: new Date().toISOString().split('T')[0]
        };
      })
    }));
    return targetId;
  },
  
  updateProjectColors: (id, colors) => {
    const targetId = get().checkAndDuplicate(id);
    if (!targetId) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== targetId) return p;
        const meta = createHistoryAndChangelog(p, 'colors', state.user?.email);
        return {
          ...p,
          colors: { ...p.colors, ...colors },
          ...meta,
          dateModified: new Date().toISOString().split('T')[0]
        };
      })
    }));
  },
  
  updateProjectTypography: (id, typography) => {
    const targetId = get().checkAndDuplicate(id);
    if (!targetId) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== targetId) return p;
        const meta = createHistoryAndChangelog(p, 'typography', state.user?.email);
        return {
          ...p,
          typography: { ...p.typography, ...typography },
          ...meta,
          dateModified: new Date().toISOString().split('T')[0]
        };
      })
    }));
  },
  
  updateProjectSpacing: (id, spacing) => {
    const targetId = get().checkAndDuplicate(id);
    if (!targetId) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== targetId) return p;
        const meta = createHistoryAndChangelog(p, 'spacing', state.user?.email);
        return {
          ...p,
          spacing: { ...p.spacing, ...spacing },
          ...meta,
          dateModified: new Date().toISOString().split('T')[0]
        };
      })
    }));
  },
  
  toggleIconFavorite: (id, iconName) => {
    const targetId = get().checkAndDuplicate(id);
    if (!targetId) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== targetId) return p;
        const exists = p.icons.includes(iconName);
        const meta = createHistoryAndChangelog(p, `icon favorite: ${iconName}`, state.user?.email);
        return {
          ...p,
          ...meta,
          dateModified: new Date().toISOString().split('T')[0],
          icons: exists
            ? p.icons.filter((i) => i !== iconName)
            : [...p.icons, iconName]
        };
      })
    }));
  },

  rollbackProject: (id, targetVersion) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== id) return p;
        const historyMatch = (p.history || []).find(h => h.version === targetVersion);
        if (!historyMatch) return p;
        
        const currentVersion = p.version || '1.0.0';
        const nextVersion = incrementVersion(currentVersion);
        
        const historyEntry = {
          version: currentVersion,
          name: p.name,
          description: p.description,
          colors: { ...p.colors },
          typography: { ...p.typography },
          spacing: { ...p.spacing },
          dateModified: p.dateModified || new Date().toISOString().split('T')[0]
        };

        const changelogEntry = {
          version: nextVersion,
          date: new Date().toISOString().split('T')[0],
          user: state.user?.email || 'hello@brandkit.ai',
          changes: `Rolled back to version ${targetVersion}`
        };

        return {
          ...p,
          name: historyMatch.name,
          description: historyMatch.description,
          colors: { ...historyMatch.colors },
          typography: { ...historyMatch.typography },
          spacing: { ...historyMatch.spacing },
          version: nextVersion,
          history: [...(p.history || []), historyEntry],
          changelog: [...(p.changelog || []), changelogEntry],
          dateModified: new Date().toISOString().split('T')[0]
        };
      })
    }));
  },
  
  // Booking / Service Request Actions
  addBooking: (serviceType, description, priority = 'Medium') => {
    const activeProj = get().projects.find((p) => p.id === get().activeProjectId);
    const newBooking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      userId: get().user?.email || 'anonymous',
      brandName: activeProj ? activeProj.name : 'Unknown Brand',
      serviceType,
      description,
      status: 'Pending',
      assignedTechnicianId: null,
      date: new Date().toISOString().split('T')[0],
      priority
    };
    
    set((state) => ({
      bookings: [newBooking, ...state.bookings]
    }));
    return newBooking;
  },
  
  assignTechnician: (bookingId, technicianId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, assignedTechnicianId: technicianId, status: technicianId ? 'Assigned' : 'Pending' } : b
      )
    }));
  },
  
  updateBookingStatus: (bookingId, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      )
    }));
  },

  setAdminViewMode: (mode) => set({ adminViewMode: mode }),

  applyPresetToProject: (projectId, presetId) => {
    const state = get();
    const project = state.projects.find(p => p.id === projectId);
    const preset = state.projects.find(p => p.id === presetId);
    if (project && preset) {
      // Automatically generate a history backup & increment the version code
      const meta = createHistoryAndChangelog(
        project,
        `Replaced design foundation with Preset: ${preset.name}`,
        state.user?.email
      );

      set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            colors: { ...preset.colors },
            typography: { ...preset.typography },
            spacing: { ...preset.spacing },
            icons: [...(preset.icons || [])],
            logoVariants: [...(preset.logoVariants || [])],
            ...meta,
            dateModified: new Date().toISOString().split('T')[0]
          };
        })
      }));
      return true;
    }
    return false;
  },
  
  // Helper to get active project
  getActiveProjectDetails: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.activeProjectId) || state.projects[0];
  }
}),
{
  name: 'brand-kit-storage',
  merge: (persistedState, currentState) => {
    if (!persistedState) return currentState;
    const mergedProjects = [...(persistedState.projects || [])];
    if (currentState && currentState.projects) {
      currentState.projects.forEach((preset) => {
        const exists = mergedProjects.some((p) => p.id === preset.id);
        if (!exists) {
          mergedProjects.push(preset);
        }
      });
    }
    return {
      ...currentState,
      ...persistedState,
      projects: mergedProjects
    };
  }
}));
