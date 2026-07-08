import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Button, Input, Card, Toast } from '../components/UI';
import { simulateAIBrandKit } from '../utils/aiSimulator';
import { downloadBrandKitPDF, generateBrandKitPDF } from '../utils/pdfGenerator';
import { downloadBrandKitMarkdown } from '../utils/mdGenerator';
import { downloadBrandKitJSON } from '../utils/jsonGenerator';
import { jsPDF } from 'jspdf';
import * as LucideIcons from 'lucide-react';
import {
  Sparkles, Palette, Type, Compass, Layers, Eye, Send, FileDown,
  ChevronRight, ChevronLeft, LogOut, Check, Search, Heart, User, Layout, Smartphone,
  Info, AlertCircle, RefreshCw, Star, Trash2, Sun, Moon, Menu, X, FileText, Download, ChevronDown, Shield, CheckCircle, Printer, Lock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import DesignSystemSpecsPanel from '../components/DesignSystemSpecsPanel';

// Helper to render lucide icons by string name with support for FontAwesome, Icons8, and Material Symbols styling
const DynamicIcon = ({ name, className, size = 20, strokeWidth = 2 }) => {
  if (!name) return <LucideIcons.HelpCircle className={className} size={size} />;

  // 1. Font Awesome (Solid shape style)
  if (name.startsWith('fa-')) {
    const cleanName = name.replace('fa-', '');
    const faMap = {
      'rocket': 'Rocket',
      'shield-halved': 'Shield',
      'earth-americas': 'Globe',
      'compass': 'Compass',
      'wand-magic-sparkles': 'Sparkles',
      'chart-line': 'Activity',
      'terminal': 'Terminal',
      'mug-hot': 'Coffee',
      'seedling': 'Leaf',
      'heart': 'Heart',
      'sun': 'Sun',
      'bag-shopping': 'ShoppingBag',
      'map-pin': 'MapPin',
      'layer-group': 'Layers',
      'gear': 'Settings',
      'key': 'Key',
      'lock': 'Lock',
      'briefcase': 'Briefcase',
      'book-open': 'BookOpen',
      'camera': 'Camera',
      'trophy': 'Award',
      'microchip': 'Cpu',
      'database': 'Database',
      'cloud': 'Cloud',
      'gift': 'Gift',
      'circle-question': 'HelpCircle'
    };
    const lucideName = faMap[cleanName] || 'HelpCircle';
    const IconComponent = LucideIcons[lucideName] || LucideIcons.HelpCircle;
    return (
      <span className="inline-flex items-center justify-center" title={`FontAwesome: ${name}`}>
        <IconComponent className={className} size={size} strokeWidth={strokeWidth} fill="currentColor" />
      </span>
    );
  }

  // 2. Icons8 (Thin outline style)
  if (name.startsWith('i8-')) {
    const cleanName = name.replace('i8-', '');
    const i8Map = {
      'rocket': 'Rocket',
      'shield': 'Shield',
      'globe': 'Globe',
      'compass': 'Compass',
      'stars': 'Sparkles',
      'activity': 'Activity',
      'terminal': 'Terminal',
      'coffee': 'Coffee',
      'leaf': 'Leaf',
      'heart': 'Heart',
      'sun': 'Sun',
      'shopping-bag': 'ShoppingBag',
      'map-pin': 'MapPin',
      'layers': 'Layers',
      'settings': 'Settings',
      'key': 'Key',
      'lock': 'Lock',
      'briefcase': 'Briefcase',
      'book': 'BookOpen',
      'camera': 'Camera',
      'trophy': 'Award',
      'cpu': 'Cpu',
      'database': 'Database',
      'cloud': 'Cloud',
      'gift': 'Gift',
      'help': 'HelpCircle'
    };
    const lucideName = i8Map[cleanName] || 'HelpCircle';
    const IconComponent = LucideIcons[lucideName] || LucideIcons.HelpCircle;
    return (
      <span className="inline-flex items-center justify-center" title={`Icons8: ${name}`}>
        <IconComponent className={className} size={size} strokeWidth={1.25} />
      </span>
    );
  }

  // 3. Material Symbols (Bold outlines)
  if (name.startsWith('sym-')) {
    const cleanName = name.replace('sym-', '');
    const symMap = {
      'rocket_launch': 'Rocket',
      'shield': 'Shield',
      'public': 'Globe',
      'explore': 'Compass',
      'auto_awesome': 'Sparkles',
      'monitoring': 'Activity',
      'terminal': 'Terminal',
      'coffee': 'Coffee',
      'eco': 'Leaf',
      'favorite': 'Heart',
      'wb_sunny': 'Sun',
      'shopping_bag': 'ShoppingBag',
      'pin_drop': 'MapPin',
      'layers': 'Layers',
      'settings': 'Settings',
      'key': 'Key',
      'lock': 'Lock',
      'work': 'Briefcase',
      'book': 'BookOpen',
      'photo_camera': 'Camera',
      'trophy': 'Award',
      'memory': 'Cpu',
      'database': 'Database',
      'cloud': 'Cloud',
      'featured_play_list': 'Gift',
      'help': 'HelpCircle'
    };
    const lucideName = symMap[cleanName] || 'HelpCircle';
    const IconComponent = LucideIcons[lucideName] || LucideIcons.HelpCircle;
    return (
      <span className="inline-flex items-center justify-center" title={`Material Symbol: ${name}`}>
        <IconComponent className={className} size={size} strokeWidth={2.5} />
      </span>
    );
  }

  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} size={size} />;
  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
};

// Helper component for modern attractive select dropdowns
const CustomSelect = ({ value, onChange, options, darkMode, className = "w-full", searchable = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedOption = options.find(o => o.value === value) || { value, label: value };

  // Filter options based on search query safely by converting values and labels to strings
  let filteredOptions = options.filter(o => {
    const labelStr = o.label ? String(o.label).toLowerCase() : '';
    const valueStr = o.value !== undefined && o.value !== null ? String(o.value).toLowerCase() : '';
    const queryStr = searchQuery.toLowerCase();
    return labelStr.includes(queryStr) || valueStr.includes(queryStr);
  });

  // If searchable is true and query is entered, and no exact match exists, allow adding as a custom option
  const exactMatch = options.some(o => {
    const valueStr = o.value !== undefined && o.value !== null ? String(o.value).toLowerCase() : '';
    return valueStr === searchQuery.trim().toLowerCase();
  });
  const canAddCustom = searchable && searchQuery.trim().length > 0 && !exactMatch;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className={`w-full text-sm rounded-lg py-2.5 px-3 flex items-center justify-between border cursor-pointer transition-all duration-200 focus:outline-none ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm'
        }`}
      >
        <span className="truncate font-medium">{selectedOption.label}</span>
        <ChevronDown size={14} className={`text-slate-404 transition-transform duration-200 shrink-0 ml-1.5 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 py-1.5 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 ${
              darkMode
                ? 'bg-slate-950/95 border-slate-800 text-white shadow-slate-950/50'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}
          >
            {searchable && (
              <div className="px-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or type Google Font..."
                  className={`w-full text-xs rounded-md px-2.5 py-1.5 border outline-none ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500/50'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-550/50'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 && !canAddCustom && (
              <div className="px-3.5 py-2 text-xs text-slate-400 italic">No matches found.</div>
            )}

            {canAddCustom && (
              <button
                type="button"
                onClick={() => {
                  onChange({ target: { value: searchQuery.trim() } });
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold text-indigo-500 dark:text-indigo-400 flex items-center justify-between hover:bg-indigo-500/10 cursor-pointer`}
              >
                <span>✨ Use "{searchQuery.trim()}" from Google Fonts</span>
              </button>
            )}

            {filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : darkMode
                        ? 'hover:bg-slate-900 text-slate-300 hover:text-white'
                        : 'hover:bg-slate-100 text-slate-705 hover:text-slate-905'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const googleFontsOptions = [
  { value: 'Outfit', label: 'Outfit (Sans-Serif)' },
  { value: 'Inter', label: 'Inter (Sans-Serif)' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Sans-Serif)' },
  { value: 'Poppins', label: 'Poppins (Sans-Serif)' },
  { value: 'Roboto', label: 'Roboto (Sans-Serif)' },
  { value: 'Montserrat', label: 'Montserrat (Sans-Serif)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Lora', label: 'Lora (Serif)' },
  { value: 'Cinzel', label: 'Cinzel (Serif)' },
  { value: 'Merriweather', label: 'Merriweather (Serif)' },
  { value: 'PT Serif', label: 'PT Serif (Serif)' },
  { value: 'Syne', label: 'Syne (Display)' },
  { value: 'Fredoka', label: 'Fredoka (Display)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Display)' },
  { value: 'Oswald', label: 'Oswald (Display)' },
  { value: 'Pacifico', label: 'Pacifico (Handwriting)' },
  { value: 'Caveat', label: 'Caveat (Handwriting)' },
  { value: 'Fira Code', label: 'Fira Code (Monospace)' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)' }
];

// Design System Component Style Helpers
const getButtonStyle = (project, type = 'primary') => {
  const btnStyle = project?.buttonStyle || {
    bgType: 'solid',
    radius: 8,
    borderWidth: 0,
    borderStyle: 'solid',
    shadow: 'sm',
    colorType: 'primary',
    customColor: '#6366f1'
  };
  const colors = project?.colors || {};
  
  let bg = colors.primary;
  if (type === 'secondary') bg = colors.secondary;
  if (type === 'accent') bg = colors.accent;
  
  if (btnStyle.colorType === 'custom' && type === 'primary') {
    bg = btnStyle.customColor;
  }

  const style = {
    borderRadius: `${btnStyle.radius !== undefined ? btnStyle.radius : (project?.spacing?.borderRadius || 8)}px`,
    borderWidth: `${btnStyle.borderWidth || 0}px`,
    borderStyle: btnStyle.borderStyle || 'solid',
    borderColor: type === 'outline' ? bg : 'transparent',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  };

  if (btnStyle.bgType === 'gradient') {
    style.backgroundImage = `linear-gradient(135deg, ${bg}, ${colors.secondary || bg})`;
    style.color = '#ffffff';
  } else if (type === 'outline') {
    style.backgroundColor = 'transparent';
    style.color = bg;
    style.borderColor = bg;
    style.borderWidth = `${btnStyle.borderWidth || 1}px`;
  } else {
    style.backgroundColor = bg;
    style.color = '#ffffff';
  }

  // Shadow mapping
  const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };
  style.boxShadow = shadows[btnStyle.shadow] || shadows.sm;
  
  return style;
};

const getBadgeStyle = (project, colorKey = 'primary') => {
  const badgeStyle = project?.badgeStyle || {
    bgType: 'soft',
    radius: 'full'
  };
  const colors = project?.colors || {};
  const color = colors[colorKey] || colors.primary;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.125rem 0.625rem',
    transition: 'all 0.15s ease'
  };

  const radii = {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '8px',
    full: '9999px'
  };
  style.borderRadius = radii[badgeStyle.radius] || radii.full;

  if (badgeStyle.bgType === 'solid') {
    style.backgroundColor = color;
    style.color = '#ffffff';
  } else if (badgeStyle.bgType === 'outline') {
    style.backgroundColor = 'transparent';
    style.color = color;
    style.border = `1.5px solid ${color}`;
  } else if (badgeStyle.bgType === 'glass') {
    style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    style.backdropFilter = 'blur(4px)';
    style.color = color;
    style.border = `1px solid ${color}30`;
  } else { // soft
    style.backgroundColor = `${color}15`;
    style.color = color;
  }

  return style;
};

const getLabelStyle = (project) => {
  const labelStyle = project?.labelStyle || {
    fontWeight: 'semibold',
    textTransform: 'uppercase'
  };

  return {
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }[labelStyle.fontWeight] || '600',
    textTransform: labelStyle.textTransform || 'uppercase'
  };
};

const getAlertStyle = (project, colorKey = 'primary') => {
  const alertStyle = project?.alertStyle || {
    leftBorder: true,
    bgType: 'soft',
    radius: 8
  };
  const colors = project?.colors || {};
  const color = colors[colorKey] || colors.primary;

  const style = {
    border: '1px solid transparent',
    padding: '1rem',
    display: 'flex',
    alignItems: 'start',
    gap: '0.75rem',
    borderRadius: `${alertStyle.radius !== undefined ? alertStyle.radius : 8}px`
  };

  if (alertStyle.leftBorder) {
    style.borderLeftWidth = '4px';
    style.borderLeftColor = color;
  }

  if (alertStyle.bgType === 'solid') {
    style.backgroundColor = color;
    style.color = '#ffffff';
    style.borderColor = color;
  } else if (alertStyle.bgType === 'glass') {
    style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    style.backdropFilter = 'blur(4px)';
    style.borderColor = `${color}25`;
    style.color = colors.text || '#ffffff';
  } else { // soft
    style.backgroundColor = `${color}08`;
    style.borderColor = `${color}20`;
    style.color = colors.text || '#1c1917';
  }

  return style;
};

const WORKSTATION_PREVIEW_CHART_DATA = [
  { name: 'W1', v1: 20, v2: 40 },
  { name: 'W2', v1: 45, v2: 25 },
  { name: 'W3', v1: 28, v2: 60 },
  { name: 'W4', v1: 70, v2: 50 },
  { name: 'W5', v1: 55, v2: 80 }
];

const ServicesForm = ({ activeProject, darkMode, cardClass, inputClass, getButtonStyle, triggerToast }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const availableServices = [
    { 
      id: '1', 
      title: 'Brand Identity Creation', 
      desc: 'Build a complete visual identity.',
      icon: 'Sparkles',
      badge: 'Identity',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      id: '2', 
      title: 'Design System Generation', 
      desc: 'Create reusable UI systems for web and mobile.',
      icon: 'Cpu',
      badge: 'System',
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      id: '3', 
      title: 'Asset & Documentation Management', 
      desc: 'Store, organize, and share all brand resources.',
      icon: 'FolderOpen',
      badge: 'Vault',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      id: '4', 
      title: 'Code & Design Tool Integration', 
      desc: 'Export to Figma, Tailwind CSS, React, and other frameworks.',
      icon: 'Terminal',
      badge: 'Export',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      id: '5', 
      title: 'AI-Powered Brand Intelligence', 
      desc: 'Generate, refine, and maintain brand assets and guidelines with AI.',
      icon: 'Cpu',
      badge: 'AI Smart',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const getServiceCardIcon = (iconName, gradientClasses) => {
    const LucideIcon = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return (
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClasses} text-white shadow-md`}>
        <LucideIcon size={18} />
      </div>
    );
  };

  const handleToggleService = (id) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      triggerToast('Please fill in your Name, Email, and Phone Number.', 'warning');
      return;
    }
    if (selectedServices.length === 0) {
      triggerToast('Please select at least one service.', 'warning');
      return;
    }
    setSubmitted(true);
    triggerToast('Thank you! A brand kit company specialist will contact you shortly.', 'success');
  };

  if (submitted) {
    return (
      <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Request Received!</h4>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Thank you, <span className="font-bold">{contactName}</span>! A brand kit company representative will review your request for the selected services and reach out to you at <span className="font-bold">{contactEmail}</span> or <span className="font-bold">{contactPhone}</span> shortly.
        </p>
        <button 
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSelectedServices([]);
            setContactName('');
            setContactEmail('');
            setContactPhone('');
            setContactMessage('');
          }}
          className="mt-4 px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer transition-all"
          style={getButtonStyle(activeProject, 'primary')}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-205 block">
          Select the Services you need:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableServices.map((service) => {
            const isChecked = selectedServices.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => handleToggleService(service.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between relative overflow-hidden select-none min-h-[165px] group ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.08] shadow-lg shadow-indigo-500/5 dark:shadow-indigo-950/20 scale-[1.02]'
                    : darkMode
                      ? 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 hover:scale-[1.01]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] shadow-xs'
                }`}
              >
                {/* Accent glow on hover */}
                <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-[40px] opacity-15 transition-opacity duration-300 group-hover:opacity-25 pointer-events-none bg-gradient-to-br ${service.color}`} />

                <div className="space-y-4">
                  {/* Header: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    {getServiceCardIcon(service.icon, service.color)}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isChecked
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : darkMode
                          ? 'bg-slate-850 text-slate-450 border border-slate-800'
                          : 'bg-slate-100 text-slate-550 border border-slate-200'
                    }`}>
                      {service.badge}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1">
                    <h4 className={`text-xs font-black tracking-tight transition-colors ${
                      isChecked
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {service.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Checkbox status */}
                <div className="mt-4 pt-3 border-t border-slate-500/10 flex items-center justify-between text-[10px] font-bold">
                  <span className={isChecked ? 'text-indigo-500' : 'text-slate-455'}>
                    {isChecked ? 'Selected' : 'Click to select'}
                  </span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-sm shadow-indigo-600/30'
                      : darkMode
                        ? 'border-slate-700 bg-slate-955 group-hover:border-slate-500'
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {isChecked && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-450 block">Your Name *</label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="John Doe"
            className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${inputClass}`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-455 block">Your Email Address *</label>
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="john@example.com"
            className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${inputClass}`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-450 block">Phone Number *</label>
          <input
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${inputClass}`}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-slate-450 block">Additional Message / Requirements</label>
        <textarea
          rows={3}
          value={contactMessage}
          onChange={(e) => setContactMessage(e.target.value)}
          placeholder="Tell us more about your brand project..."
          className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${inputClass}`}
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-6 py-2.5 text-xs font-bold text-white rounded-xl cursor-pointer transform hover:-translate-y-0.5 transition-all shadow-md w-auto"
          style={getButtonStyle(activeProject, 'primary')}
        >
          Submit Request & Contact Brand Kit Company
        </button>
      </div>
    </form>
  );
};

export default function UserDashboard() {
  const {
    user,
    projects,
    activeProjectId,
    bookings,
    technicians,
    darkMode,
    toggleTheme,
    setActiveProject,
    createProject,
    duplicateProject,
    updateProject,
    deleteProject,
    updateProjectColors,
    updateProjectTypography,
    updateProjectSpacing,
    toggleIconFavorite,
    addBooking,
    updateUser,
    rollbackProject,
    logout,
    adminViewMode,
    setAdminViewMode,
    applyPresetToProject
  } = useStore();

  const fallbackProject = {
    id: 'fallback',
    name: 'Brand Identity Project',
    tagline: 'Brand Identity System',
    description: 'A beautiful modern design system built with Brand Kit Builder.',
    industry: 'Technology',
    website: '',
    logo: '✨ BRANDKIT',
    logoImage: null,
    favicon: '✨',
    colors: {
      primary: '#6366f1',
      secondary: '#a855f7',
      accent: '#06b6d4',
      success: '#22c55e',
      warning: '#eab308',
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
      bodySize: 14
    },
    spacing: {
      borderRadius: 12
    },
    icons: ['Rocket', 'Shield', 'Globe', 'Compass']
  };

  const activeProject = (projects && projects.find((p) => p.id === activeProjectId)) || (projects && projects[0]) || fallbackProject;
  const presetProjects = (projects && projects.filter((p) => !p.id.includes('_'))) || [];
  const customProjects = (projects && projects.filter((p) => p.id.includes('_'))) || [];
  const activePreset = presetProjects.find((p) => p.id === activeProjectId) || presetProjects[0] || activeProject;
  const activeCustom = customProjects.find((p) => p.id === activeProjectId) || null;
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'brand' | 'colors' | 'typography' | 'icons' | 'components' | 'preview' | 'services'
  const [isBrandSelectedOrCreated, setIsBrandSelectedOrCreated] = useState(false);
  const [iconLibraryView, setIconLibraryView] = useState('Lucide React'); // 'Lucide React' | 'Font Awesome' | 'Icons8' | 'Material Symbols'
  const [modifyingProject, setModifyingProject] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [showActivateFirstModal, setShowActivateFirstModal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(null);
  
  const tokensComplexityData = React.useMemo(() => {
    return (projects || []).map(p => ({
      name: (p.name || '').split(' ')[0],
      'Icons': p.icons ? p.icons.length : 0,
      'Rules': p.customCategories ? p.customCategories.length : 0
    }));
  }, [projects]);
  const saveToastTimeoutRef = React.useRef(null);
  const prevProjectRef = React.useRef(null);

  // User Profile & Preferences State
  const [uiAccent, setUiAccent] = useState('indigo'); // 'indigo' | 'emerald' | 'teal' | 'rose' | 'amber'
  const [editProfileName, setEditProfileName] = useState(user?.name || '');
  const [editProfileEmail, setEditProfileEmail] = useState(user?.email || '');
  const [editProfileMobile, setEditProfileMobile] = useState(user?.mobile || '');

  // Auto-activate Brand Kit Workstation when a custom brand kit is active
  useEffect(() => {
    const isCustom = activeProjectId && activeProjectId.includes('_');
    if (isCustom) {
      setIsBrandSelectedOrCreated(true);
    }
  }, [activeProjectId]);

  // Synchronize state with authenticated user details
  useEffect(() => {
    if (user) {
      setEditProfileName(user.name);
      setEditProfileEmail(user.email);
      setEditProfileMobile(user.mobile || '');
    }
  }, [user]);

  // Accent Color Dynamic Remapping for Tailwind v4
  useEffect(() => {
    const root = document.documentElement;
    const accents = {
      indigo: {
        accent: '#4f46e5',
        hover: '#4338ca',
        light: '#6366f1',
        ultraLight: '#818cf8',
        shadow: 'rgba(79, 70, 229, 0.15)'
      },
      emerald: {
        accent: '#059669',
        hover: '#047857',
        light: '#10b981',
        ultraLight: '#34d399',
        shadow: 'rgba(5, 150, 105, 0.15)'
      },
      teal: {
        accent: '#0d9488',
        hover: '#0f766e',
        light: '#14b8a6',
        ultraLight: '#2dd4bf',
        shadow: 'rgba(13, 148, 136, 0.15)'
      },
      rose: {
        accent: '#e11d48',
        hover: '#be123c',
        light: '#f43f5e',
        ultraLight: '#fb7185',
        shadow: 'rgba(225, 29, 72, 0.15)'
      },
      amber: {
        accent: '#d97706',
        hover: '#b45309',
        light: '#f59e0b',
        ultraLight: '#fbbf24',
        shadow: 'rgba(217, 119, 6, 0.15)'
      }
    };

    const colors = accents[uiAccent] || accents.indigo;
    
    // Dynamically override Tailwind v4 core theme utility custom properties
    root.style.setProperty('--color-indigo-600', colors.hover);
    root.style.setProperty('--color-indigo-600', colors.accent);
    root.style.setProperty('--color-indigo-500', colors.light);
    root.style.setProperty('--color-indigo-400', colors.ultraLight);
    
    // Add custom helper variables
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-hover', colors.hover);
    root.style.setProperty('--theme-accent-light', colors.light);
    root.style.setProperty('--theme-accent-shadow', colors.shadow);
  }, [uiAccent]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editProfileName.trim() || !editProfileEmail.trim()) {
      triggerToast('Name and Email are required.', 'error');
      return;
    }
    updateUser({
      name: editProfileName.trim(),
      email: editProfileEmail.trim(),
      mobile: editProfileMobile.trim()
    });
    triggerToast('Profile updated successfully!', 'success');
  };

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);

  // Payment Lock & Gateway simulator states
  const [purchasedProjects, setPurchasedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('brandkit_purchased_projects');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null); // { project, type }
  const [selectedPlan, setSelectedPlan] = useState('single'); // 'single', 'pro', 'enterprise'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paypal', 'upi'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfName, setPreviewPdfName] = useState('');

  const handlePreviewPreset = (project) => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    const doc = generateBrandKitPDF(project);
    if (doc) {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
      setPreviewPdfName(project.name);
    }
  };

  const closePdfPreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
    setPreviewPdfName('');
  };

  const handleUseTemplate = (project) => {
    let newName = null;
    let isValid = false;
    let promptMsg = `Enter a brand name to duplicate "${project.name}" (cannot match original, contain "-", "copy", "custom", or "brand"):`;

    while (!isValid) {
      const input = window.prompt(promptMsg, '');
      if (input === null) return; // User cancelled
      
      const val = input.trim();
      const cleanOriginal = project.name.trim().toLowerCase();
      const cleanEntered = val.toLowerCase();
      
      if (!val) {
        promptMsg = 'Brand name cannot be empty. Please enter a brand name:';
      } else if (cleanEntered === cleanOriginal) {
        promptMsg = `Name cannot be identical to the original "${project.name}". Please enter a brand name:`;
      } else if (cleanEntered.includes('-') || cleanEntered.includes('copy') || cleanEntered.includes('custom') || cleanEntered.includes('brand')) {
        promptMsg = 'Name cannot contain hyphens ("-"), the word "copy", "custom", or "brand". Please enter a brand name:';
      } else {
        newName = val;
        isValid = true;
      }
    }

    if (!newName) return;

    // Create a new project copy from the preset
    const newProjId = createProject(
      newName, 
      project.description || 'A custom brand kit based on a preset template.', 
      project.industry || 'Technology'
    );
    
    // Update the new project's colors, typography, spacing, etc. to match the preset
    const updatedProjects = JSON.parse(localStorage.getItem('brandkit_projects') || '[]');
    const newProjIndex = updatedProjects.findIndex(p => p.id === newProjId);
    if (newProjIndex > -1) {
      updatedProjects[newProjIndex].colors = { ...project.colors };
      updatedProjects[newProjIndex].typography = { ...project.typography };
      updatedProjects[newProjIndex].spacing = { ...project.spacing };
      updatedProjects[newProjIndex].logoImage = project.logoImage;
      updatedProjects[newProjIndex].tagline = project.tagline;
      updatedProjects[newProjIndex].brandVoice = project.brandVoice;
      updatedProjects[newProjIndex].website = project.website;
      localStorage.setItem('brandkit_projects', JSON.stringify(updatedProjects));
      // Dispatch storage event to sync other states
      window.dispatchEvent(new Event('storage'));
    }
    
    // Load this customizable copy into active state
    setActiveProject(newProjId);
    setIsBrandSelectedOrCreated(true);
    
    // Load the copied details into the workstation edit state
    loadPresetIntoBuilder(updatedProjects[newProjIndex] || project);
    
    // Navigate to the workstation profile tab to let them edit it!
    setActiveTab('brand');
    triggerToast(`Created a customizable copy: "${newName}". You can now edit and download it!`, 'success');
  };

  // Card Simulator inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI Simulator inputs
  const [upiTxId, setUpiTxId] = useState('');

  const markProjectAsPurchased = (projectId, planType = 'single') => {
    const updated = { ...purchasedProjects, [projectId]: { plan: planType, date: new Date().toISOString() } };
    setPurchasedProjects(updated);
    localStorage.setItem('brandkit_purchased_projects', JSON.stringify(updated));
  };

  const handleDownloadBrandKit = (project, type) => {
    const isUnlocked = purchasedProjects[project?.id] || project?.plan === 'Pro' || project?.plan === 'Enterprise';
    if (!isUnlocked) {
      setPendingDownload({ project, type });
      setActiveTab('purchase-plan');
      triggerToast('Download locked! Transitioning to Purchase Plan...', 'warning');
      return;
    }

    if (type === 'pdf') {
      downloadBrandKitPDF(project);
    } else if (type === 'markdown' || type === 'md') {
      downloadBrandKitMarkdown(project);
    } else if (type === 'json') {
      downloadBrandKitJSON(project);
    }
  };

  const executePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      const targetProjectId = pendingDownload?.project?.id || activeProject?.id;
      const targetProjectName = pendingDownload?.project?.name || activeProject?.name || 'My Brand Kit';
      
      if (targetProjectId) {
        markProjectAsPurchased(targetProjectId, selectedPlan);
      }

      // Generate invoice receipt details
      const invoiceId = 'INV-' + Math.floor(100000 + Math.random() * 900000);
      const invoiceAmount = selectedPlan === 'single' ? 19.00 : selectedPlan === 'pro' ? 49.00 : 99.00;
      const invoiceItem = `Brand Kit Spec Compile License - ${targetProjectName} (${selectedPlan === 'single' ? 'Single Kit' : selectedPlan === 'pro' ? 'Startup Pro' : 'Enterprise Suite'})`;
      
      const newInvoice = {
        id: invoiceId,
        projectId: targetProjectId,
        date: new Date().toLocaleDateString(),
        customerName: 'John Doe',
        customerEmail: 'john.d@brandkit.ai',
        item: invoiceItem,
        subtotal: invoiceAmount,
        tax: 0.00,
        total: invoiceAmount,
        gateway: paymentMethod === 'card' ? 'Stripe' : paymentMethod === 'paypal' ? 'PayPal' : 'UPI Scan',
        txnId: paymentMethod === 'upi' ? (upiTxId || 'TXN' + Math.floor(100000000 + Math.random() * 900000000)) : 'ch_stripe_' + Math.floor(100000000 + Math.random() * 900000000),
        status: 'Completed'
      };
      
      setActiveInvoice(newInvoice);
      setPaymentSuccess(true);
      
      // Save order record to sync with the Admin Panel
      const currentOrders = JSON.parse(localStorage.getItem('brandkit_orders') || '[]');
      const newOrder = {
        id: newInvoice.id,
        projectId: targetProjectId,
        customer: newInvoice.customerEmail,
        items: newInvoice.item,
        total: `$${newInvoice.total.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        gateway: newInvoice.gateway
      };
      currentOrders.unshift(newOrder);
      localStorage.setItem('brandkit_orders', JSON.stringify(currentOrders));
      
      triggerToast('Subscription plan successfully unlocked!', 'success');

      if (pendingDownload) {
        setTimeout(() => {
          const { project, type } = pendingDownload;
          if (type === 'pdf') {
            downloadBrandKitPDF(project);
          } else if (type === 'markdown' || type === 'md') {
            downloadBrandKitMarkdown(project);
          } else if (type === 'json') {
            downloadBrandKitJSON(project);
          }
          setPendingDownload(null);
        }, 1000);
      }
    }, 2000);
  };

  // Sidebar collapsible & mobile menu state
  const renderBrandIcon = (project, sizeClass = 'w-6 h-6 text-[10px]') => {
    if (!project) return null;
    const favicon = project.favicon || '✨';
    if (favicon && favicon.length === 1 && favicon !== '🌌' && favicon !== '🌱' && favicon !== '⚡' && favicon !== '✨') {
      return (
        <div 
          className={`${sizeClass} rounded-lg flex items-center justify-center font-black text-white shrink-0 shadow-xs select-none`}
          style={{ 
            background: `linear-gradient(135deg, ${project.colors?.primary || '#6366f1'}, ${project.colors?.secondary || '#a855f7'})`
          }}
        >
          {favicon.toUpperCase()}
        </div>
      );
    }
    return <span className="shrink-0">{favicon}</span>;
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('brand_identity');
  const [slogans, setSlogans] = useState([]);
  const [servicesComments, setServicesComments] = useState([
    { id: 1, author: 'Elena Rostova', text: 'Contrast levels on primary look outstanding!', time: '10m ago' },
    { id: 2, author: 'Marcus Vance', text: 'Added Outfit font spec to the typography scale.', time: '1h ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [damSearch, setDamSearch] = useState('');
  const [damFiles, setDamFiles] = useState([
    { name: 'logo_primary.svg', category: 'Logos', size: '12 KB', status: 'Approved' },
    { name: 'outfit_bold.woff2', category: 'Fonts', size: '48 KB', status: 'Approved' },
    { name: 'hero_photography.jpg', category: 'Photography', size: '2.4 MB', status: 'Pending Review' },
    { name: 'brand_patterns.svg', category: 'Graphics', size: '180 KB', status: 'Approved' }
  ]);
  const [integrations, setIntegrations] = useState({
    figma: true,
    slack: false,
    github: false,
    webflow: false,
    notion: true
  });

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiIndustry, setAiIndustry] = useState('Technology');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Full Page Brand Builder State
  const [bName, setBName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [bTagline, setBTagline] = useState('');
  const [bIndustry, setBIndustry] = useState('Technology');
  const [bDesc, setBDesc] = useState('');
  const [bVoice, setBVoice] = useState('Visionary, Professional, and Bold');
  const [bWebsite, setBWebsite] = useState('');
  const [bPrimaryColor, setBPrimaryColor] = useState('#6366f1');
  const [bSecondaryColor, setBSecondaryColor] = useState('#a855f7');
  const [bAccentColor, setBAccentColor] = useState('#06b6d4');
  const [bHeadingFont, setBHeadingFont] = useState('Outfit');
  const [bBodyFont, setBBodyFont] = useState('Inter');
  const [bTitleFont, setBTitleFont] = useState('Outfit');
  const [bSubheadingFont, setBSubheadingFont] = useState('Outfit');
  const [bRadius, setBRadius] = useState(12);
  const [bLogoImage, setBLogoImage] = useState(null);
  const [bTitleSize, setBTitleSize] = useState(48);
  const [bHeadingSize, setBHeadingSize] = useState(32);
  const [bSubheadingSize, setBSubheadingSize] = useState(20);
  const [bBodySize, setBBodySize] = useState(14);
  const [bTitleColor, setBTitleColor] = useState('primary'); // 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom'
  const [bTitleCustomColor, setBTitleCustomColor] = useState('#6366f1');
  const [bTitleWeight, setBTitleWeight] = useState('800');

  const [bHeadingColor, setBHeadingColor] = useState('secondary'); // 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom'
  const [bHeadingCustomColor, setBHeadingCustomColor] = useState('#a855f7');
  const [bHeadingWeight, setBHeadingWeight] = useState('700');

  const [bSubheadingColor, setBSubheadingColor] = useState('accent'); // 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom'
  const [bSubheadingCustomColor, setBSubheadingCustomColor] = useState('#06b6d4');
  const [bSubheadingWeight, setBSubheadingWeight] = useState('600');

  const [bBodyColor, setBBodyColor] = useState('neutral'); // 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom'
  const [bBodyCustomColor, setBBodyCustomColor] = useState('#475569');
  const [bBodyWeight, setBBodyWeight] = useState('400');
  const [bLineHeight, setBLineHeight] = useState('1.5');
  const [bLetterSpacing, setBLetterSpacing] = useState('0px');
  const [bScale, setBScale] = useState('1.25');
  const [bIcons, setBIcons] = useState(['Rocket', 'Shield', 'Globe', 'Compass']);
  const [bCategories, setBCategories] = useState([
    { id: 'cat_1', name: 'Brand Voice', content: 'Our tone is professional yet friendly, confident, and visionary.' }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatContent, setNewCatContent] = useState('');

  // Button styling parameters
  const [bButtonBgType, setBButtonBgType] = useState('solid'); // 'solid' | 'gradient'
  const [bButtonRadius, setBButtonRadius] = useState(8);
  const [bButtonBorderWidth, setBButtonBorderWidth] = useState(0);
  const [bButtonBorderStyle, setBButtonBorderStyle] = useState('solid');
  const [bButtonShadow, setBButtonShadow] = useState('sm'); // 'none' | 'sm' | 'md' | 'lg'
  const [bButtonColorType, setBButtonColorType] = useState('primary'); // 'primary' | 'secondary' | 'accent' | 'custom'
  const [bButtonCustomColor, setBButtonCustomColor] = useState('#6366f1');

  // Icon styling parameters
  const [bIconBgType, setBIconBgType] = useState('none'); // 'none' | 'solid' | 'gradient' | 'glass'
  const [bIconRadius, setBIconRadius] = useState(8);
  const [bIconBorderWidth, setBIconBorderWidth] = useState(0);
  const [bIconStrokeWidth, setBIconStrokeWidth] = useState(2);
  const [bIconColorType, setBIconColorType] = useState('primary'); // 'primary' | 'secondary' | 'accent' | 'neutral'
  const [bIconLibrary, setBIconLibrary] = useState('Lucide React'); // 'Lucide React' | 'Font Awesome' | 'Icons8' | 'Material Symbols'

  // Badge styling parameters
  const [bBadgeBgType, setBBadgeBgType] = useState('soft'); // 'solid' | 'outline' | 'soft' | 'glass'
  const [bBadgeRadius, setBBadgeRadius] = useState('full'); // 'none' | 'sm' | 'md' | 'lg' | 'full'

  // Label styling parameters
  const [bLabelWeight, setBLabelWeight] = useState('semibold'); // 'normal' | 'medium' | 'semibold' | 'bold'
  const [bLabelTransform, setBLabelTransform] = useState('uppercase'); // 'none' | 'uppercase' | 'lowercase' | 'capitalize'

  // Notification Alert styling parameters
  const [bAlertBorder, setBAlertBorder] = useState(true); // Left accent border
  const [bAlertBgType, setBAlertBgType] = useState('soft'); // 'solid' | 'soft' | 'glass'
  const [bAlertRadius, setBAlertRadius] = useState(8); // corner radius

  // Dynamic Google Font Loader Hook
  useEffect(() => {
    const fontsToLoad = [bTitleFont, bHeadingFont, bSubheadingFont, bBodyFont].filter(Boolean);
    if (fontsToLoad.length === 0) return;
    
    const uniqueFonts = Array.from(new Set(fontsToLoad));
    const fontId = 'google-fonts-dashboard-loader';
    let linkEl = document.getElementById(fontId);
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = fontId;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    
    // Build Google Fonts import URL
    const familyParams = uniqueFonts.map(f => {
      const name = f.replace(/\s+/g, '+');
      return `family=${name}:wght@300;400;500;600;700;800;900`;
    }).join('&');
    
    linkEl.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
  }, [bTitleFont, bHeadingFont, bSubheadingFont, bBodyFont]);

  // 1. Store -> Local Workstation state synchronization
  useEffect(() => {
    if (activeProject) {
      const isPreset = activeProject.id && activeProject.id.startsWith('p') && !activeProject.id.includes('_');
      if (isPreset) {
        if (editingProjectId !== null) {
          setEditingProjectId(null);
        }
        setBName(''); // Presets open with no name in the workstation
      } else {
        if (editingProjectId !== activeProject.id) {
          setEditingProjectId(activeProject.id);
        }
        setBName(activeProject.name || '');
      }
      setBTagline(activeProject.tagline || '');
      setBIndustry(activeProject.industry || 'Technology');
      setBDesc(activeProject.description || '');
      setBVoice(activeProject.brandVoice || 'Visionary, Professional, and Bold');
      setBWebsite(activeProject.website || '');
      
      const colors = activeProject.colors || {};
      setBPrimaryColor(colors.primary || '#6366f1');
      setBSecondaryColor(colors.secondary || '#a855f7');
      setBAccentColor(colors.accent || '#06b6d4');
      
      const typography = activeProject.typography || {};
      setBHeadingFont(typography.headingFont || 'Outfit');
      setBBodyFont(typography.bodyFont || 'Inter');
      setBTitleFont(typography.titleFont || typography.headingFont || 'Outfit');
      setBSubheadingFont(typography.subheadingFont || typography.headingFont || 'Outfit');
      setBTitleSize(typography.titleSize || 48);
      setBHeadingSize(typography.headingSize || 32);
      setBSubheadingSize(typography.subheadingSize || 20);
      setBBodySize(typography.bodySize || 14);
      setBTitleColor(typography.titleColor || 'primary');
      setBTitleCustomColor(typography.titleCustomColor || '#6366f1');
      setBTitleWeight(typography.titleWeight || '800');
      setBHeadingColor(typography.headingColor || 'secondary');
      setBHeadingCustomColor(typography.headingCustomColor || '#a855f7');
      setBHeadingWeight(typography.headingWeight || '700');
      setBSubheadingColor(typography.subheadingColor || 'accent');
      setBSubheadingCustomColor(typography.subheadingCustomColor || '#06b6d4');
      setBSubheadingWeight(typography.subheadingWeight || '600');
      setBBodyColor(typography.bodyColor || 'neutral');
      setBBodyCustomColor(typography.bodyCustomColor || '#475569');
      setBBodyWeight(typography.bodyWeight || '400');
      setBLineHeight(typography.lineHeight || '1.5');
      setBLetterSpacing(typography.letterSpacing || '0px');
      setBScale(typography.scale || '1.25');
      
      const spacing = activeProject.spacing || {};
      setBRadius(spacing.borderRadius !== undefined ? spacing.borderRadius : 12);
      setBLogoImage(activeProject.logoImage || null);
      setBIcons(activeProject.icons || []);
      setBCategories(activeProject.customCategories || []);
      
      const buttonStyle = activeProject.buttonStyle || {};
      setBButtonBgType(buttonStyle.bgType || 'solid');
      setBButtonRadius(buttonStyle.radius !== undefined ? buttonStyle.radius : 8);
      setBButtonBorderWidth(buttonStyle.borderWidth !== undefined ? buttonStyle.borderWidth : 0);
      setBButtonBorderStyle(buttonStyle.borderStyle || 'solid');
      setBButtonShadow(buttonStyle.shadow || 'sm');
      setBButtonColorType(buttonStyle.colorType || 'primary');
      setBButtonCustomColor(buttonStyle.customColor || '#6366f1');
      
      const iconStyle = activeProject.iconStyle || {};
      setBIconBgType(iconStyle.bgType || 'none');
      setBIconRadius(iconStyle.radius !== undefined ? iconStyle.radius : 8);
      setBIconBorderWidth(iconStyle.borderWidth !== undefined ? iconStyle.borderWidth : 0);
      setBIconStrokeWidth(iconStyle.strokeWidth !== undefined ? iconStyle.strokeWidth : 2);
      setBIconColorType(iconStyle.colorType || 'primary');
      setBIconLibrary(iconStyle.library || 'Lucide React');
      
      const badgeStyle = activeProject.badgeStyle || {};
      setBBadgeBgType(badgeStyle.bgType || 'soft');
      setBBadgeRadius(badgeStyle.radius || 'full');
      
      const labelStyle = activeProject.labelStyle || {};
      setBLabelWeight(labelStyle.fontWeight || 'semibold');
      setBLabelTransform(labelStyle.textTransform || 'uppercase');
      
      const alertStyle = activeProject.alertStyle || {};
      setBAlertBorder(alertStyle.leftBorder !== undefined ? alertStyle.leftBorder : true);
      setBAlertBgType(alertStyle.bgType || 'soft');
      setBAlertRadius(alertStyle.radius !== undefined ? alertStyle.radius : 8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  // 2. Local Workstation -> Store synchronization (Autosave / Real-time updates)
  useEffect(() => {
    if (!editingProjectId) return;
    const project = projects.find(p => p.id === editingProjectId);
    if (!project) return;

    let hasSaved = false;

    // Check colors
    const colorsDiff = {};
    if (bPrimaryColor !== project.colors?.primary) colorsDiff.primary = bPrimaryColor;
    if (bSecondaryColor !== project.colors?.secondary) colorsDiff.secondary = bSecondaryColor;
    if (bAccentColor !== project.colors?.accent) colorsDiff.accent = bAccentColor;
    if (Object.keys(colorsDiff).length > 0) {
      updateProjectColors(editingProjectId, colorsDiff);
      hasSaved = true;
    }

    // Check typography
    const typoDiff = {};
    if (bTitleFont !== project.typography?.titleFont) typoDiff.titleFont = bTitleFont;
    if (bHeadingFont !== project.typography?.headingFont) typoDiff.headingFont = bHeadingFont;
    if (bSubheadingFont !== project.typography?.subheadingFont) typoDiff.subheadingFont = bSubheadingFont;
    if (bBodyFont !== project.typography?.bodyFont) typoDiff.bodyFont = bBodyFont;
    if (bTitleSize !== project.typography?.titleSize) typoDiff.titleSize = bTitleSize;
    if (bHeadingSize !== project.typography?.headingSize) typoDiff.headingSize = bHeadingSize;
    if (bSubheadingSize !== project.typography?.subheadingSize) typoDiff.subheadingSize = bSubheadingSize;
    if (bBodySize !== project.typography?.bodySize) typoDiff.bodySize = bBodySize;
    if (bTitleColor !== project.typography?.titleColor) typoDiff.titleColor = bTitleColor;
    if (bTitleCustomColor !== project.typography?.titleCustomColor) typoDiff.titleCustomColor = bTitleCustomColor;
    if (bTitleWeight !== project.typography?.titleWeight) typoDiff.titleWeight = bTitleWeight;
    if (bHeadingColor !== project.typography?.headingColor) typoDiff.headingColor = bHeadingColor;
    if (bHeadingCustomColor !== project.typography?.headingCustomColor) typoDiff.headingCustomColor = bHeadingCustomColor;
    if (bHeadingWeight !== project.typography?.headingWeight) typoDiff.headingWeight = bHeadingWeight;
    if (bSubheadingColor !== project.typography?.subheadingColor) typoDiff.subheadingColor = bSubheadingColor;
    if (bSubheadingCustomColor !== project.typography?.subheadingCustomColor) typoDiff.subheadingCustomColor = bSubheadingCustomColor;
    if (bSubheadingWeight !== project.typography?.subheadingWeight) typoDiff.subheadingWeight = bSubheadingWeight;
    if (bBodyColor !== project.typography?.bodyColor) typoDiff.bodyColor = bBodyColor;
    if (bBodyCustomColor !== project.typography?.bodyCustomColor) typoDiff.bodyCustomColor = bBodyCustomColor;
    if (bBodyWeight !== project.typography?.bodyWeight) typoDiff.bodyWeight = bBodyWeight;
    if (bLineHeight !== project.typography?.lineHeight) typoDiff.lineHeight = bLineHeight;
    if (bLetterSpacing !== project.typography?.letterSpacing) typoDiff.letterSpacing = bLetterSpacing;
    if (bScale !== project.typography?.scale) typoDiff.scale = bScale;
    if (Object.keys(typoDiff).length > 0) {
      updateProjectTypography(editingProjectId, typoDiff);
      hasSaved = true;
    }

    // Check spacing
    const spacingDiff = {};
    if (bRadius !== project.spacing?.borderRadius) spacingDiff.borderRadius = bRadius;
    if (Object.keys(spacingDiff).length > 0) {
      updateProjectSpacing(editingProjectId, spacingDiff);
      hasSaved = true;
    }

    // Check component styles & metadata
    const metaDiff = {};
    if (bName !== project.name) metaDiff.name = bName;
    if (bTagline !== project.tagline) metaDiff.tagline = bTagline;
    if (bIndustry !== project.industry) metaDiff.industry = bIndustry;
    if (bDesc !== project.description) metaDiff.description = bDesc;
    if (bVoice !== project.brandVoice) metaDiff.brandVoice = bVoice;
    if (bWebsite !== project.website) metaDiff.website = bWebsite;
    if (bLogoImage !== project.logoImage) metaDiff.logoImage = bLogoImage;
    if (JSON.stringify(bIcons) !== JSON.stringify(project.icons)) metaDiff.icons = bIcons;
    if (JSON.stringify(bCategories) !== JSON.stringify(project.customCategories)) metaDiff.customCategories = bCategories;
    
    // Check custom components styles
    const btnStyle = project.buttonStyle || {};
    if (bButtonBgType !== btnStyle.bgType || bButtonRadius !== btnStyle.radius || bButtonBorderWidth !== btnStyle.borderWidth || bButtonBorderStyle !== btnStyle.borderStyle || bButtonShadow !== btnStyle.shadow || bButtonColorType !== btnStyle.colorType || bButtonCustomColor !== btnStyle.customColor) {
      metaDiff.buttonStyle = {
        bgType: bButtonBgType,
        radius: bButtonRadius,
        borderWidth: bButtonBorderWidth,
        borderStyle: bButtonBorderStyle,
        shadow: bButtonShadow,
        colorType: bButtonColorType,
        customColor: bButtonCustomColor
      };
    }

    const iconStyle = project.iconStyle || {};
    if (bIconBgType !== iconStyle.bgType || bIconRadius !== iconStyle.radius || bIconBorderWidth !== iconStyle.borderWidth || bIconStrokeWidth !== iconStyle.strokeWidth || bIconColorType !== iconStyle.colorType || bIconLibrary !== iconStyle.library) {
      metaDiff.iconStyle = {
        bgType: bIconBgType,
        radius: bIconRadius,
        borderWidth: bIconBorderWidth,
        strokeWidth: bIconStrokeWidth,
        colorType: bIconColorType,
        library: bIconLibrary
      };
    }

    const badgeStyle = project.badgeStyle || {};
    if (bBadgeBgType !== badgeStyle.bgType || bBadgeRadius !== badgeStyle.radius) {
      metaDiff.badgeStyle = {
        bgType: bBadgeBgType,
        radius: bBadgeRadius
      };
    }

    const labelStyle = project.labelStyle || {};
    if (bLabelWeight !== labelStyle.fontWeight || bLabelTransform !== labelStyle.textTransform) {
      metaDiff.labelStyle = {
        fontWeight: bLabelWeight,
        textTransform: bLabelTransform
      };
    }

    const alertStyle = project.alertStyle || {};
    if (bAlertBorder !== alertStyle.leftBorder || bAlertBgType !== alertStyle.bgType || bAlertRadius !== alertStyle.radius) {
      metaDiff.alertStyle = {
        leftBorder: bAlertBorder,
        bgType: bAlertBgType,
        radius: bAlertRadius
      };
    }

    if (Object.keys(metaDiff).length > 0) {
      updateProject(editingProjectId, metaDiff);
      hasSaved = true;
    }

    if (hasSaved) {
      if (saveToastTimeoutRef.current) {
        clearTimeout(saveToastTimeoutRef.current);
      }
      saveToastTimeoutRef.current = setTimeout(() => {
        triggerToast('brand kit is susscessfully modified and saved.', 'success');
      }, 1500);
    }

    return () => {
      if (saveToastTimeoutRef.current) {
        clearTimeout(saveToastTimeoutRef.current);
      }
    };
  }, [
    editingProjectId,
    bName, bTagline, bIndustry, bDesc, bVoice, bWebsite,
    bPrimaryColor, bSecondaryColor, bAccentColor,
    bTitleFont, bHeadingFont, bSubheadingFont, bBodyFont,
    bTitleSize, bHeadingSize, bSubheadingSize, bBodySize,
    bTitleColor, bTitleCustomColor, bTitleWeight,
    bHeadingColor, bHeadingCustomColor, bHeadingWeight,
    bSubheadingColor, bSubheadingCustomColor, bSubheadingWeight,
    bBodyColor, bBodyCustomColor, bBodyWeight,
    bLineHeight, bLetterSpacing, bScale,
    bRadius, bLogoImage, bIcons, bCategories,
    bButtonBgType, bButtonRadius, bButtonBorderWidth, bButtonBorderStyle, bButtonShadow, bButtonColorType, bButtonCustomColor,
    bIconBgType, bIconRadius, bIconBorderWidth, bIconStrokeWidth, bIconColorType, bIconLibrary,
    bBadgeBgType, bBadgeRadius,
    bLabelWeight, bLabelTransform,
    bAlertBorder, bAlertBgType, bAlertRadius
  ]);

  // 3. Monitor active custom project changes to trigger save toast when modified from individual tab pages
  useEffect(() => {
    if (!activeProject) return;
    const isCustom = activeProjectId && activeProjectId.includes('_');
    if (!isCustom) {
      prevProjectRef.current = null;
      return;
    }

    if (prevProjectRef.current && prevProjectRef.current.id === activeProjectId) {
      const prev = prevProjectRef.current;
      const curr = activeProject;

      const colorsChanged = prev.colors?.primary !== curr.colors?.primary ||
                            prev.colors?.secondary !== curr.colors?.secondary ||
                            prev.colors?.accent !== curr.colors?.accent;

      const typoChanged = prev.typography?.titleFont !== curr.typography?.titleFont ||
                          prev.typography?.headingFont !== curr.typography?.headingFont ||
                          prev.typography?.subheadingFont !== curr.typography?.subheadingFont ||
                          prev.typography?.bodyFont !== curr.typography?.bodyFont ||
                          prev.typography?.titleSize !== curr.typography?.titleSize ||
                          prev.typography?.headingSize !== curr.typography?.headingSize ||
                          prev.typography?.subheadingSize !== curr.typography?.subheadingSize ||
                          prev.typography?.bodySize !== curr.typography?.bodySize ||
                          prev.typography?.titleColor !== curr.typography?.titleColor ||
                          prev.typography?.titleCustomColor !== curr.typography?.titleCustomColor ||
                          prev.typography?.titleWeight !== curr.typography?.titleWeight ||
                          prev.typography?.headingColor !== curr.typography?.headingColor ||
                          prev.typography?.headingCustomColor !== curr.typography?.headingCustomColor ||
                          prev.typography?.headingWeight !== curr.typography?.headingWeight ||
                          prev.typography?.subheadingColor !== curr.typography?.subheadingColor ||
                          prev.typography?.subheadingCustomColor !== curr.typography?.subheadingCustomColor ||
                          prev.typography?.subheadingWeight !== curr.typography?.subheadingWeight ||
                          prev.typography?.bodyColor !== curr.typography?.bodyColor ||
                          prev.typography?.bodyCustomColor !== curr.typography?.bodyCustomColor ||
                          prev.typography?.bodyWeight !== curr.typography?.bodyWeight ||
                          prev.typography?.lineHeight !== curr.typography?.lineHeight ||
                          prev.typography?.letterSpacing !== curr.typography?.letterSpacing ||
                          prev.typography?.scale !== curr.typography?.scale;

      const spacingChanged = prev.spacing?.borderRadius !== curr.spacing?.borderRadius;

      const metaChanged = prev.name !== curr.name ||
                          prev.tagline !== curr.tagline ||
                          prev.industry !== curr.industry ||
                          prev.description !== curr.description ||
                          prev.brandVoice !== curr.brandVoice ||
                          prev.website !== curr.website ||
                          prev.logoImage !== curr.logoImage ||
                          prev.logo !== curr.logo ||
                          JSON.stringify(prev.icons) !== JSON.stringify(curr.icons) ||
                          JSON.stringify(prev.customCategories) !== JSON.stringify(curr.customCategories) ||
                          JSON.stringify(prev.buttonStyle) !== JSON.stringify(curr.buttonStyle) ||
                          JSON.stringify(prev.iconStyle) !== JSON.stringify(curr.iconStyle) ||
                          JSON.stringify(prev.badgeStyle) !== JSON.stringify(curr.badgeStyle) ||
                          JSON.stringify(prev.labelStyle) !== JSON.stringify(curr.labelStyle) ||
                          JSON.stringify(prev.alertStyle) !== JSON.stringify(curr.alertStyle);

      if (colorsChanged || typoChanged || spacingChanged || metaChanged) {
        if (saveToastTimeoutRef.current) {
          clearTimeout(saveToastTimeoutRef.current);
        }
        saveToastTimeoutRef.current = setTimeout(() => {
          triggerToast('brand kit is susscessfully modified and saved.', 'success');
        }, 1500);
      }
    }

    prevProjectRef.current = JSON.parse(JSON.stringify(activeProject));
  }, [activeProjectId, activeProject]);

  // Booking state
  const [bookingService, setBookingService] = useState('Brand Audit');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingPriority, setBookingPriority] = useState('Medium');

  // Icon search state
  const [iconSearch, setIconSearch] = useState('');

  // Preview type state
  const [previewType, setPreviewType] = useState('landing'); // 'landing' | 'dashboard' | 'mobile'
  const [dashboardTab, setDashboardTab] = useState('dashboard'); // 'dashboard' | 'analytics' | 'team' | 'settings'
  const [mobileTab, setMobileTab] = useState('home'); // 'home' | 'search' | 'profile'
  const [successModal, setSuccessModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const saveProjectAction = (projId, isNew) => {
    const savedProjId = updateProject(projId, {
      name: bName.trim(),
      description: bDesc || 'A custom design system.',
      industry: bIndustry,
      tagline: bTagline || 'A premium brand identity.',
      logo: '✨ ' + bName.toUpperCase(),
      logoImage: bLogoImage,
      website: bWebsite,
      socials: { twitter: '@' + bName.toLowerCase().replace(/\s+/g, '') },
      colors: {
        primary: bPrimaryColor,
        secondary: bSecondaryColor,
        accent: bAccentColor,
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        neutral: '#6b7280',
        background: darkMode ? '#0b0f19' : '#fcfbf7',
        surface: darkMode ? '#161e2e' : '#ffffff',
        text: darkMode ? '#f9fafb' : '#1c1917'
      },
      typography: {
        titleFont: bTitleFont,
        headingFont: bHeadingFont,
        subheadingFont: bSubheadingFont,
        bodyFont: bBodyFont,
        titleSize: bTitleSize,
        headingSize: bHeadingSize,
        subheadingSize: bSubheadingSize,
        bodySize: bBodySize,
        titleColor: bTitleColor,
        titleCustomColor: bTitleCustomColor,
        titleWeight: bTitleWeight,
        headingColor: bHeadingColor,
        headingCustomColor: bHeadingCustomColor,
        headingWeight: bHeadingWeight,
        subheadingColor: bSubheadingColor,
        subheadingCustomColor: bSubheadingCustomColor,
        subheadingWeight: bSubheadingWeight,
        bodyColor: bBodyColor,
        bodyCustomColor: bBodyCustomColor,
        bodyWeight: bBodyWeight,
        scale: '1.25'
      },
      spacing: {
        grid: 8,
        borderRadius: bRadius,
        padding: 16,
        margin: 16,
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      icons: bIcons,
      brandVoice: bVoice,
      customCategories: bCategories,
      buttonStyle: {
        bgType: bButtonBgType,
        radius: bButtonRadius,
        borderWidth: bButtonBorderWidth,
        borderStyle: bButtonBorderStyle,
        shadow: bButtonShadow,
        colorType: bButtonColorType,
        customColor: bButtonCustomColor
      },
      iconStyle: {
        bgType: bIconBgType,
        radius: bIconRadius,
        borderWidth: bIconBorderWidth,
        strokeWidth: bIconStrokeWidth,
        colorType: bIconColorType,
        library: bIconLibrary
      },
      badgeStyle: {
        bgType: bBadgeBgType,
        radius: bBadgeRadius
      },
      labelStyle: {
        fontWeight: bLabelWeight,
        textTransform: bLabelTransform
      },
      alertStyle: {
        leftBorder: bAlertBorder,
        bgType: bAlertBgType,
        radius: bAlertRadius
      }
    });

    if (!savedProjId) return;

    if (isNew) {
      triggerToast(`"${bName}" Brand System created and launched!`, 'success');
      setSuccessModal({
        title: 'Brand System Created Successfully!',
        message: `"${bName}" Brand System has been created successfully. You can download its specifications at any time using the download buttons in the header.`,
        isNew: true
      });
    } else {
      triggerToast('brand kit is susscessfully modified and saved.', 'success');
      setSuccessModal({
        title: 'Brand System Saved Successfully!',
        message: `"${bName}" Brand System has been updated successfully. You can download its specifications at any time using the download buttons in the header.`,
        isNew: false
      });
    }

    setActiveProject(savedProjId);
    setEditingProjectId(savedProjId);
    setIsBrandSelectedOrCreated(true);
    setActiveTab('create-brand');
  };

  const handleLaunchBrandKit = () => {
    if (!bName.trim()) {
      triggerToast('Please enter a brand name.', 'error');
      return;
    }

    let projId = editingProjectId;
    let isNew = !projId;
    
    if (isNew) {
      const existing = projects.find(p => p.name && p.name.toLowerCase() === bName.trim().toLowerCase());
      if (existing) {
        setConfirmDialog({
          title: 'Overwrite Brand Kit?',
          message: `A Brand Kit with the name "${bName}" already exists. Do you want to overwrite it?`,
          onConfirm: () => {
            setConfirmDialog(null);
            saveProjectAction(existing.id, false);
          }
        });
        return;
      }
      const newProjId = createProject(bName, bDesc || 'A custom design system.', bIndustry);
      saveProjectAction(newProjId, true);
    } else {
      saveProjectAction(projId, false);
    }
  };

  const loadPresetIntoBuilder = (project) => {
    if (!project) return;
    // System presets have ids starting with 'p' (like p1, p10, etc.)
    const isPreset = project.id && project.id.startsWith('p') && !project.id.includes('_');
    if (isPreset) {
      setBName(''); 
      setEditingProjectId(null);
    } else {
      setBName(project.name || '');
      setEditingProjectId(project.id || null);
    }
    setBTagline(project.tagline || '');
    setBIndustry(project.industry || 'Technology');
    setBDesc(project.description || '');
    setBVoice(project.brandVoice || 'Visionary, Professional, and Bold');
    setBWebsite(project.website || '');
    
    const colors = project.colors || {};
    setBPrimaryColor(colors.primary || '#6366f1');
    setBSecondaryColor(colors.secondary || '#a855f7');
    setBAccentColor(colors.accent || '#06b6d4');
    
    const typography = project.typography || {};
    setBHeadingFont(typography.headingFont || 'Outfit');
    setBBodyFont(typography.bodyFont || 'Inter');
    setBTitleFont(typography.titleFont || typography.headingFont || 'Outfit');
    setBSubheadingFont(typography.subheadingFont || typography.headingFont || 'Outfit');
    
    const spacing = project.spacing || {};
    setBRadius(spacing.borderRadius !== undefined ? spacing.borderRadius : 12);
    setBLogoImage(project.logoImage || null);
    
    setBTitleSize(typography.titleSize || 48);
    setBHeadingSize(typography.headingSize || 32);
    setBSubheadingSize(typography.subheadingSize || 20);
    setBBodySize(typography.bodySize || 14);

    setBTitleColor(typography.titleColor || 'primary');
    setBTitleCustomColor(typography.titleCustomColor || '#6366f1');
    setBTitleWeight(typography.titleWeight || '800');

    setBHeadingColor(typography.headingColor || 'secondary');
    setBHeadingCustomColor(typography.headingCustomColor || '#a855f7');
    setBHeadingWeight(typography.headingWeight || '700');

    setBSubheadingColor(typography.subheadingColor || 'accent');
    setBSubheadingCustomColor(typography.subheadingCustomColor || '#06b6d4');
    setBSubheadingWeight(typography.subheadingWeight || '600');

    setBBodyColor(typography.bodyColor || 'neutral');
    setBBodyCustomColor(typography.bodyCustomColor || '#475569');
    setBBodyWeight(typography.bodyWeight || '400');
    
    setBIcons(project.icons || ['Rocket', 'Shield', 'Globe', 'Compass']);
    setBCategories(project.customCategories || [
      { id: 'cat_1', name: 'Brand Voice', content: project.brandVoice || 'Our tone is professional yet friendly, confident, and visionary.' }
    ]);

    const buttonStyle = project.buttonStyle || {};
    setBButtonBgType(buttonStyle.bgType || 'solid');
    setBButtonRadius(buttonStyle.radius !== undefined ? buttonStyle.radius : 8);
    setBButtonBorderWidth(buttonStyle.borderWidth !== undefined ? buttonStyle.borderWidth : 0);
    setBButtonBorderStyle(buttonStyle.borderStyle || 'solid');
    setBButtonShadow(buttonStyle.shadow || 'sm');
    setBButtonColorType(buttonStyle.colorType || 'primary');
    setBButtonCustomColor(buttonStyle.customColor || '#6366f1');

    const iconStyle = project.iconStyle || {};
    setBIconBgType(iconStyle.bgType || 'none');
    setBIconRadius(iconStyle.radius !== undefined ? iconStyle.radius : 8);
    setBIconBorderWidth(iconStyle.borderWidth !== undefined ? iconStyle.borderWidth : 0);
    setBIconStrokeWidth(iconStyle.strokeWidth !== undefined ? iconStyle.strokeWidth : 2);
    setBIconColorType(iconStyle.colorType || 'primary');
    setBIconLibrary(iconStyle.library || 'Lucide React');

    const badgeStyle = project.badgeStyle || {};
    setBBadgeBgType(badgeStyle.bgType || 'soft');
    setBBadgeRadius(badgeStyle.radius || 'full');

    const labelStyle = project.labelStyle || {};
    setBLabelWeight(labelStyle.fontWeight || 'semibold');
    setBLabelTransform(labelStyle.textTransform || 'uppercase');

    const alertStyle = project.alertStyle || {};
    setBAlertBorder(alertStyle.leftBorder !== undefined ? alertStyle.leftBorder : true);
    setBAlertBgType(alertStyle.bgType || 'soft');
    setBAlertRadius(alertStyle.radius !== undefined ? alertStyle.radius : 8);

    setActiveTab('create-brand');
  };

  const handleStartNewBrandKit = () => {
    setEditingProjectId(null);
    setBName('');
    setBTagline('');
    setBIndustry('General');
    setBDesc('');
    setBVoice('');
    setBWebsite('');
    setBPrimaryColor('#888888');
    setBSecondaryColor('#aaaaaa');
    setBAccentColor('#cccccc');
    setBHeadingFont('Inter');
    setBBodyFont('Inter');
    setBTitleFont('Inter');
    setBSubheadingFont('Inter');
    setBRadius(8);
    setBLogoImage(null);
    setBTitleSize(48);
    setBHeadingSize(32);
    setBSubheadingSize(20);
    setBBodySize(14);

    setBTitleColor('primary');
    setBTitleCustomColor('#888888');
    setBTitleWeight('700');

    setBHeadingColor('secondary');
    setBHeadingCustomColor('#aaaaaa');
    setBHeadingWeight('600');

    setBSubheadingColor('accent');
    setBSubheadingCustomColor('#cccccc');
    setBSubheadingWeight('500');

    setBBodyColor('neutral');
    setBBodyCustomColor('#475569');
    setBBodyWeight('400');
    setBIcons([]);
    setBCategories([]);
    
    // Reset button & icon styles
    setBButtonBgType('solid');
    setBButtonRadius(4);
    setBButtonBorderWidth(0);
    setBButtonBorderStyle('solid');
    setBButtonShadow('none');
    setBButtonColorType('primary');
    setBButtonCustomColor('#888888');

    setBIconBgType('none');
    setBIconRadius(4);
    setBIconBorderWidth(0);
    setBIconStrokeWidth(2);
    setBIconColorType('primary');
    setBIconLibrary('Lucide React');

    setBBadgeBgType('soft');
    setBBadgeRadius('md');

    setBLabelWeight('medium');
    setBLabelTransform('none');

    setBAlertBorder(false);
    setBAlertBgType('soft');
    setBAlertRadius(4);

    setActiveTab('create-brand');
  };

  const handleAIGenerate = (e) => {
    e.preventDefault();
    if (!aiPrompt) {
      triggerToast('Please enter a company description.', 'error');
      return;
    }
    setAiGenerating(true);
    triggerToast('AI is dreaming up your brand kit...', 'info');

    setTimeout(() => {
      try {
        const generatedKit = simulateAIBrandKit(aiPrompt, aiIndustry);
        const newProjId = createProject(generatedKit.name, generatedKit.description, generatedKit.industry);
        updateProject(newProjId, generatedKit);
        setAiGenerating(false);
        setAiPrompt('');
        triggerToast(`Successfully generated "${generatedKit.name}" Brand Kit!`, 'success');
        setSuccessModal({
          title: 'AI Brand Kit Generated!',
          message: `"${generatedKit.name}" Brand Kit has been dreamed up by AI and saved to your repository.`,
          isNew: true
        });
        setActiveTab('dashboard');
      } catch (err) {
        setAiGenerating(false);
        triggerToast('Failed to generate brand kit.', 'error');
      }
    }, 2000);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingDesc) {
      triggerToast('Please describe your service request.', 'error');
      return;
    }
    addBooking(bookingService, bookingDesc, bookingPriority);
    setBookingDesc('');
    triggerToast('Service request submitted successfully! Technicians will review in real-time.', 'success');
  };

  // Helper to get WCAG contrast score
  const getContrastScore = (hex1, hex2) => {
    const getLuminance = (hex) => {
      const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!rgb) return 0;
      const a = [
        parseInt(rgb[1], 16),
        parseInt(rgb[2], 16),
        parseInt(rgb[3], 16)
      ].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    const l1 = getLuminance(hex1) + 0.05;
    const l2 = getLuminance(hex2) + 0.05;
    const ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    
    let grade = 'Fail';
    if (ratio >= 7) grade = 'AAA (Pass)';
    else if (ratio >= 4.5) grade = 'AA (Pass)';
    else if (ratio >= 3) grade = 'Large Text (AA)';
    
    return { ratio: ratio.toFixed(2), grade };
  };

  const contrastInfo = getContrastScore(activeProject?.colors?.primary || '#6366f1', activeProject?.colors?.background || '#0b0f19');

  // Generate dynamic shades based on primary color (simulated)
  const getShades = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const factors = [0.95, 0.85, 0.7, 0.5, 0.3, 0, -0.15, -0.3, -0.45, -0.6, -0.75];
    const labels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    
    return labels.map((label, i) => {
      const factor = factors[i];
      let newR, newG, newB;
      if (factor >= 0) {
        newR = Math.round(r + (255 - r) * factor);
        newG = Math.round(g + (255 - g) * factor);
        newB = Math.round(b + (255 - b) * factor);
      } else {
        newR = Math.round(r * (1 + factor));
        newG = Math.round(g * (1 + factor));
        newB = Math.round(b * (1 + factor));
      }
      const hexString = '#' + [newR, newG, newB].map(x => {
        const hexVal = Math.max(0, Math.min(255, x)).toString(16);
        return hexVal.length === 1 ? '0' + hexVal : hexVal;
      }).join('');
      return { label, hex: hexString };
    });
  };

  const primaryShades = getShades(activeProject?.colors?.primary || '#6366f1');

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'brand', label: 'Brand Profile', icon: User },
    { id: 'colors', label: 'Color System', icon: Palette || Sparkles },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'icons', label: 'Icon Library', icon: Compass },
    { id: 'components', label: 'Component Lab', icon: Layers },
    { id: 'preview', label: 'Live Previews', icon: Eye },
    { id: 'services', label: 'Services', icon: LucideIcons.Briefcase }
  ];

  const isSystemPreset = activeProject?.id && activeProject.id.startsWith('p') && !activeProject.id.includes('_');

  const availableIcons = {
    'Lucide React': [
      'Rocket', 'Shield', 'Globe', 'Compass', 'Sparkles', 'Activity', 'Terminal', 'Coffee',
      'Leaf', 'Heart', 'Sun', 'ShoppingBag', 'MapPin', 'Layers', 'Settings', 'Key', 'Lock',
      'Briefcase', 'BookOpen', 'Camera', 'Award', 'Cpu', 'Database', 'Cloud', 'Gift', 'HelpCircle'
    ],
    'Font Awesome': [
      'fa-rocket', 'fa-shield-halved', 'fa-earth-americas', 'fa-compass', 'fa-wand-magic-sparkles', 'fa-chart-line', 'fa-terminal', 'fa-mug-hot',
      'fa-seedling', 'fa-heart', 'fa-sun', 'fa-bag-shopping', 'fa-map-pin', 'fa-layer-group', 'fa-gear', 'fa-key', 'fa-lock',
      'fa-briefcase', 'fa-book-open', 'fa-camera', 'fa-trophy', 'fa-microchip', 'fa-database', 'fa-cloud', 'fa-gift', 'fa-circle-question'
    ],
    'Icons8': [
      'i8-rocket', 'i8-shield', 'i8-globe', 'i8-compass', 'i8-stars', 'i8-activity', 'i8-terminal', 'i8-coffee',
      'i8-leaf', 'i8-heart', 'i8-sun', 'i8-shopping-bag', 'i8-map-pin', 'i8-layers', 'i8-settings', 'i8-key', 'i8-lock',
      'i8-briefcase', 'i8-book', 'i8-camera', 'i8-trophy', 'i8-cpu', 'i8-database', 'i8-cloud', 'i8-gift', 'i8-help'
    ],
    'Material Symbols': [
      'sym-rocket_launch', 'sym-shield', 'sym-public', 'sym-explore', 'sym-auto_awesome', 'sym-monitoring', 'sym-terminal', 'sym-coffee',
      'sym-eco', 'sym-favorite', 'sym-wb_sunny', 'sym-shopping_bag', 'sym-pin_drop', 'sym-layers', 'sym-settings', 'sym-key', 'sym-lock',
      'sym-work', 'sym-book', 'sym-photo_camera', 'sym-trophy', 'sym-memory', 'sym-database', 'sym-cloud', 'sym-featured_play_list', 'sym-help'
    ]
  }[iconLibraryView] || [];

  const filteredIcons = availableIcons.filter(name => {
    const searchVal = iconSearch.toLowerCase();
    const cleanName = name.replace('fa-', '').replace('i8-', '').replace('sym-', '').toLowerCase();
    return name.toLowerCase().includes(searchVal) || cleanName.includes(searchVal);
  });

  // Theme-based class definitions
  const bgMain = darkMode ? 'bg-[#070913] text-slate-100' : 'bg-[#f8fafc] text-slate-855';
  const bgSidebar = darkMode ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200/80 shadow-sm';
  const bgHeader = darkMode ? 'bg-[#080b14]/50 border-slate-800/60' : 'bg-white/85 border-slate-200/80 shadow-sm';
  const cardClass = darkMode ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200/80 shadow-sm text-slate-800';
  const cardTitleClass = darkMode ? 'text-white' : 'text-slate-900';
  const cardDescClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputClass = darkMode 
    ? 'border border-slate-800 bg-slate-900/80 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20' 
    : 'border border-slate-300/80 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-xs';
  const tableHeaderClass = darkMode ? 'bg-slate-900/40 border-slate-800/60 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-600';
  const tableRowClass = darkMode ? 'hover:bg-slate-900/20 divide-slate-800/40' : 'hover:bg-slate-50/80 divide-slate-200/40';

  // Dynamic brand style variables for live previews
  const activeColors = activeProject?.colors || {
    primary: '#6366f1',
    secondary: '#a855f7',
    accent: '#06b6d4',
    background: '#0b0f19',
    surface: '#161e2e',
    text: '#f9fafb'
  };
  const activeSpacing = activeProject?.spacing || { borderRadius: 12 };
  const activeTypography = activeProject?.typography || { headingFont: 'Outfit', bodyFont: 'Inter' };

  const brandStyleVars = {
    '--brand-primary': activeColors.primary,
    '--brand-secondary': activeColors.secondary,
    '--brand-accent': activeColors.accent,
    '--brand-background': activeColors.background,
    '--brand-surface': activeColors.surface,
    '--brand-text': activeColors.text,
    '--brand-radius': `${activeSpacing.borderRadius || 12}px`,
    '--brand-font-heading': activeTypography.headingFont || 'Outfit',
    '--brand-font-body': activeTypography.bodyFont || 'Inter',
  };

  // Sidebar Width Calculations
  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

  // Sidebar Component JSX
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col justify-between h-full py-4 select-none">
      <div className={`flex-1 pr-1 space-y-4 ${sidebarCollapsed && !isMobile ? 'overflow-y-visible' : 'overflow-y-auto scrollbar-none'}`}>
        {/* Header / Logo */}
        <div className={`flex items-center justify-between mb-5 px-6 ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="animate-in fade-in duration-200">
                <span className={`font-extrabold text-base tracking-tight ${darkMode ? 'bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400' : 'text-slate-900'}`}>
                  Brand-kit
                </span>
                <span className="block text-[10px] text-indigo-505 dark:text-indigo-400 font-bold uppercase tracking-widest">Design System</span>
              </div>
            )}
          </div>

          {/* Mobile Close Icon */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 md:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Dashboard Navigation Button - Positioned above Active Brand */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer relative group ${
              sidebarCollapsed && !isMobile ? 'justify-center py-2.5' : 'space-x-3 px-4 py-2'
            } ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : darkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  : 'text-slate-655 hover:text-slate-905 hover:bg-slate-100'
            }`}
          >
            <Layout size={18} className="shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span className="animate-in fade-in duration-200">Dashboard</span>}
            {sidebarCollapsed && !isMobile && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-slate-800/80 text-xs font-semibold text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
                Dashboard
              </div>
            )}
          </button>
          </div>        {/* Sidebar Action Controls */}
        <div className={`mb-4 px-4 ${sidebarCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
          {(!sidebarCollapsed || isMobile) ? (
            <div className="animate-in fade-in duration-200 space-y-2">
              <Button
                onClick={() => setActiveTab('presets')}
                variant="outline"
                className="w-full py-2 flex items-center justify-center border border-indigo-500/30 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm cursor-pointer transform hover:-translate-y-0.5 transition-all bg-indigo-500/5 hover:bg-indigo-500/10 text-xs"
              >
                <Star size={14} className="mr-1.5 shrink-0" />
                <span>Brand Presets</span>
              </Button>
              <Button
                onClick={handleStartNewBrandKit}
                variant="default"
                className="w-full py-2 flex items-center justify-center bg-linear-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white rounded-lg shadow-lg shadow-indigo-500/10 border-none cursor-pointer transform hover:-translate-y-0.5 transition-all text-xs"
              >
                <Sparkles size={14} className="mr-1.5 shrink-0" />
                <span>Create New Brand-Kit</span>
              </Button>
            </div>
          ) : (
            <div className="relative group">
              <div
                className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleStartNewBrandKit}
              >
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-slate-800/80 text-xs font-semibold text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
                Create New Brand Kit
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-0.5 px-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center rounded-xl text-[13px] transition-all duration-200 cursor-pointer relative group ${
                  sidebarCollapsed && !isMobile ? 'justify-center py-2.5' : 'space-x-3.5 px-4.5 py-2.5'
                } ${
                  isActive
                    ? darkMode
                      ? 'bg-slate-800/80 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-[#0f172a] font-semibold shadow-xs'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-900/50 font-medium'
                      : 'text-[#475569] hover:text-[#0f172a] hover:bg-slate-100/60 font-medium'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {(!sidebarCollapsed || isMobile) && <span className="animate-in fade-in duration-200">{item.label}</span>}
                
                {/* Collapsed Tooltip */}
                {sidebarCollapsed && !isMobile && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-bold rounded-xl shadow-lg border border-slate-800 bg-slate-950 text-white transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Purchase Plan Promo Widget */}
        <div className="px-4 mt-4 mb-2">
          {(!sidebarCollapsed || isMobile) ? (
            <button
              onClick={() => {
                setSelectedPlan('pro');
                setActiveTab('purchase-plan');
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-black bg-gradient-to-r from-sky-450 via-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>Purchase Plan</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedPlan('pro');
                setActiveTab('purchase-plan');
              }}
              className="h-10 w-10 rounded-lg bg-gradient-to-r from-sky-405 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md cursor-pointer border-none group relative mx-auto"
              title="Purchase Plan"
            >
              <Sparkles size={16} className="animate-pulse" />
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-slate-800/80 text-xs font-semibold text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
                Purchase Plan
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className={`px-4 pt-3 border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div 
          onClick={() => {
            setActiveTab('profile-settings');
            if (isMobile) setMobileMenuOpen(false);
          }}
          className={`flex items-center space-x-3 mb-2.5 relative group cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 p-1.5 -mx-1.5 rounded-lg transition-all ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
          title="Profile & Settings"
        >
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-707'
          }`}>
            {user?.name?.charAt(0)}
          </div>
          {(!sidebarCollapsed || isMobile) ? (
            <div className="overflow-hidden animate-in fade-in duration-200">
              <span className={`block text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name}</span>
              <span className={`block text-xs truncate ${darkMode ? 'text-slate-505' : 'text-slate-400'}`}>{user?.email}</span>
            </div>
          ) : (
            /* Collapsed User Profile Tooltip */
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-950/95 border border-slate-800/80 text-xs font-semibold text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
              <span className="block font-bold">{user?.name}</span>
              <span className="block text-[10px] text-slate-404">{user?.email}</span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={`w-full flex items-center rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer relative group ${
            sidebarCollapsed && !isMobile ? 'justify-center py-2.5' : 'space-x-3 px-4 py-2'
          } ${
            darkMode
              ? 'text-red-400 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-900/40'
              : 'text-red-655 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {(!sidebarCollapsed || isMobile) ? (
            <span className="animate-in fade-in duration-200">Sign Out</span>
          ) : (
            /* Collapsed Sign Out Tooltip */
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-red-950 border border-red-850 text-xs font-semibold text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${bgMain}`} style={brandStyleVars}>
      
      {/* Mobile Header Overlay Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className={`relative flex flex-col w-64 h-full border-r ${bgSidebar}`}>
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}

      {/* Desktop / Tablet Sidebar */}
      <aside className={`h-screen sticky top-0 flex-col border-r transition-all duration-300 shrink-0 hidden md:flex z-30 ${bgSidebar} ${sidebarWidth}`}>
        <SidebarContent isMobile={false} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header - Aligned to max-w-6xl container */}
        <header className={`h-16 shrink-0 border-b backdrop-blur-md sticky top-0 z-20 transition-all duration-300 ${bgHeader}`}>
          <div className="w-full px-6 md:px-8 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 rounded-lg border md:hidden transition-all cursor-pointer ${
                  darkMode
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white'
                    : 'border-slate-202 hover:bg-slate-100 text-slate-605 hover:text-slate-905'
                }`}
              >
                <Menu size={18} />
              </button>

              {/* Desktop Collapsible Trigger Button - Positioned before Heading */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`hidden md:block p-2 rounded-lg border transition-all cursor-pointer ${
                  darkMode
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white'
                    : 'border-slate-202 hover:bg-slate-100 text-slate-605 hover:text-slate-905'
                }`}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>

              <h2 className={`text-sm md:text-lg font-bold tracking-tight truncate max-w-25 sm:max-w-50 md:max-w-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {activeTab === 'create-brand'
                  ? 'Create Brand'
                  : activeTab === 'profile-settings'
                    ? 'Settings'
                    : sidebarItems.find(i => i.id === activeTab)?.label || 'Overview'}
              </h2>
              <div className={`h-4 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/15 py-0.5 px-2 rounded-full max-w-37.5 sm:max-w-none">
                {activeProject.logoImage && (
                  <img src={activeProject.logoImage} className="h-3.5 w-3.5 object-contain rounded-xs bg-white/80 p-0.5 shrink-0" alt="logo" />
                )}
                <span className="text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400 font-mono truncate">
                  {activeProject.id.startsWith('p') && !activeProject.id.includes('_') ? 'Brand Kit' : activeProject.name}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  darkMode
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white'
                    : 'border-slate-202 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              {!isSystemPreset ? (
                <>
                  <Button
                    onClick={() => handleDownloadBrandKit(activeProject, 'markdown')}
                    variant="outline"
                    size="sm"
                    className={`${darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-202 hover:bg-slate-100 text-slate-707'} text-xs px-3 py-2 md:px-4`}
                  >
                    <FileDown size={14} className="mr-1.5 shrink-0" />
                    <span>MD File</span>
                  </Button>

                  <Button
                    onClick={() => handleDownloadBrandKit(activeProject, 'json')}
                    variant="outline"
                    size="sm"
                    className={`${darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-202 hover:bg-slate-100 text-slate-705'} text-xs px-3 py-2 md:px-4`}
                    title="Download JSON Data File"
                  >
                    <FileDown size={14} className="mr-1.5 shrink-0" />
                    <span>JSON File</span>
                  </Button>

                  <Button
                    onClick={() => handleDownloadBrandKit(activeProject, 'pdf')}
                    variant="default"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 text-white text-xs px-3 py-2 md:px-4"
                  >
                    <FileDown size={14} className="mr-1.5 shrink-0" />
                    <span className="hidden sm:inline">Download Brand Kit</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handlePreviewPreset(activeProject)}
                  variant="default"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 text-white text-xs px-3 py-2 md:px-4 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye size={14} className="shrink-0" />
                  <span>Preview PDF Guidelines</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="p-6 md:p-8 w-full space-y-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex-1"
            >
          
          {/* 1. OVERVIEW / DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                   {/* TOP ROW: Four Metric & Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Compact User Profile Details Card */}
                <Card className={`${cardClass} p-5 relative group flex flex-col justify-between`}>
                  <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/10 rounded-bl-full -z-10 transition-all duration-300 group-hover:scale-110" />
                  <div>
                    <div className="flex items-center space-x-3.5">
                      <div className="h-11 w-11 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-indigo-500/20 shrink-0">
                        {user?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${cardTitleClass}`}>{user?.name}</h4>
                        <span className="text-[9px] text-indigo-550 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {user?.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`space-y-1.5 border-t pt-3 mt-3 text-xs ${darkMode ? 'border-slate-800/60' : 'border-slate-105'}`}>
                      <div className="flex justify-between">
                        <span className="text-slate-405">Email</span>
                        <span className={`font-semibold ${cardTitleClass} truncate max-w-30`}>{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-405">Mobile</span>
                        <span className={`font-semibold ${cardTitleClass}`}>{user?.mobile || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">My Brand Kits</label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (!activeCustom && customProjects.length === 1) {
                            const singleProject = customProjects[0];
                            setActiveProject(singleProject.id);
                            loadPresetIntoBuilder(singleProject);
                            setIsBrandSelectedOrCreated(true);
                            triggerToast(`Workspace "${singleProject.name}" activated & workstation loaded!`, 'success');
                          } else {
                            setIsCustomDropdownOpen(!isCustomDropdownOpen);
                            setIsPresetDropdownOpen(false);
                          }
                        }}
                        className={`w-full text-xs rounded-lg py-2 px-3 flex items-center justify-between border cursor-pointer transition-all duration-200 focus:outline-none ${
                          darkMode
                            ? 'bg-slate-900/60 border-slate-800 text-white hover:border-slate-700'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {activeCustom ? (
                            <>
                              {renderBrandIcon(activeCustom, 'w-5 h-5 text-[9px]')}
                              <span className="font-semibold truncate">{activeCustom.name}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-slate-400 truncate">Select My brand kit</span>
                          )}
                        </div>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCustomDropdownOpen ? 'transform rotate-180' : ''}`} />
                      </button>
 
                      {isCustomDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsCustomDropdownOpen(false)} />
                          <div
                            className={`absolute left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 ${
                              darkMode
                                ? 'bg-slate-950/95 border-slate-800 text-white shadow-slate-950/50'
                                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                            }`}
                          >
                            {customProjects.length === 0 ? (
                              <div className="px-3.5 py-2 text-xs text-slate-400 italic">
                                No custom brand kits yet.
                              </div>
                            ) : (
                              customProjects.map((p) => {
                                const isSelected = p.id === activeProjectId;
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setActiveProject(p.id);
                                      setIsCustomDropdownOpen(false);
                                      loadPresetIntoBuilder(p);
                                      setIsBrandSelectedOrCreated(true);
                                      triggerToast(`Loaded custom brand "${p.name}" details!`, 'success');
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white'
                                        : darkMode
                                          ? 'hover:bg-slate-900 text-slate-300 hover:text-white'
                                          : 'hover:bg-slate-100 text-slate-705 hover:text-slate-905'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 truncate">
                                      {renderBrandIcon(p, 'w-5 h-5 text-[9px]')}
                                      <span className="truncate">{p.name}</span>
                                    </div>
                                    {isSelected && <Check size={14} className="shrink-0" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 2. Contrast Status Card */}
                <Card className={`${cardClass} p-5 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Contrast Status</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold inline-block ${
                      contrastInfo.ratio >= 4.5 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {contrastInfo.grade} (Primary)
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-4">
                    <h4 className={`text-3xl font-extrabold ${cardTitleClass}`}>{contrastInfo.ratio} : 1</h4>
                    <span className="text-[10px] text-slate-404">Contrast ratio</span>
                  </div>
                  <div className="mt-4 pt-3 border-t dark:border-slate-800/60 text-[10px] text-slate-400">
                    Primary brand color accessibility rating.
                  </div>
                </Card>

                {/* 3. Pending Bookings Card */}
                <Card className={`${cardClass} p-5 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Pending Bookings</span>
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">Live Dispatch</span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-4">
                    <h4 className={`text-3xl font-extrabold ${cardTitleClass}`}>
                      {bookings.filter(b => b.userId === user?.email && b.status !== 'Completed').length}
                    </h4>
                    <span className="text-[10px] text-slate-404">Active requests</span>
                  </div>
                  <div className="mt-4 pt-3 border-t dark:border-slate-800/60 text-[10px] text-slate-400">
                    Services technicians dispatch requests.
                  </div>
                </Card>

                {/* 4. Tokens Complexity Card */}
                <Card className={`${cardClass} p-5 flex flex-col justify-between`}>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-550 mb-1`}>Tokens Complexity</h4>
                    <p className={`text-[10px] ${cardDescClass}`}>Asset distribution across repositories.</p>
                  </div>

                  <div className="h-32 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={tokensComplexityData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorIcons" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRules" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="name" stroke={darkMode ? '#6b7280' : '#475569'} fontSize={9} tickLine={false} />
                        <YAxis stroke={darkMode ? '#6b7280' : '#475569'} fontSize={9} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                            borderColor: darkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '8px'
                          }}
                          itemStyle={{ fontSize: '11px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '9px' }}
                        />
                        <Area type="monotone" dataKey="Icons" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIcons)" />
                        <Area type="monotone" dataKey="Rules" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorRules)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </div>

              {/* BOTTOM ROW: Custom Brand Kits Repository */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-909'}`}>Custom Brand Kits Repository</h4>
                    <p className={`text-xs ${cardDescClass}`}>Manage, activate, or delete custom brand kits created by users.</p>
                  </div>
                  <button
                    onClick={handleStartNewBrandKit}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    <span>+ Create New Brand Kit</span>
                  </button>
                </div>

                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/2">
                  {customProjects.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      No custom brand kits created yet. Click "+ Create New Brand Kit" above to create one!
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm min-w-137.5">
                      <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                        <tr>
                          <th className="p-3">Brand Name</th>
                          <th className="p-3">Industry</th>
                          <th className="p-3">Colors</th>
                          <th className="p-3">Last Modified</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-202/40'}`}>
                        {customProjects.map((project) => {
                          const isActive = project.id === activeProjectId;
                          const modDate = project.dateModified || '2026-06-30';
                          
                          return (
                            <tr key={project.id} className={`transition-colors ${tableRowClass} ${isActive ? (darkMode ? 'bg-indigo-955/10' : 'bg-indigo-500/5') : ''}`}>
                              <td className="p-3">
                                <div className="flex items-center space-x-2.5">
                                  {renderBrandIcon(project, 'w-7 h-7 text-xs')}
                                  <span className={`font-semibold ${cardTitleClass}`}>{project.name}</span>
                                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-bold shrink-0">Custom</span>
                                </div>
                              </td>
                              <td className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{project.industry}</td>
                              <td className="p-3">
                                <div className="flex space-x-1 items-center">
                                  <span className="h-3 w-3 rounded-full border border-slate-700/20 block" style={{ backgroundColor: project.colors.primary }} />
                                  <span className="h-3 w-3 rounded-full border border-slate-700/20 block" style={{ backgroundColor: project.colors.secondary }} />
                                  <span className="h-3 w-3 rounded-full border border-slate-700/20 block" style={{ backgroundColor: project.colors.accent }} />
                                </div>
                              </td>
                              <td className="p-3 text-xs text-slate-404 font-mono">{modDate}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleDownloadBrandKit(project, 'json')}
                                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                      darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white' : 'border-slate-202 hover:bg-slate-50 text-slate-655 hover:text-slate-905 shadow-sm'
                                    }`}
                                    title="Download JSON Spec"
                                  >
                                    <FileText size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadBrandKit(project, 'markdown')}
                                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                      darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white' : 'border-slate-202 hover:bg-slate-50 text-slate-655 hover:text-slate-905 shadow-sm'
                                    }`}
                                    title="Download Markdown Spec"
                                  >
                                    <FileDown size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadBrandKit(project, 'pdf')}
                                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                                      darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white' : 'border-slate-202 hover:bg-slate-50 text-slate-655 hover:text-slate-905 shadow-sm'
                                    }`}
                                    title="Download PDF Guidelines"
                                  >
                                    <Download size={12} />
                                  </button>
                                  <span className="w-1.5" />
                                  <button
                                    onClick={() => {
                                      setActiveProject(project.id);
                                      loadPresetIntoBuilder(project);
                                      setIsBrandSelectedOrCreated(true);
                                      setActiveTab('create-brand');
                                      triggerToast(`Loaded "${project.name}" into workstation for modification!`, 'success');
                                    }}
                                    className={`text-xs py-1 px-3 rounded-full font-bold border transition-all cursor-pointer ${
                                      darkMode 
                                        ? 'border-indigo-800 bg-indigo-950/60 hover:bg-indigo-900/50 text-indigo-400 hover:text-indigo-300' 
                                        : 'border-indigo-150 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-650 shadow-sm'
                                    }`}
                                    title="Modify Brand Kit"
                                  >
                                    Modify
                                  </button>
                                  <span className="w-1.5" />
                                  <button
                                    onClick={() => {
                                      if (!isActive) {
                                        setShowActivateFirstModal(project);
                                      } else {
                                        setModifyingProject(project);
                                        setSelectedPresetId('');
                                        setConfirmOverwrite(false);
                                      }
                                    }}
                                    className={`text-xs py-1 px-3 rounded-full font-bold border transition-all cursor-pointer ${
                                      darkMode 
                                        ? 'border-sky-850 bg-sky-950/60 hover:bg-sky-900/50 text-sky-400 hover:text-sky-300' 
                                        : 'border-sky-150 bg-sky-50/50 hover:bg-sky-100/60 text-sky-650 shadow-sm'
                                    }`}
                                    title="Apply a system preset foundation to this brand kit"
                                  >
                                    Apply Preset
                                  </button>
                                  <span className="w-1.5" />
                                  {isActive ? (
                                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/15 py-1 px-3 rounded-full">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                                      Active
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setActiveProject(project.id);
                                        loadPresetIntoBuilder(project);
                                        setIsBrandSelectedOrCreated(true);
                                        triggerToast(`Workspace "${project.name}" activated & workstation loaded!`, 'success');
                                      }}
                                      className={`text-xs py-1 px-3 rounded-full font-bold border transition-all cursor-pointer ${
                                        darkMode 
                                          ? 'border-slate-805 hover:bg-slate-909 text-slate-300 hover:text-white' 
                                          : 'border-slate-202 hover:bg-slate-50 text-slate-655 hover:text-slate-905'
                                      }`}
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setConfirmDialog({
                                        title: 'Delete Custom Brand Kit',
                                        message: `Are you sure you want to delete the custom brand kit "${project.name}"?`,
                                        onConfirm: () => {
                                          setConfirmDialog(null);
                                          deleteProject(project.id);
                                          triggerToast(`Deleted custom brand kit "${project.name}"!`, 'success');
                                          if (isActive) {
                                            setActiveProject('p1');
                                            const p1 = projects.find(x => x.id === 'p1') || fallbackProject;
                                            loadPresetIntoBuilder(p1);
                                          }
                                        }
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                                    title="Delete custom brand kit"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

              {/* 18-Section Design System Specifications Panel for Active Brand Kit */}
              <DesignSystemSpecsPanel
                brandName={activeProject.id.includes('_') ? activeProject.name : null}
                tagline={activeProject.tagline}
                voice={activeProject.voice || 'Professional'}
                industry={activeProject.industry}
                primaryColor={activeProject.colors?.primary || '#6366f1'}
                secondaryColor={activeProject.colors?.secondary || '#a855f7'}
                accentColor={activeProject.colors?.accent || '#06b6d4'}
                borderRadius={activeProject.spacing?.borderRadius || 8}
                headingFont={activeProject.typography?.headingFont || 'Outfit'}
                bodyFont={activeProject.typography?.bodyFont || 'Inter'}
                titleFont={activeProject.typography?.titleFont || activeProject.typography?.headingFont || 'Outfit'}
                subheadingFont={activeProject.typography?.subheadingFont || activeProject.typography?.headingFont || 'Outfit'}
                logoImage={activeProject.logoImage}
                darkMode={darkMode}
                changelog={activeProject.changelog || []}
                history={activeProject.history || []}
                onRollback={(targetVersion) => {
                  const targetHistory = activeProject.history?.find(h => h.version === targetVersion);
                  rollbackProject(activeProject.id, targetVersion);
                  if (targetHistory) {
                    loadPresetIntoBuilder({
                      ...targetHistory,
                      id: activeProject.id,
                      history: activeProject.history,
                      changelog: activeProject.changelog
                    });
                  }
                  triggerToast(`Rolled back active brand system to version ${targetVersion}!`, 'success');
                }}
              />
            </div>
          )}

          {/* BRAND PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Curated Brand Presets</h3>
                <p className={`text-xs ${cardDescClass}`}>Select a premium pre-designed brand identity kit or download its specifications immediately.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {projects.filter(p => p.id && p.id.startsWith('p') && !p.id.includes('_')).map((project) => {
                  const isActive = project.id === activeProjectId;
                  
                  const handleDownloadPDF = (e, p) => {
                    e.stopPropagation();
                    handleDownloadBrandKit(p, 'pdf');
                  };

                  const handleDownloadMD = (e, p) => {
                    e.stopPropagation();
                    handleDownloadBrandKit(p, 'markdown');
                  };

                  return (
                    <Card
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project.id);
                        setIsBrandSelectedOrCreated(true);
                        loadPresetIntoBuilder(project);
                        const isPreset = project.id && project.id.startsWith('p') && !project.id.includes('_');
                        if (isPreset) {
                          handlePreviewPreset(project);
                        } else {
                          triggerToast(`Loaded "${project.name}" preset into Workstation! Customize and save it under a new name.`, 'success');
                        }
                      }}
                      className={`p-6 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-lg relative overflow-hidden group ${
                        isActive
                          ? (darkMode ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30' : 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600/20')
                          : (darkMode ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm')
                      }`}
                    >
                      {/* Active Indicator Badge */}
                      {isActive && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg shadow">
                          Active Kit
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {renderBrandIcon(project, 'w-9 h-9 text-base')}
                          <div>
                            <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {project.name}
                            </h4>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-505 block">
                              {project.industry}
                            </span>
                          </div>
                        </div>

                        <p className={`text-xs ${cardDescClass} line-clamp-2 min-h-8`}>
                          {project.description}
                        </p>

                        <div className="py-1">
                          <span className="text-[10px] font-bold text-slate-405 dark:text-slate-505 block mb-1 uppercase tracking-wider">Tagline</span>
                          <span className={`text-xs italic ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            "{project.tagline}"
                          </span>
                        </div>

                        {/* Color Ribbon */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-405 dark:text-slate-555 block uppercase tracking-wider">Palette Preview</span>
                          <div className="flex h-5 rounded-md overflow-hidden border dark:border-slate-800">
                            <div className="flex-1" style={{ backgroundColor: project.colors?.primary || '#6366f1' }} title={`Primary: ${project.colors?.primary || '#6366f1'}`} />
                            <div className="flex-1" style={{ backgroundColor: project.colors?.secondary || '#a855f7' }} title={`Secondary: ${project.colors?.secondary || '#a855f7'}`} />
                            <div className="flex-1" style={{ backgroundColor: project.colors?.accent || '#06b6d4' }} title={`Accent: ${project.colors?.accent || '#06b6d4'}`} />
                            <div className="flex-1" style={{ backgroundColor: project.colors?.neutral || '#6b7280' }} title={`Neutral: ${project.colors?.neutral || '#6b7280'}`} />
                            <div className="flex-1" style={{ backgroundColor: project.colors?.background || '#0b0f19' }} title={`Background: ${project.colors?.background || '#0b0f19'}`} />
                          </div>
                        </div>

                        {/* Typography Specs */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-500/5 p-2 rounded-lg border dark:border-slate-800/60 mt-2">
                          <div>
                            <span className="text-slate-450 block font-semibold">Heading Font</span>
                            <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{project.typography?.headingFont || 'Outfit'}</span>
                          </div>
                          <div>
                            <span className="text-slate-450 block font-semibold">Body Font</span>
                            <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{project.typography?.bodyFont || 'Inter'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t dark:border-slate-800/80 border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {project.id.startsWith('p') && !project.id.includes('_') ? 'System Preset' : isActive ? 'Currently editing' : 'Click card to activate'}
                        </span>
                        
                        <div className="flex space-x-2">
                          {project.id.startsWith('p') && !project.id.includes('_') ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewPreset(project);
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center space-x-1 cursor-pointer border-none shadow-md shadow-indigo-600/15"
                                title="Preview PDF Guidelines Manual"
                              >
                                <Eye size={12} />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUseTemplate(project);
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg transition-all flex items-center space-x-1 cursor-pointer border-none shadow-sm shadow-orange-500/10"
                                title="Use template to create customizable copy"
                              >
                                <Sparkles size={12} />
                                <span>Use Template</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadPresetIntoBuilder(project);
                                  triggerToast(`Loaded "${project.name}" preset details into Workstation! Customize and save it under a new name.`, 'info');
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-orange-500/10"
                                title="Edit preset in the Brand Kit Builder Workstation"
                              >
                                <LucideIcons.Edit3 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => handleDownloadMD(e, project)}
                                className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg transition-all flex items-center space-x-1 cursor-pointer hover:bg-slate-500/10 ${
                                  darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                                }`}
                                title="Download Markdown Specification"
                              >
                                <FileText size={12} />
                                <span>Download MD</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadBrandKit(project, 'json');
                                }}
                                className={`px-3 py-1.5 text-[10px] font-bold border rounded-lg transition-all flex items-center space-x-1 cursor-pointer hover:bg-slate-500/10 ${
                                  darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                                }`}
                                title="Download JSON Data File"
                              >
                                <FileText size={12} />
                                <span>Download JSON</span>
                              </button>
                              <button
                                onClick={(e) => handleDownloadPDF(e, project)}
                                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                                title="Download PDF Guidelines"
                              >
                                <Download size={12} />
                                <span>Download PDF</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* BRAND BUILDER TAB (FULL PAGE WORKSTATION) */}
          {activeTab === 'create-brand' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 dark:border-slate-800">
                <div>
                  <h3 className={`text-2xl font-extrabold tracking-tight flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-slate-905'}`}>
                    <Sparkles className="text-indigo-500 h-6 w-6" />
                    <span>Brand Kit Builder Workstation</span>
                  </h3>
                  <p className={`text-xs ${cardDescClass}`}>Configure, customize, and launch a complete design system in real-time.</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('dashboard')}
                    className={darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLaunchBrandKit}
                    className="bg-indigo-600 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  >
                    {editingProjectId ? 'Update Brand System' : 'Launch Brand System'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Side - Configuration form (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Card 1: Core Details */}
                  <Card className={`${cardClass} p-6 space-y-4`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">1. Core Profile & Voice</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Brand Name *</label>
                        <input
                          type="text"
                          value={bName}
                          onChange={(e) => setBName(e.target.value)}
                          placeholder="Enter your custom brand name..."
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Industry</label>
                        <CustomSelect
                          value={bIndustry}
                          onChange={(e) => setBIndustry(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'Technology', label: 'Technology' },
                            { value: 'Food & Beverage', label: 'Food & Drink' },
                            { value: 'Finance', label: 'Finance' },
                            { value: 'Health & Wellness', label: 'Health' },
                            { value: 'Creative & Art', label: 'Creative' },
                            { value: 'Eco & Green', label: 'Sustainability' },
                            { value: 'E-Commerce', label: 'E-Commerce' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Tagline</label>
                        <input
                          type="text"
                          value={bTagline}
                          onChange={(e) => setBTagline(e.target.value)}
                          placeholder="e.g. Artistry in every detail"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Website URL</label>
                        <input
                          type="text"
                          value={bWebsite}
                          onChange={(e) => setBWebsite(e.target.value)}
                          placeholder="e.g. https://aethera.space"
                          className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Brand Voice / Tone</label>
                      <input
                        type="text"
                        value={bVoice}
                        onChange={(e) => setBVoice(e.target.value)}
                        placeholder="e.g. Professional, friendly, bold, visionary"
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Project Description</label>
                      <textarea
                        value={bDesc}
                        onChange={(e) => setBDesc(e.target.value)}
                        placeholder="Describe the mission, values, and brand goals..."
                        rows="2"
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                      />
                    </div>
                  </Card>

                  {/* Card 2: Logo and Guidelines Categories */}
                  <Card className={`${cardClass} p-6 space-y-4`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">2. Brand Assets & Guidelines</h4>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Upload Logo Symbol</label>
                      <div className="flex items-center space-x-4 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setBLogoImage(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Recommended: PNG or SVG with transparent background.</p>
                        </div>
                        {bLogoImage && (
                          <div className="h-14 w-14 rounded-lg border bg-white flex items-center justify-center p-1.5 shrink-0 shadow-sm relative group">
                            <img src={bLogoImage} className="max-h-full max-w-full object-contain" alt="Logo Preview" />
                            <button
                              type="button"
                              onClick={() => setBLogoImage(null)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow cursor-pointer flex items-center justify-center"
                              style={{ width: '16px', height: '16px' }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Custom Guidelines Categories</label>
                      <div className="space-y-3">
                        {bCategories.map((cat) => (
                          <div key={cat.id} className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 relative group/cat">
                            <button
                              type="button"
                              onClick={() => setBCategories(bCategories.filter(c => c.id !== cat.id))}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-600 cursor-pointer opacity-0 group-hover/cat:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">{cat.name}</span>
                            <p className="text-xs text-slate-600 dark:text-slate-350">{cat.content}</p>
                          </div>
                        ))}

                        <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3 mt-3">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest block">Create Custom Guideline Category</span>
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Category Title (e.g. Grid Rules, Social Media)"
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${inputClass}`}
                          />
                          <textarea
                            value={newCatContent}
                            onChange={(e) => setNewCatContent(e.target.value)}
                            placeholder="Describe rules, specifications, or guidelines..."
                            rows="2"
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none border ${inputClass}`}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (!newCatName.trim() || !newCatContent.trim()) {
                                triggerToast('Please fill in both fields.', 'error');
                                return;
                              }
                              setBCategories([...bCategories, {
                                id: 'cat_' + Math.random().toString(36).substr(2, 9),
                                name: newCatName.trim(),
                                content: newCatContent.trim()
                              }]);
                              setNewCatName('');
                              setNewCatContent('');
                              triggerToast(`Created category "${newCatName}"`, 'success');
                            }}
                            size="sm"
                            className="w-full text-white text-xs py-1.5 bg-indigo-600 hover:bg-indigo-600"
                          >
                            Add Category
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Card 3: Color Palette Picker */}
                  <Card className={`${cardClass} p-6 space-y-4`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">3. Color Palette</h4>
                    <div className="flex items-center justify-between space-x-1.5">
                      {/* Primary */}
                      <div className="flex-1 flex flex-col items-center p-2.5 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary</label>
                        <div className="relative cursor-pointer">
                          <div className="h-9 w-9 rounded-full border shadow-sm" style={{ backgroundColor: bPrimaryColor }} />
                          <input
                            type="color"
                            value={bPrimaryColor}
                            onChange={(e) => setBPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-semibold">{bPrimaryColor.toUpperCase()}</span>
                      </div>

                      {/* Swap Primary / Secondary */}
                      <button
                        type="button"
                        onClick={() => {
                          const temp = bPrimaryColor;
                          setBPrimaryColor(bSecondaryColor);
                          setBSecondaryColor(temp);
                          triggerToast('Swapped Primary & Secondary colors!', 'info');
                        }}
                        className={`p-1.5 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 ${
                          darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                        title="Swap Primary & Secondary"
                      >
                        <RefreshCw size={11} />
                      </button>

                      {/* Secondary */}
                      <div className="flex-1 flex flex-col items-center p-2.5 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Secondary</label>
                        <div className="relative cursor-pointer">
                          <div className="h-9 w-9 rounded-full border shadow-sm" style={{ backgroundColor: bSecondaryColor }} />
                          <input
                            type="color"
                            value={bSecondaryColor}
                            onChange={(e) => setBSecondaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-semibold">{bSecondaryColor.toUpperCase()}</span>
                      </div>

                      {/* Swap Secondary / Accent */}
                      <button
                        type="button"
                        onClick={() => {
                          const temp = bSecondaryColor;
                          setBSecondaryColor(bAccentColor);
                          setBAccentColor(temp);
                          triggerToast('Swapped Secondary & Accent colors!', 'info');
                        }}
                        className={`p-1.5 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 ${
                          darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                        title="Swap Secondary & Accent"
                      >
                        <RefreshCw size={11} />
                      </button>

                      {/* Accent */}
                      <div className="flex-1 flex flex-col items-center p-2.5 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accent</label>
                        <div className="relative cursor-pointer">
                          <div className="h-9 w-9 rounded-full border shadow-sm" style={{ backgroundColor: bAccentColor }} />
                          <input
                            type="color"
                            value={bAccentColor}
                            onChange={(e) => setBAccentColor(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-semibold">{bAccentColor.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t dark:border-slate-800">
                      <span>Shift Color Order:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const p = bPrimaryColor;
                          const s = bSecondaryColor;
                          const a = bAccentColor;
                          setBPrimaryColor(s);
                          setBSecondaryColor(a);
                          setBAccentColor(p);
                          triggerToast('Shift-cycled colors (Primary → Secondary → Accent → Primary)!', 'success');
                        }}
                        className={`px-2 py-1 text-[9px] rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
                          darkMode
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>Cycle Colors</span>
                        <RefreshCw size={10} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Curated Palettes Presets</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { name: 'Teal/Cyan', primary: '#0f766e', secondary: '#06b6d4', accent: '#fbbf24' },
                          { name: 'Cyberpunk', primary: '#ec4899', secondary: '#8b5cf6', accent: '#06b6d4' },
                          { name: 'Earthy', primary: '#b45309', secondary: '#15803d', accent: '#78350f' },
                          { name: 'Minimalist', primary: '#1e293b', secondary: '#64748b', accent: '#0f172a' }
                        ].map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setBPrimaryColor(p.primary);
                              setBSecondaryColor(p.secondary);
                              setBAccentColor(p.accent);
                            }}
                            className={`p-2 border rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer flex flex-col space-y-1.5 hover:border-indigo-500 ${
                              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                            }`}
                          >
                            <span>{p.name}</span>
                            <div className="flex space-x-1">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.primary }} />
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.secondary }} />
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.accent }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Card 4: Typography and Geometry */}
                  <Card className={`${cardClass} p-6 space-y-6`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">4. Typography & Spacing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Title Font</label>
                        <CustomSelect
                          value={bTitleFont}
                          onChange={(e) => setBTitleFont(e.target.value)}
                          darkMode={darkMode}
                          options={googleFontsOptions}
                          searchable={true}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Heading Font</label>
                        <CustomSelect
                          value={bHeadingFont}
                          onChange={(e) => setBHeadingFont(e.target.value)}
                          darkMode={darkMode}
                          options={googleFontsOptions}
                          searchable={true}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Sub-heading Font</label>
                        <CustomSelect
                          value={bSubheadingFont}
                          onChange={(e) => setBSubheadingFont(e.target.value)}
                          darkMode={darkMode}
                          options={googleFontsOptions}
                          searchable={true}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Body Text Font</label>
                        <CustomSelect
                          value={bBodyFont}
                          onChange={(e) => setBBodyFont(e.target.value)}
                          darkMode={darkMode}
                          options={googleFontsOptions}
                          searchable={true}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Border Radius</label>
                        <CustomSelect
                          value={bRadius}
                          onChange={(e) => setBRadius(parseInt(e.target.value))}
                          darkMode={darkMode}
                          options={[
                            { value: 0, label: 'Sharp (0px)' },
                            { value: 4, label: 'Rounded (4px)' },
                            { value: 8, label: 'Smooth (8px)' },
                            { value: 12, label: 'Extra Rounded (12px)' },
                            { value: 20, label: 'Pill (20px)' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest block">Typography Sizes Scale (px)</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Title ({bTitleSize}px)</label>
                          <input
                            type="range"
                            min="32"
                            max="72"
                            value={bTitleSize}
                            onChange={(e) => setBTitleSize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Heading ({bHeadingSize}px)</label>
                          <input
                            type="range"
                            min="24"
                            max="48"
                            value={bHeadingSize}
                            onChange={(e) => setBHeadingSize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subheading ({bSubheadingSize}px)</label>
                          <input
                            type="range"
                            min="16"
                            max="32"
                            value={bSubheadingSize}
                            onChange={(e) => setBSubheadingSize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                        <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Body ({bBodySize}px)</label>
                          <input
                            type="range"
                            min="12"
                            max="20"
                            value={bBodySize}
                            onChange={(e) => setBBodySize(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Typography Boldness & Colors Section */}
                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest block mb-2">Typography Colors & Font Weights (Boldness)</span>
                      
                      {/* Title customizer */}
                      <div className="p-3.5 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3">
                        <span className="text-xs font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Title Style customizer</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Title Text Color</label>
                            <CustomSelect
                              value={bTitleColor}
                              onChange={(e) => setBTitleColor(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: 'primary', label: 'Primary Brand Color' },
                                { value: 'secondary', label: 'Secondary Brand Color' },
                                { value: 'accent', label: 'Accent Brand Color' },
                                { value: 'neutral', label: 'Neutral Slate Color' },
                                { value: 'white', label: 'White' },
                                { value: 'black', label: 'Black' },
                                { value: 'custom', label: 'Custom HEX Color' }
                              ]}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Title Boldness (Weight)</label>
                            <CustomSelect
                              value={bTitleWeight}
                              onChange={(e) => setBTitleWeight(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: '400', label: 'Normal (400)' },
                                { value: '500', label: 'Medium (500)' },
                                { value: '600', label: 'Semibold (600)' },
                                { value: '700', label: 'Bold (700)' },
                                { value: '800', label: 'Extra Bold (800)' },
                                { value: '900', label: 'Black (900)' }
                              ]}
                            />
                          </div>
                        </div>
                        {bTitleColor === 'custom' && (
                          <div className="flex items-center space-x-2 animate-in fade-in duration-100">
                            <input
                              type="color"
                              value={bTitleCustomColor}
                              onChange={(e) => setBTitleCustomColor(e.target.value)}
                              className="h-8 w-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={bTitleCustomColor}
                              onChange={(e) => setBTitleCustomColor(e.target.value)}
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-mono ${
                                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                              placeholder="#6366f1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Heading customizer */}
                      <div className="p-3.5 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3">
                        <span className="text-xs font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Heading Style customizer</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Heading Text Color</label>
                            <CustomSelect
                              value={bHeadingColor}
                              onChange={(e) => setBHeadingColor(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: 'primary', label: 'Primary Brand Color' },
                                { value: 'secondary', label: 'Secondary Brand Color' },
                                { value: 'accent', label: 'Accent Brand Color' },
                                { value: 'neutral', label: 'Neutral Slate Color' },
                                { value: 'white', label: 'White' },
                                { value: 'black', label: 'Black' },
                                { value: 'custom', label: 'Custom HEX Color' }
                              ]}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Heading Boldness (Weight)</label>
                            <CustomSelect
                              value={bHeadingWeight}
                              onChange={(e) => setBHeadingWeight(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: '400', label: 'Normal (400)' },
                                { value: '500', label: 'Medium (500)' },
                                { value: '600', label: 'Semibold (600)' },
                                { value: '700', label: 'Bold (700)' },
                                { value: '800', label: 'Extra Bold (800)' },
                                { value: '900', label: 'Black (900)' }
                              ]}
                            />
                          </div>
                        </div>
                        {bHeadingColor === 'custom' && (
                          <div className="flex items-center space-x-2 animate-in fade-in duration-100">
                            <input
                              type="color"
                              value={bHeadingCustomColor}
                              onChange={(e) => setBHeadingCustomColor(e.target.value)}
                              className="h-8 w-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={bHeadingCustomColor}
                              onChange={(e) => setBHeadingCustomColor(e.target.value)}
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-mono ${
                                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                              placeholder="#a855f7"
                            />
                          </div>
                        )}
                      </div>

                      {/* Subheading customizer */}
                      <div className="p-3.5 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3">
                        <span className="text-xs font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Subheading Style customizer</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subheading Text Color</label>
                            <CustomSelect
                              value={bSubheadingColor}
                              onChange={(e) => setBSubheadingColor(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: 'primary', label: 'Primary Brand Color' },
                                { value: 'secondary', label: 'Secondary Brand Color' },
                                { value: 'accent', label: 'Accent Brand Color' },
                                { value: 'neutral', label: 'Neutral Slate Color' },
                                { value: 'white', label: 'White' },
                                { value: 'black', label: 'Black' },
                                { value: 'custom', label: 'Custom HEX Color' }
                              ]}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subheading Boldness (Weight)</label>
                            <CustomSelect
                              value={bSubheadingWeight}
                              onChange={(e) => setBSubheadingWeight(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: '400', label: 'Normal (400)' },
                                { value: '500', label: 'Medium (500)' },
                                { value: '600', label: 'Semibold (600)' },
                                { value: '700', label: 'Bold (700)' },
                                { value: '800', label: 'Extra Bold (800)' },
                                { value: '900', label: 'Black (900)' }
                              ]}
                            />
                          </div>
                        </div>
                        {bSubheadingColor === 'custom' && (
                          <div className="flex items-center space-x-2 animate-in fade-in duration-100">
                            <input
                              type="color"
                              value={bSubheadingCustomColor}
                              onChange={(e) => setBSubheadingCustomColor(e.target.value)}
                              className="h-8 w-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={bSubheadingCustomColor}
                              onChange={(e) => setBSubheadingCustomColor(e.target.value)}
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-mono ${
                                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                              placeholder="#06b6d4"
                            />
                          </div>
                        )}
                      </div>

                      {/* Body customizer */}
                      <div className="p-3.5 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3">
                        <span className="text-xs font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Body Text Style customizer</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Body Text Color</label>
                            <CustomSelect
                              value={bBodyColor}
                              onChange={(e) => setBBodyColor(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: 'primary', label: 'Primary Brand Color' },
                                { value: 'secondary', label: 'Secondary Brand Color' },
                                { value: 'accent', label: 'Accent Brand Color' },
                                { value: 'neutral', label: 'Neutral Slate Color' },
                                { value: 'white', label: 'White' },
                                { value: 'black', label: 'Black' },
                                { value: 'custom', label: 'Custom HEX Color' }
                              ]}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Body Text Boldness (Weight)</label>
                            <CustomSelect
                              value={bBodyWeight}
                              onChange={(e) => setBBodyWeight(e.target.value)}
                              darkMode={darkMode}
                              options={[
                                { value: '300', label: 'Light (300)' },
                                { value: '400', label: 'Normal (400)' },
                                { value: '500', label: 'Medium (500)' },
                                { value: '600', label: 'Semibold (600)' },
                                { value: '700', label: 'Bold (700)' }
                              ]}
                            />
                          </div>
                        </div>
                        {bBodyColor === 'custom' && (
                          <div className="flex items-center space-x-2 animate-in fade-in duration-100">
                            <input
                              type="color"
                              value={bBodyCustomColor}
                              onChange={(e) => setBBodyCustomColor(e.target.value)}
                              className="h-8 w-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                            />
                            <input
                              type="text"
                              value={bBodyCustomColor}
                              onChange={(e) => setBBodyCustomColor(e.target.value)}
                              className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-mono ${
                                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                              placeholder="#475569"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Available Brand Icons */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Selected Brand Icons</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {['Rocket', 'Shield', 'Globe', 'Compass', 'Heart', 'Coffee', 'Sparkles', 'Activity', 'Layers', 'Settings', 'Database', 'Cpu'].map((ic) => {
                          const isSelected = bIcons.includes(ic);
                          return (
                            <button
                              key={ic}
                              type="button"
                              onClick={() => {
                                setBIcons(prev =>
                                  isSelected ? prev.filter(x => x !== ic) : [...prev, ic]
                                );
                              }}
                              className={`p-2 border rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : darkMode
                                    ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <DynamicIcon name={ic} size={16} />
                              <span className="text-[9px] mt-1 truncate max-w-full">{ic}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Card 5: Buttons Style Builder */}
                  <Card className={`${cardClass} p-6 space-y-6`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">5. Component Library Styling (Buttons, Badges, Labels & Alerts)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Button Color Type */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Button Color Basis</label>
                        <CustomSelect
                          value={bButtonColorType}
                          onChange={(e) => setBButtonColorType(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'primary', label: 'Primary Brand Color' },
                            { value: 'secondary', label: 'Secondary Brand Color' },
                            { value: 'accent', label: 'Accent Brand Color' },
                            { value: 'custom', label: 'Custom Specification Color' }
                          ]}
                        />
                      </div>

                      {/* Background Style */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Background Fill Style</label>
                        <CustomSelect
                          value={bButtonBgType}
                          onChange={(e) => setBButtonBgType(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'solid', label: 'Solid Solid Color' },
                            { value: 'gradient', label: 'Gradient Fill (Color to Secondary)' }
                          ]}
                        />
                      </div>
                    </div>

                    {bButtonColorType === 'custom' && (
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Custom HEX Hexcode Color</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={bButtonCustomColor}
                            onChange={(e) => setBButtonCustomColor(e.target.value)}
                            className="h-8 w-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={bButtonCustomColor}
                            onChange={(e) => setBButtonCustomColor(e.target.value)}
                            className={`flex-1 text-xs px-3 py-1.5 rounded-lg border font-mono ${
                              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Button Roundness Slider */}
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Border Corner Radius ({bButtonRadius}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={bButtonRadius}
                          onChange={(e) => setBButtonRadius(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      {/* Button Border Width Slider */}
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Outline Border Width ({bButtonBorderWidth}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          value={bButtonBorderWidth}
                          onChange={(e) => setBButtonBorderWidth(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Border Style */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Outline Border Style</label>
                        <CustomSelect
                          value={bButtonBorderStyle}
                          onChange={(e) => setBButtonBorderStyle(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'solid', label: 'Solid Solid line' },
                            { value: 'dashed', label: 'Dashed Outline' },
                            { value: 'dotted', label: 'Dotted Outline' }
                          ]}
                        />
                      </div>

                      {/* Shadow Elevation */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Button Shadow/Elevation</label>
                        <CustomSelect
                          value={bButtonShadow}
                          onChange={(e) => setBButtonShadow(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'Flat (None)' },
                            { value: 'sm', label: 'Soft Shadow (SM)' },
                            { value: 'md', label: 'Elevated Shadow (MD)' },
                            { value: 'lg', label: 'High Shadow (LG)' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Badge, Label & Notification Alert Stylers */}
                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <h5 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest block mb-2">Badge & Label Customizers</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Badge Background Type */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Badge Fill Style</label>
                          <CustomSelect
                            value={bBadgeBgType}
                            onChange={(e) => setBBadgeBgType(e.target.value)}
                            darkMode={darkMode}
                            options={[
                              { value: 'solid', label: 'Solid Solid Color' },
                              { value: 'outline', label: 'Outline Border' },
                              { value: 'soft', label: 'Soft Tint (15% opacity)' },
                              { value: 'glass', label: 'Glassmorphic panel' }
                            ]}
                          />
                        </div>

                        {/* Badge Radius */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Badge Roundness</label>
                          <CustomSelect
                            value={bBadgeRadius}
                            onChange={(e) => setBBadgeRadius(e.target.value)}
                            darkMode={darkMode}
                            options={[
                              { value: 'none', label: 'Sharp (0px)' },
                              { value: 'sm', label: 'Rounded (4px)' },
                              { value: 'md', label: 'Smooth (8px)' },
                              { value: 'lg', label: 'Extra Rounded (12px)' },
                              { value: 'full', label: 'Pill (Full)' }
                            ]}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Label Weight */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Label Font Weight</label>
                          <CustomSelect
                            value={bLabelWeight}
                            onChange={(e) => setBLabelWeight(e.target.value)}
                            darkMode={darkMode}
                            options={[
                              { value: 'normal', label: 'Normal (400)' },
                              { value: 'medium', label: 'Medium (500)' },
                              { value: 'semibold', label: 'Semibold (600)' },
                              { value: 'bold', label: 'Bold (700)' }
                            ]}
                          />
                        </div>

                        {/* Label Text Transform */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Label Capitalization</label>
                          <CustomSelect
                            value={bLabelTransform}
                            onChange={(e) => setBLabelTransform(e.target.value)}
                            darkMode={darkMode}
                            options={[
                              { value: 'none', label: 'None (As Typed)' },
                              { value: 'uppercase', label: 'UPPERCASE' },
                              { value: 'lowercase', label: 'lowercase' },
                              { value: 'capitalize', label: 'Capitalize Words' }
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                      <h5 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest block mb-2">Notification Alert Customizer</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Alert Background Style */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Alert Fill Style</label>
                          <CustomSelect
                            value={bAlertBgType}
                            onChange={(e) => setBAlertBgType(e.target.value)}
                            darkMode={darkMode}
                            options={[
                              { value: 'solid', label: 'Solid Solid Color' },
                              { value: 'soft', label: 'Soft Tint (10% opacity)' },
                              { value: 'glass', label: 'Glassmorphic panel' }
                            ]}
                          />
                        </div>

                        {/* Alert Radius Slider */}
                        <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alert Corner Radius ({bAlertRadius}px)</label>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            value={bAlertRadius}
                            onChange={(e) => setBAlertRadius(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Alert Left Border Accent Toggle */}
                      <div className="flex items-center space-x-3 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <input
                          type="checkbox"
                          id="alertBorderToggle"
                          checked={bAlertBorder}
                          onChange={(e) => setBAlertBorder(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="alertBorderToggle" className="text-xs font-bold text-slate-405 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                          Enable Left Accent Border Bar
                        </label>
                      </div>
                    </div>

                    {/* Live Component Specimen Library */}
                    <div className="space-y-3 pt-3 border-t dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest block">Live Elements & Component Specimen Previews</span>
                      
                      <div className="space-y-4 p-4 rounded-xl border dark:border-slate-800/80 bg-slate-500/5">
                        {/* Buttons Previews */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-center border-b dark:border-slate-800/50 pb-4">
                          {(() => {
                            const buttonBg = bButtonColorType === 'primary' 
                              ? bPrimaryColor 
                              : bButtonColorType === 'secondary' 
                                ? bSecondaryColor 
                                : bButtonColorType === 'accent' 
                                  ? bAccentColor 
                                  : bButtonCustomColor;

                            const secondColor = bSecondaryColor;

                            const btnStyle = {
                              borderRadius: `${bButtonRadius}px`,
                              borderWidth: `${bButtonBorderWidth}px`,
                              borderStyle: bButtonBorderStyle,
                              borderColor: buttonBg,
                            };

                            const solidBg = bButtonBgType === 'gradient'
                              ? `linear-gradient(to right, ${buttonBg}, ${secondColor})`
                              : buttonBg;

                            const shadowClasses = {
                              none: '',
                              sm: 'shadow-sm',
                              md: 'shadow-md',
                              lg: 'shadow-lg'
                            }[bButtonShadow];

                            return (
                              <>
                                <div className="flex flex-col items-center space-y-1.5 w-full">
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Primary Button</span>
                                  <button
                                    type="button"
                                    style={{ ...btnStyle, background: solidBg, color: '#ffffff', borderColor: 'transparent' }}
                                    className={`px-4 py-2 text-xs font-semibold w-full hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-center ${shadowClasses}`}
                                  >
                                    Action Primary
                                  </button>
                                </div>

                                <div className="flex flex-col items-center space-y-1.5 w-full">
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Outline Button</span>
                                  <button
                                    type="button"
                                    style={{ ...btnStyle, background: 'transparent', color: buttonBg }}
                                    className={`px-4 py-2 text-xs font-semibold w-full hover:bg-slate-500/5 active:scale-[0.98] transition-all cursor-pointer text-center ${shadowClasses}`}
                                  >
                                    Action Outline
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Badges & Labels Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-b dark:border-slate-800/50 pb-4">
                          {/* Styled Badge */}
                          <div className="flex flex-col items-center space-y-1.5 w-full">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Styled Badge Element</span>
                            {(() => {
                              const badgeRadiusClasses = {
                                none: 'rounded-none',
                                sm: 'rounded',
                                md: 'rounded-lg',
                                lg: 'rounded-xl',
                                full: 'rounded-full'
                              }[bBadgeRadius];

                              let badgeStyle = {};
                              let badgeClasses = `px-3 py-1 text-[10px] font-bold ${badgeRadiusClasses} `;

                              if (bBadgeBgType === 'solid') {
                                badgeStyle = { backgroundColor: bPrimaryColor, color: '#ffffff' };
                              } else if (bBadgeBgType === 'outline') {
                                badgeStyle = { border: `1px solid ${bPrimaryColor}`, color: bPrimaryColor };
                              } else if (bBadgeBgType === 'soft') {
                                badgeStyle = { backgroundColor: `${bPrimaryColor}20`, color: bPrimaryColor };
                              } else if (bBadgeBgType === 'glass') {
                                badgeStyle = { border: '1px solid rgba(156, 163, 175, 0.2)' };
                                badgeClasses += darkMode ? 'bg-slate-900/50 text-slate-200' : 'bg-white/40 text-slate-700 backdrop-blur-[2px]';
                              }

                              return (
                                <span style={badgeStyle} className={badgeClasses}>
                                  Active Status
                                </span>
                              );
                            })()}
                          </div>

                          {/* Styled Label */}
                          <div className="flex flex-col items-center space-y-1.5 w-full">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Styled Label Specimen</span>
                            {(() => {
                              const weightClasses = {
                                normal: 'font-normal',
                                medium: 'font-medium',
                                semibold: 'font-semibold',
                                bold: 'font-bold'
                              }[bLabelWeight];

                              const transformStyle = {
                                textTransform: bLabelTransform
                              };

                              return (
                                <span 
                                  style={transformStyle} 
                                  className={`text-xs ${weightClasses} ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
                                >
                                  System Settings
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Notification Alert Section */}
                        <div className="flex flex-col items-center space-y-1.5 w-full">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Styled Notification Alert</span>
                          {(() => {
                            let alertStyle = {
                              borderRadius: `${bAlertRadius}px`
                            };
                            let alertClasses = 'w-full p-3.5 text-xs flex items-center justify-between border ';

                            if (bAlertBgType === 'solid') {
                              alertStyle.backgroundColor = bPrimaryColor;
                              alertStyle.color = '#ffffff';
                              alertStyle.borderColor = 'transparent';
                            } else if (bAlertBgType === 'soft') {
                              alertStyle.backgroundColor = `${bPrimaryColor}15`;
                              alertStyle.color = bPrimaryColor;
                              alertStyle.borderColor = `${bPrimaryColor}25`;
                            } else if (bAlertBgType === 'glass') {
                              alertStyle.borderColor = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                              alertClasses += darkMode ? 'bg-slate-900/40 text-slate-200' : 'bg-white/40 text-slate-700 backdrop-blur-[4px]';
                            }

                            if (bAlertBorder) {
                              alertStyle.borderLeftWidth = '4px';
                              alertStyle.borderLeftColor = bPrimaryColor;
                            }

                            return (
                              <div style={alertStyle} className={alertClasses}>
                                <div className="flex items-center space-x-2.5">
                                  <DynamicIcon name="Sparkles" size={14} />
                                  <span className="font-semibold">Notice: Brand specifications saved successfully!</span>
                                </div>
                                <span className="text-[10px] opacity-75 font-bold cursor-pointer hover:opacity-100" onClick={(e) => { e.preventDefault(); }}>✕</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Card 6: Iconography Style Builder */}
                  <Card className={`${cardClass} p-6 space-y-6`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800">6. Iconography System Builder</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Icon Library Selector */}
                      <div className="space-y-1 col-span-1 md:col-span-2 border-b dark:border-slate-800 pb-3 mb-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Selected Icon Library Source</label>
                        <CustomSelect
                          value={bIconLibrary}
                          onChange={(e) => setBIconLibrary(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'Lucide React', label: 'Lucide Icons React (Default)' },
                            { value: 'Font Awesome', label: 'Font Awesome 6 Pro SVGs' },
                            { value: 'Icons8', label: 'Icons8 Line Web Icons' },
                            { value: 'Material Symbols', label: 'Google Material Symbols Rounded' }
                          ]}
                        />
                      </div>
                      {/* Icon Color Basis */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Icon Glyph Color</label>
                        <CustomSelect
                          value={bIconColorType}
                          onChange={(e) => setBIconColorType(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'primary', label: 'Primary Brand Color' },
                            { value: 'secondary', label: 'Secondary Brand Color' },
                            { value: 'accent', label: 'Accent Brand Color' },
                            { value: 'neutral', label: 'Neutral Slate Color' }
                          ]}
                        />
                      </div>

                      {/* Icon Background Container Style */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">Background Container</label>
                        <CustomSelect
                          value={bIconBgType}
                          onChange={(e) => setBIconBgType(e.target.value)}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'None (Glyph Only)' },
                            { value: 'solid', label: 'Solid Fill Color' },
                            { value: 'gradient', label: 'Gradient Fill (Primary to Accent)' },
                            { value: 'glass', label: 'Glassmorphic panel' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Icon Corner Radius Slider */}
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Container Corner Radius ({bIconRadius}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={bIconRadius}
                          onChange={(e) => setBIconRadius(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      {/* Icon Border Width Slider */}
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Container Border Width ({bIconBorderWidth}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          value={bIconBorderWidth}
                          onChange={(e) => setBIconBorderWidth(parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Icon Line Thickness Slider */}
                      <div className="space-y-1.5 p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Icon Stroke Weight / Thickness ({bIconStrokeWidth}px)</label>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.5"
                          value={bIconStrokeWidth}
                          onChange={(e) => setBIconStrokeWidth(parseFloat(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Live Icon Previews */}
                    <div className="space-y-3 pt-3 border-t dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest block">Live Icon Element Previews</span>
                      
                      <div className="grid grid-cols-4 gap-4 p-4 rounded-xl border dark:border-slate-800/80 bg-slate-500/5 items-center justify-items-center">
                        {(() => {
                          const iconGlyphColor = {
                            primary: bPrimaryColor,
                            secondary: bSecondaryColor,
                            accent: bAccentColor,
                            neutral: '#64748b'
                          }[bIconColorType];

                          const containerStyle = {
                            borderRadius: `${bIconRadius}px`,
                            border: bIconBorderWidth > 0 ? `${bIconBorderWidth}px solid ${iconGlyphColor}30` : 'none',
                          };

                          if (bIconBgType === 'solid') {
                            containerStyle.background = `${iconGlyphColor}15`;
                          } else if (bIconBgType === 'gradient') {
                            containerStyle.background = `linear-gradient(135deg, ${bPrimaryColor}15, ${bAccentColor}15)`;
                          } else if (bIconBgType === 'glass') {
                            containerStyle.background = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                            containerStyle.backdropFilter = 'blur(4px)';
                            containerStyle.border = '1px solid rgba(156, 163, 175, 0.15)';
                          }

                          return bIcons.slice(0, 4).map((ic) => (
                            <div
                              key={ic}
                              style={containerStyle}
                              className="h-12 w-12 flex items-center justify-center transition-all hover:scale-105"
                              title={`${ic} styled preview`}
                            >
                              <div style={{ color: iconGlyphColor }}>
                                <DynamicIcon name={ic} size={22} strokeWidth={bIconStrokeWidth} />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Side - Real-time Design System Specimen (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="sticky top-24 space-y-6">
                    <Card className={`${cardClass} p-6 border-indigo-500/20 shadow-xl relative overflow-hidden bg-linear-to-br ${
                      darkMode ? 'from-slate-950 via-slate-950 to-indigo-950/20' : 'from-white via-white to-indigo-50/10'
                    }`}>
                      {/* Floating accent light */}
                      <span className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-40" style={{ backgroundColor: bPrimaryColor }} />
                      
                      <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 mb-4 dark:border-slate-800">
                        Live Brand System Specimen
                      </h4>

                      <div className="space-y-6">
                        {/* Monogram/Logo Showcase */}
                        <div className="flex items-center space-x-3 bg-slate-500/5 p-3 rounded-xl">
                          {bLogoImage ? (
                            <img src={bLogoImage} className="h-10 w-10 object-contain rounded bg-white/80 p-0.5" alt="Preview logo" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow" style={{ backgroundColor: bPrimaryColor }}>
                              {bName ? bName.substring(0, 1).toUpperCase() : 'B'}
                            </div>
                          )}
                          <div>
                            <h5 className="text-sm font-bold leading-tight">{bName || 'Brand Name'}</h5>
                            <span className="text-[10px] text-slate-404 font-medium block">{bTagline || 'Brand Tagline'}</span>
                            <span className="text-[10px] font-mono text-indigo-550 dark:text-indigo-400">{bIndustry}</span>
                          </div>
                        </div>

                        {/* Typography Specimen Section */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-400 block">Typography Preview ({bTitleFont} / {bHeadingFont} / {bSubheadingFont} / {bBodyFont})</span>
                          <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2">
                            {(() => {
                              const tColor = bTitleColor === 'primary' ? bPrimaryColor : bTitleColor === 'secondary' ? bSecondaryColor : bTitleColor === 'accent' ? bAccentColor : bTitleColor === 'neutral' ? '#64748b' : bTitleColor === 'white' ? '#ffffff' : bTitleColor === 'black' ? '#000000' : bTitleCustomColor;
                              const hColor = bHeadingColor === 'primary' ? bPrimaryColor : bHeadingColor === 'secondary' ? bSecondaryColor : bHeadingColor === 'accent' ? bAccentColor : bHeadingColor === 'neutral' ? '#64748b' : bHeadingColor === 'white' ? '#ffffff' : bHeadingColor === 'black' ? '#000000' : bHeadingCustomColor;
                              const sColor = bSubheadingColor === 'primary' ? bPrimaryColor : bSubheadingColor === 'secondary' ? bSecondaryColor : bSubheadingColor === 'accent' ? bAccentColor : bSubheadingColor === 'neutral' ? '#64748b' : bSubheadingColor === 'white' ? '#ffffff' : bSubheadingColor === 'black' ? '#000000' : bSubheadingCustomColor;
                              const bColor = bBodyColor === 'primary' ? bPrimaryColor : bBodyColor === 'secondary' ? bSecondaryColor : bBodyColor === 'accent' ? bAccentColor : bBodyColor === 'neutral' ? (darkMode ? '#94a3b8' : '#475569') : bBodyColor === 'white' ? '#ffffff' : bBodyColor === 'black' ? '#000000' : bBodyCustomColor;

                              return (
                                <>
                                  <span className="block truncate" style={{ fontFamily: bTitleFont, fontSize: `${Math.min(bTitleSize, 38)}px`, color: tColor, fontWeight: bTitleWeight }}>
                                    Title Style Text
                                  </span>
                                  <span className="block truncate" style={{ fontFamily: bHeadingFont, fontSize: `${Math.min(bHeadingSize, 28)}px`, color: hColor, fontWeight: bHeadingWeight }}>
                                    Heading Style Text
                                  </span>
                                  <span className="block truncate" style={{ fontFamily: bSubheadingFont, fontSize: `${Math.min(bSubheadingSize, 20)}px`, color: sColor, fontWeight: bSubheadingWeight }}>
                                    Subheading Style Text
                                  </span>
                                  <p className="text-xs leading-relaxed" style={{ fontFamily: bBodyFont, fontSize: `${bBodySize}px`, color: bColor, fontWeight: bBodyWeight }}>
                                    Our brand voice is <span className="font-bold">{bVoice}</span>.
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* UI Components Sandbox */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-400 block">UI Component Specimen (Styled Buttons, Badges, Labels & Alerts)</span>
                          <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-3">
                            {/* Buttons Preview */}
                            {(() => {
                              const buttonBg = bButtonColorType === 'primary' 
                                ? bPrimaryColor 
                                : bButtonColorType === 'secondary' 
                                  ? bSecondaryColor 
                                  : bButtonColorType === 'accent' 
                                    ? bAccentColor 
                                    : bButtonCustomColor;

                              const secondColor = bSecondaryColor;

                              const btnStyle = {
                                borderRadius: `${bButtonRadius}px`,
                                borderWidth: `${bButtonBorderWidth}px`,
                                borderStyle: bButtonBorderStyle,
                                borderColor: buttonBg,
                              };

                              const solidBg = bButtonBgType === 'gradient'
                                ? `linear-gradient(to right, ${buttonBg}, ${secondColor})`
                                : buttonBg;

                              const shadowClasses = {
                                none: '',
                                sm: 'shadow-sm',
                                md: 'shadow-md',
                                lg: 'shadow-lg'
                              }[bButtonShadow];

                              return (
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    style={{ ...btnStyle, background: solidBg, color: '#ffffff', borderColor: 'transparent' }}
                                    className={`flex-1 text-xs font-semibold py-2 px-3 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-center ${shadowClasses}`}
                                  >
                                    Primary styled
                                  </button>
                                  <button
                                    type="button"
                                    style={{ ...btnStyle, background: 'transparent', color: buttonBg }}
                                    className={`flex-1 text-xs font-semibold py-2 px-3 hover:bg-slate-500/5 active:scale-[0.98] transition-all cursor-pointer text-center ${shadowClasses}`}
                                  >
                                    Outline styled
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Styled Badges & Labels */}
                            <div className="grid grid-cols-2 gap-2 items-center justify-items-center bg-white dark:bg-slate-900/40 p-2 rounded-lg border dark:border-slate-800">
                              {/* Badge */}
                              {(() => {
                                const badgeRadiusClasses = {
                                  none: 'rounded-none',
                                  sm: 'rounded',
                                  md: 'rounded-lg',
                                  lg: 'rounded-xl',
                                  full: 'rounded-full'
                                }[bBadgeRadius];

                                let badgeStyle = {};
                                let badgeClasses = `px-2 py-0.5 text-[9px] font-bold ${badgeRadiusClasses} `;

                                if (bBadgeBgType === 'solid') {
                                  badgeStyle = { backgroundColor: bPrimaryColor, color: '#ffffff' };
                                } else if (bBadgeBgType === 'outline') {
                                  badgeStyle = { border: `1px solid ${bPrimaryColor}`, color: bPrimaryColor };
                                } else if (bBadgeBgType === 'soft') {
                                  badgeStyle = { backgroundColor: `${bPrimaryColor}20`, color: bPrimaryColor };
                                } else if (bBadgeBgType === 'glass') {
                                  badgeStyle = { border: '1px solid rgba(156, 163, 175, 0.2)' };
                                  badgeClasses += darkMode ? 'bg-slate-900/50 text-slate-200' : 'bg-white/40 text-slate-700 backdrop-blur-[2px]';
                                }

                                return (
                                  <span style={badgeStyle} className={badgeClasses}>
                                    Live Badge
                                  </span>
                                );
                              })()}

                              {/* Label */}
                              {(() => {
                                const weightClasses = {
                                  normal: 'font-normal',
                                  medium: 'font-medium',
                                  semibold: 'font-semibold',
                                  bold: 'font-bold'
                                }[bLabelWeight];

                                const transformStyle = {
                                  textTransform: bLabelTransform
                                };

                                return (
                                  <span 
                                    style={transformStyle} 
                                    className={`text-[10px] ${weightClasses} ${darkMode ? 'text-slate-355' : 'text-slate-700'}`}
                                  >
                                    Live Label
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Styled Notification Alert */}
                            {(() => {
                              let alertStyle = {
                                borderRadius: `${bAlertRadius}px`
                              };
                              let alertClasses = 'w-full p-2.5 text-[10px] flex items-center justify-between border ';

                              if (bAlertBgType === 'solid') {
                                alertStyle.backgroundColor = bPrimaryColor;
                                alertStyle.color = '#ffffff';
                                alertStyle.borderColor = 'transparent';
                              } else if (bAlertBgType === 'soft') {
                                alertStyle.backgroundColor = `${bPrimaryColor}10`;
                                alertStyle.color = bPrimaryColor;
                                alertStyle.borderColor = `${bPrimaryColor}20`;
                              } else if (bAlertBgType === 'glass') {
                                alertStyle.borderColor = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                                alertClasses += darkMode ? 'bg-slate-900/40 text-slate-200' : 'bg-white/40 text-slate-700 backdrop-blur-[4px]';
                              }

                              if (bAlertBorder) {
                                alertStyle.borderLeftWidth = '3px';
                                alertStyle.borderLeftColor = bPrimaryColor;
                              }

                              return (
                                <div style={alertStyle} className={alertClasses}>
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <DynamicIcon name="Sparkles" size={12} />
                                    <span className="font-semibold truncate">Specimen Notification Alert</span>
                                  </div>
                                  <span className="text-[10px] opacity-75 font-bold cursor-pointer hover:opacity-100" onClick={(e) => { e.preventDefault(); }}>✕</span>
                                </div>
                              );
                            })()}

                            {/* Styled Icons Row */}
                            {(() => {
                              const iconGlyphColor = {
                                primary: bPrimaryColor,
                                secondary: bSecondaryColor,
                                accent: bAccentColor,
                                neutral: '#64748b'
                              }[bIconColorType];

                              const containerStyle = {
                                borderRadius: `${bIconRadius}px`,
                                border: bIconBorderWidth > 0 ? `${bIconBorderWidth}px solid ${iconGlyphColor}30` : 'none',
                              };

                              if (bIconBgType === 'solid') {
                                containerStyle.background = `${iconGlyphColor}15`;
                              } else if (bIconBgType === 'gradient') {
                                containerStyle.background = `linear-gradient(135deg, ${bPrimaryColor}15, ${bAccentColor}15)`;
                              } else if (bIconBgType === 'glass') {
                                containerStyle.background = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
                                containerStyle.backdropFilter = 'blur(4px)';
                                containerStyle.border = '1px solid rgba(156, 163, 175, 0.15)';
                              }

                              return (
                                <div className="flex items-center justify-center space-x-3 bg-white dark:bg-slate-900/40 p-2.5 rounded-lg border dark:border-slate-800">
                                  {bIcons.slice(0, 4).map((ic) => (
                                    <div
                                      key={ic}
                                      style={containerStyle}
                                      className="h-9 w-9 flex items-center justify-center transition-all hover:scale-105"
                                      title={`${ic} specimen`}
                                    >
                                      <div style={{ color: iconGlyphColor }}>
                                        <DynamicIcon name={ic} size={16} strokeWidth={bIconStrokeWidth} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Dynamic Recharts Chart Visualizing Colors */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-slate-400 block">Real-time Color Propagation Chart</span>
                          <div className="h-28 w-full border rounded-lg bg-slate-500/5 p-2 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={WORKSTATION_PREVIEW_CHART_DATA}>
                                <defs>
                                  <linearGradient id="colorBPrimary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={bPrimaryColor} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={bPrimaryColor} stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v1" stroke={bPrimaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorBPrimary)" />
                                <Area type="monotone" dataKey="v2" stroke={bSecondaryColor} strokeWidth={1.5} fill="transparent" strokeDasharray="3 3" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleLaunchBrandKit}
                        className="w-full mt-6 py-3 font-bold text-white bg-linear-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 shadow-xl shadow-indigo-500/10 border-none cursor-pointer transform hover:-translate-y-0.5 transition-all text-xs uppercase tracking-wider"
                      >
                        {editingProjectId ? 'Update Brand System' : 'Launch Brand System'}
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>

              {/* 18-Section Design System Specifications Panel */}
              <DesignSystemSpecsPanel
                brandName={bName}
                tagline={bTagline}
                voice={bVoice}
                industry={bIndustry}
                primaryColor={bPrimaryColor}
                secondaryColor={bSecondaryColor}
                accentColor={bAccentColor}
                borderRadius={bRadius}
                headingFont={bHeadingFont}
                bodyFont={bBodyFont}
                titleFont={bTitleFont}
                subheadingFont={bSubheadingFont}
                logoImage={bLogoImage}
                darkMode={darkMode}
                changelog={editingProjectId ? (projects.find(p => p.id === editingProjectId)?.changelog || []) : []}
                history={editingProjectId ? (projects.find(p => p.id === editingProjectId)?.history || []) : []}
                onRollback={(targetVersion) => {
                  if (editingProjectId) {
                    rollbackProject(editingProjectId, targetVersion);
                    const restored = projects.find(p => p.id === editingProjectId);
                    if (restored) {
                      setBName(restored.name);
                      setBTagline(restored.tagline || '');
                      setBVoice(restored.voice || 'Professional');
                      setBIndustry(restored.industry || 'Technology');
                      setBPrimaryColor(restored.colors.primary);
                      setBSecondaryColor(restored.colors.secondary);
                      setBAccentColor(restored.colors.accent);
                      setBRadius(restored.spacing?.borderRadius || 8);
                      setBHeadingFont(restored.typography.headingFont);
                      setBBodyFont(restored.typography.bodyFont);
                      setBTitleFont(restored.typography.titleFont || restored.typography.headingFont || 'Outfit');
                      setBSubheadingFont(restored.typography.subheadingFont || restored.typography.headingFont || 'Outfit');
                    }
                    triggerToast(`Rolled back workstation draft to version ${targetVersion}!`, 'success');
                  } else {
                    triggerToast('Rollback is only supported on existing saved projects.', 'error');
                  }
                }}
              />
            </div>
          )}

          {/* USER PROFILE & SETTINGS TAB */}
          {activeTab === 'profile-settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="border-b pb-4 dark:border-slate-800">
                <h3 className={`text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>
                  Settings & Preferences
                </h3>
                <p className={`text-xs ${cardDescClass}`}>Personalize appearance and notification settings.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
                {/* Left Side: Profile Edit Form */}
                <div className="h-full">
                  <Card className={`${cardClass} p-6 h-full flex flex-col justify-between`}>
                    <h4 className="text-xs font-bold text-slate-405 uppercase tracking-widest border-b pb-2 dark:border-slate-800 flex items-center space-x-2 shrink-0">
                      <User size={16} className="text-indigo-500" />
                      <span>User Profile Details</span>
                    </h4>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-4 flex flex-col justify-between flex-1 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Column 1: Full Name & Email */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Full Name *</label>
                            <input
                              type="text"
                              value={editProfileName}
                              onChange={(e) => setEditProfileName(e.target.value)}
                              placeholder="e.g. Alex Mercer"
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Email Address *</label>
                            <input
                              type="email"
                              value={editProfileEmail}
                              onChange={(e) => setEditProfileEmail(e.target.value)}
                              placeholder="e.g. alex@brandkit.ai"
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                              required
                            />
                          </div>
                        </div>

                        {/* Column 2: Mobile Number & Account Role */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Mobile Number</label>
                            <input
                              type="text"
                              value={editProfileMobile}
                              onChange={(e) => setEditProfileMobile(e.target.value)}
                              placeholder="e.g. +1 (555) 019-2834"
                              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Account Role</label>
                            <input
                              type="text"
                              value={user?.role?.toUpperCase() || 'USER'}
                              disabled
                              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none border bg-slate-500/5 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-white bg-indigo-600 hover:bg-indigo-600 shadow-indigo-600/10 mt-6 shrink-0 animate-pulse hover:animate-none"
                      >
                        Save Profile Changes
                      </Button>
                    </form>
                  </Card>
                </div>

                {/* Right Side: Appearance */}
                <div className="h-full">
                  <Card className={`${cardClass} p-6 h-full flex flex-col justify-between`}>
                    {/* Appearance Header */}
                    <div className="flex items-center space-x-2 border-b pb-2 dark:border-slate-800 shrink-0">
                      <Palette className="text-indigo-500 h-5 w-5" />
                      <h4 className={`text-base font-bold ${cardTitleClass}`}>Appearance</h4>
                    </div>

                    {/* Dark Theme Toggle */}
                    <div className="flex items-center justify-between mt-4 shrink-0">
                      <div>
                        <span className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-805'}`}>Dark Theme</span>
                        <span className="text-[11px] text-slate-400 block">Enable dark mode across the application.</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center shrink-0 ${
                          darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                          darkMode ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Accent Color Selection */}
                    <div className="space-y-3 mt-6 flex-1 flex flex-col justify-end">
                      <div>
                        <span className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-855'}`}>Accent Color</span>
                        <span className="text-[11px] text-slate-400 block">Choose your preferred brand accent.</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 mt-2">
                        {[
                          { id: 'indigo', label: 'Indigo (Default)', hex: '#4f46e5', bg: 'bg-indigo-600' },
                          { id: 'emerald', label: 'Emerald', hex: '#059669', bg: 'bg-emerald-600' },
                          { id: 'teal', label: 'Teal', hex: '#0d9488', bg: 'bg-teal-600' },
                          { id: 'rose', label: 'Rose', hex: '#e11d48', bg: 'bg-rose-600' },
                          { id: 'amber', label: 'Amber', hex: '#d97706', bg: 'bg-amber-600' }
                        ].map((color) => {
                          const isSelected = uiAccent === color.id;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setUiAccent(color.id)}
                              className={`w-full flex items-center justify-between p-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/15'
                                  : darkMode
                                    ? 'border-slate-800 bg-slate-900/40 text-slate-350 hover:bg-slate-900'
                                    : 'border-slate-200 bg-white text-slate-655 hover:bg-slate-50 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className={`h-3 w-3 rounded-full ${color.bg}`} />
                                <span>{color.label}</span>
                              </div>
                              {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* 2. BRAND PROFILE TAB */}
          {activeTab === 'brand' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Brand Details</h3>
                <p className={`text-xs ${cardDescClass}`}>Basic identification tokens for websites and logos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Brand Name</label>
                  <input
                    type="text"
                    value={activeProject.name}
                    onChange={(e) => updateProject(activeProjectId, { name: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Tagline</label>
                  <input
                    type="text"
                    value={activeProject.tagline}
                    onChange={(e) => updateProject(activeProjectId, { tagline: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Logo Symbol/Text</label>
                  <input
                    type="text"
                    value={activeProject.logo}
                    onChange={(e) => updateProject(activeProjectId, { logo: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={activeProject.industry}
                    onChange={(e) => updateProject(activeProjectId, { industry: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Brand Description</label>
                  <textarea
                    value={activeProject.description}
                    onChange={(e) => updateProject(activeProjectId, { description: e.target.value })}
                    rows="3"
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    value={activeProject.website}
                    onChange={(e) => updateProject(activeProjectId, { website: e.target.value })}
                    placeholder="https://example.com"
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Favicon Icon/Emoji</label>
                  <input
                    type="text"
                    value={activeProject.favicon}
                    onChange={(e) => updateProject(activeProjectId, { favicon: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${inputClass}`}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Uploaded Brand Logo (Image)</label>
                  <div className="flex items-center space-x-4 p-4 border rounded-xl dark:border-slate-800 bg-slate-500/5">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateProject(activeProjectId, { logoImage: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Upload an image logo (PNG/SVG) to replace the text-based logo symbol.</p>
                    </div>
                    {activeProject.logoImage ? (
                      <div className="h-16 w-16 rounded-lg border bg-white flex items-center justify-center p-2 shrink-0 shadow-sm relative group">
                        <img src={activeProject.logoImage} className="max-h-full max-w-full object-contain" alt="Brand Logo" />
                        <button
                          type="button"
                          onClick={() => updateProject(activeProjectId, { logoImage: null })}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow cursor-pointer flex items-center justify-center"
                          style={{ width: '16px', height: '16px' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className={`h-16 w-16 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 text-slate-405 border-dashed ${
                        darkMode ? 'border-slate-700' : 'border-slate-300'
                      }`}>
                        No Logo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. COLOR PALETTE TAB */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Color System</h3>
                <p className={`text-xs ${cardDescClass}`}>Click on any color to edit. Shades and contrast checks will update automatically.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {Object.keys(activeProject.colors).map((key) => {
                  const color = activeProject.colors[key];
                  return (
                    <div key={key} className={`border rounded-xl p-4 flex flex-col items-center ${
                      darkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-202 shadow-xs'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-2">{key}</span>
                      
                      {/* Visual Swatch */}
                      <div className="relative group cursor-pointer mb-3">
                        <div
                          className="h-14 w-14 rounded-full border shadow-md transition-transform group-hover:scale-105"
                          style={{ backgroundColor: color, borderColor: darkMode ? '#334155' : '#cbd5e1' }}
                        />
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const updatedColors = { ...activeProject.colors, [key]: e.target.value };
                            updateProjectColors(activeProjectId, updatedColors);
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>

                      <span className={`text-sm font-mono font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{color.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Shade Generation & Contrast Check */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Shade generation */}
                <Card className={`${cardClass} p-6`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-505 mb-4">Shade Generator (Primary)</h4>
                  <div className="grid grid-cols-11 gap-1">
                    {primaryShades.map((shade) => (
                      <div key={shade.label} className="flex flex-col items-center">
                        <div
                          className="h-10 w-full rounded shadow-sm"
                          style={{ backgroundColor: shade.hex }}
                        />
                        <span className="text-[9px] text-slate-404 mt-1 font-bold">{shade.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {primaryShades.map((shade) => (
                      <span key={shade.label} className={`text-[10px] font-mono border py-1 px-2 rounded ${
                        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-105 border-slate-200'
                      }`}>
                        {shade.label}: {shade.hex.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Contrast check */}
                <Card className={`${cardClass} p-6 flex flex-col justify-between`}>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-505 mb-2">Contrast Checker (WCAG 2.2)</h4>
                    <p className={`text-xs ${cardDescClass}`}>Evaluating primary color readability against background color.</p>
                  </div>

                  <div className="flex items-center space-x-6 my-4">
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-xs shadow-md border"
                      style={{
                        backgroundColor: activeProject.colors.background,
                        color: activeProject.colors.primary,
                        borderColor: activeProject.colors.primary
                      }}
                    >
                      Aa
                    </div>

                    <div>
                      <div className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{contrastInfo.ratio} : 1</div>
                      <div className={`text-xs ${cardDescClass}`}>Contrast ratio</div>
                    </div>

                    <div className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                      contrastInfo.grade.includes('Fail') ? 'bg-red-500/10 text-red-605 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-605 dark:text-emerald-400'
                    }`}>
                      {contrastInfo.grade}
                    </div>
                  </div>

                  <div className={`text-xs border-t pt-3 ${darkMode ? 'text-slate-500 border-slate-800/60' : 'text-slate-400 border-slate-200'}`}>
                    {contrastInfo.ratio >= 4.5
                      ? '✓ Meets the WCAG AA minimum contrast ratio of 4.5:1 for normal body text.'
                      : '⚠️ Fail: Increase primary saturation or lighten background to satisfy accessibility guidelines.'}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 4. TYPOGRAPHY TAB */}
          {activeTab === 'typography' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Typography Settings</h3>
                <p className={`text-xs ${cardDescClass}`}>Manage heading and body font tokens.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Title Font Family</label>
                  <CustomSelect
                    value={activeProject.typography.titleFont || activeProject.typography.headingFont || 'Outfit'}
                    onChange={(e) => updateProjectTypography(activeProjectId, { titleFont: e.target.value })}
                    darkMode={darkMode}
                    options={googleFontsOptions}
                    searchable={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Heading Font Family</label>
                  <CustomSelect
                    value={activeProject.typography.headingFont}
                    onChange={(e) => updateProjectTypography(activeProjectId, { headingFont: e.target.value })}
                    darkMode={darkMode}
                    options={googleFontsOptions}
                    searchable={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Sub-heading Font Family</label>
                  <CustomSelect
                    value={activeProject.typography.subheadingFont || activeProject.typography.headingFont || 'Outfit'}
                    onChange={(e) => updateProjectTypography(activeProjectId, { subheadingFont: e.target.value })}
                    darkMode={darkMode}
                    options={googleFontsOptions}
                    searchable={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Body Font Family</label>
                  <CustomSelect
                    value={activeProject.typography.bodyFont}
                    onChange={(e) => updateProjectTypography(activeProjectId, { bodyFont: e.target.value })}
                    darkMode={darkMode}
                    options={googleFontsOptions}
                    searchable={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Title Font Size ({activeProject.typography.titleSize || 48}px)</label>
                  <input
                    type="range"
                    min="32"
                    max="72"
                    value={activeProject.typography.titleSize || 48}
                    onChange={(e) => updateProjectTypography(activeProjectId, { titleSize: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Heading Font Size ({activeProject.typography.headingSize || 32}px)</label>
                  <input
                    type="range"
                    min="24"
                    max="48"
                    value={activeProject.typography.headingSize || 32}
                    onChange={(e) => updateProjectTypography(activeProjectId, { headingSize: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Subheading Font Size ({activeProject.typography.subheadingSize || 20}px)</label>
                  <input
                    type="range"
                    min="16"
                    max="32"
                    value={activeProject.typography.subheadingSize || 20}
                    onChange={(e) => updateProjectTypography(activeProjectId, { subheadingSize: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Line Height ({activeProject.typography.lineHeight || '1.5'})</label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={parseFloat(activeProject.typography.lineHeight || '1.5')}
                    onChange={(e) => updateProjectTypography(activeProjectId, { lineHeight: e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Letter Spacing ({activeProject.typography.letterSpacing || '0px'})</label>
                  <CustomSelect
                    value={activeProject.typography.letterSpacing || '0px'}
                    onChange={(e) => updateProjectTypography(activeProjectId, { letterSpacing: e.target.value })}
                    darkMode={darkMode}
                    options={[
                      { value: '-1px', label: 'Tight (-1px)' },
                      { value: '0px', label: 'Normal (0px)' },
                      { value: '1px', label: 'Wide (1px)' },
                      { value: '2px', label: 'Wider (2px)' },
                      { value: '4px', label: 'Widest (4px)' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-405 dark:text-slate-505 uppercase tracking-wider">Heading Font Scale ({activeProject.typography.scale || '1.25'})</label>
                  <CustomSelect
                    value={activeProject.typography.scale || '1.25'}
                    onChange={(e) => updateProjectTypography(activeProjectId, { scale: e.target.value })}
                    darkMode={darkMode}
                    options={[
                      { value: '1.15', label: 'Minor Third (1.15)' },
                      { value: '1.25', label: 'Major Third (1.25)' },
                      { value: '1.33', label: 'Perfect Fourth (1.33)' },
                      { value: '1.41', label: 'Augmented Fourth (1.41)' },
                      { value: '1.50', label: 'Perfect Fifth (1.50)' },
                      { value: '1.618', label: 'Golden Ratio (1.618)' }
                    ]}
                  />
                </div>
              </div>

              {/* Typography Colors & Font Weights (Boldness) Settings */}
              <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-405 dark:text-slate-505 uppercase tracking-widest block mb-2">Typography Colors & Font Weights (Boldness)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Title customizer */}
                  <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-550 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Title Style</span>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Text Color</label>
                      <CustomSelect
                        value={activeProject.typography.titleColor || 'primary'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { titleColor: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: 'primary', label: 'Primary Brand' },
                          { value: 'secondary', label: 'Secondary Brand' },
                          { value: 'accent', label: 'Accent Brand' },
                          { value: 'neutral', label: 'Neutral Slate' },
                          { value: 'white', label: 'White' },
                          { value: 'black', label: 'Black' },
                          { value: 'custom', label: 'Custom HEX' }
                        ]}
                      />
                    </div>
                    {(activeProject.typography.titleColor === 'custom') && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={activeProject.typography.titleCustomColor || '#6366f1'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { titleCustomColor: e.target.value })}
                          className="h-6 w-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeProject.typography.titleCustomColor || '#6366f1'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { titleCustomColor: e.target.value })}
                          className={`flex-1 text-[10px] px-2 py-1 rounded border font-mono ${
                            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                          }`}
                          placeholder="#6366f1"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Boldness (Weight)</label>
                      <CustomSelect
                        value={activeProject.typography.titleWeight || '800'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { titleWeight: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: '400', label: 'Normal (400)' },
                          { value: '500', label: 'Medium (500)' },
                          { value: '600', label: 'Semibold (600)' },
                          { value: '700', label: 'Bold (700)' },
                          { value: '800', label: 'Extra Bold (800)' },
                          { value: '900', label: 'Black (900)' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Heading customizer */}
                  <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Heading Style</span>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Text Color</label>
                      <CustomSelect
                        value={activeProject.typography.headingColor || 'secondary'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { headingColor: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: 'primary', label: 'Primary Brand' },
                          { value: 'secondary', label: 'Secondary Brand' },
                          { value: 'accent', label: 'Accent Brand' },
                          { value: 'neutral', label: 'Neutral Slate' },
                          { value: 'white', label: 'White' },
                          { value: 'black', label: 'Black' },
                          { value: 'custom', label: 'Custom HEX' }
                        ]}
                      />
                    </div>
                    {(activeProject.typography.headingColor === 'custom') && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={activeProject.typography.headingCustomColor || '#a855f7'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { headingCustomColor: e.target.value })}
                          className="h-6 w-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeProject.typography.headingCustomColor || '#a855f7'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { headingCustomColor: e.target.value })}
                          className={`flex-1 text-[10px] px-2 py-1 rounded border font-mono ${
                            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                          }`}
                          placeholder="#a855f7"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Boldness (Weight)</label>
                      <CustomSelect
                        value={activeProject.typography.headingWeight || '700'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { headingWeight: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: '400', label: 'Normal (400)' },
                          { value: '500', label: 'Medium (500)' },
                          { value: '600', label: 'Semibold (600)' },
                          { value: '700', label: 'Bold (700)' },
                          { value: '800', label: 'Extra Bold (800)' },
                          { value: '900', label: 'Black (900)' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Subheading customizer */}
                  <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Subheading Style</span>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Text Color</label>
                      <CustomSelect
                        value={activeProject.typography.subheadingColor || 'accent'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { subheadingColor: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: 'primary', label: 'Primary Brand' },
                          { value: 'secondary', label: 'Secondary Brand' },
                          { value: 'accent', label: 'Accent Brand' },
                          { value: 'neutral', label: 'Neutral Slate' },
                          { value: 'white', label: 'White' },
                          { value: 'black', label: 'Black' },
                          { value: 'custom', label: 'Custom HEX' }
                        ]}
                      />
                    </div>
                    {(activeProject.typography.subheadingColor === 'custom') && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={activeProject.typography.subheadingCustomColor || '#06b6d4'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { subheadingCustomColor: e.target.value })}
                          className="h-6 w-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeProject.typography.subheadingCustomColor || '#06b6d4'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { subheadingCustomColor: e.target.value })}
                          className={`flex-1 text-[10px] px-2 py-1 rounded border font-mono ${
                            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                          }`}
                          placeholder="#06b6d4"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Boldness (Weight)</label>
                      <CustomSelect
                        value={activeProject.typography.subheadingWeight || '600'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { subheadingWeight: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: '400', label: 'Normal (400)' },
                          { value: '500', label: 'Medium (500)' },
                          { value: '600', label: 'Semibold (600)' },
                          { value: '700', label: 'Bold (700)' },
                          { value: '800', label: 'Extra Bold (800)' },
                          { value: '900', label: 'Black (900)' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Body customizer */}
                  <div className="p-3 border rounded-xl dark:border-slate-800 bg-slate-500/5 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-555 dark:text-indigo-400 block border-b pb-1 dark:border-slate-800/50">Body Text Style</span>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Text Color</label>
                      <CustomSelect
                        value={activeProject.typography.bodyColor || 'neutral'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { bodyColor: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: 'primary', label: 'Primary Brand' },
                          { value: 'secondary', label: 'Secondary Brand' },
                          { value: 'accent', label: 'Accent Brand' },
                          { value: 'neutral', label: 'Neutral Slate' },
                          { value: 'white', label: 'White' },
                          { value: 'black', label: 'Black' },
                          { value: 'custom', label: 'Custom HEX' }
                        ]}
                      />
                    </div>
                    {(activeProject.typography.bodyColor === 'custom') && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="color"
                          value={activeProject.typography.bodyCustomColor || '#475569'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { bodyCustomColor: e.target.value })}
                          className="h-6 w-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={activeProject.typography.bodyCustomColor || '#475569'}
                          onChange={(e) => updateProjectTypography(activeProjectId, { bodyCustomColor: e.target.value })}
                          className={`flex-1 text-[10px] px-2 py-1 rounded border font-mono ${
                            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-855'
                          }`}
                          placeholder="#475569"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Boldness (Weight)</label>
                      <CustomSelect
                        value={activeProject.typography.bodyWeight || '400'}
                        onChange={(e) => updateProjectTypography(activeProjectId, { bodyWeight: e.target.value })}
                        darkMode={darkMode}
                        options={[
                          { value: '300', label: 'Light (300)' },
                          { value: '400', label: 'Normal (400)' },
                          { value: '500', label: 'Medium (500)' },
                          { value: '600', label: 'Semibold (600)' },
                          { value: '700', label: 'Bold (700)' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live spec specimen */}
              <div className={`border rounded-xl p-6 mt-4 ${
                darkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-202 bg-white shadow-sm'
              }`}>
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-4">Type Specimen Preview</h4>
                <div className="space-y-6">
                  {/* Title Preview */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block">Title ({activeProject.typography.titleSize || 48}px)</span>
                    <h1
                      style={{
                        fontFamily: activeProject.typography.titleFont || activeProject.typography.headingFont || 'Outfit',
                        fontSize: `${activeProject.typography.titleSize || 48}px`,
                        fontWeight: activeProject.typography.titleWeight || '800',
                        lineHeight: '1.2',
                        color: (() => {
                          const c = activeProject.typography.titleColor || 'primary';
                          return c === 'primary' ? activeProject.colors.primary : c === 'secondary' ? activeProject.colors.secondary : c === 'accent' ? activeProject.colors.accent : c === 'neutral' ? '#64748b' : c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : (activeProject.typography.titleCustomColor || '#6366f1');
                        })()
                      }}
                    >
                      {activeProject.name} Title Specimen
                    </h1>
                  </div>

                  {/* Heading Preview */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block">Heading ({activeProject.typography.headingSize || 32}px)</span>
                    <h2
                      style={{
                        fontFamily: activeProject.typography.headingFont,
                        fontSize: `${activeProject.typography.headingSize || 32}px`,
                        fontWeight: activeProject.typography.headingWeight || '700',
                        lineHeight: '1.3',
                        color: (() => {
                          const c = activeProject.typography.headingColor || 'secondary';
                          return c === 'primary' ? activeProject.colors.primary : c === 'secondary' ? activeProject.colors.secondary : c === 'accent' ? activeProject.colors.accent : c === 'neutral' ? '#64748b' : c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : (activeProject.typography.headingCustomColor || '#a855f7');
                        })()
                      }}
                    >
                      This is a Heading element
                    </h2>
                  </div>

                  {/* Subheading Preview */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block">Subheading ({activeProject.typography.subheadingSize || 20}px)</span>
                    <h3
                      style={{
                        fontFamily: activeProject.typography.subheadingFont || activeProject.typography.headingFont || 'Outfit',
                        fontSize: `${activeProject.typography.subheadingSize || 20}px`,
                        fontWeight: activeProject.typography.subheadingWeight || '600',
                        lineHeight: '1.4',
                        color: (() => {
                          const c = activeProject.typography.subheadingColor || 'accent';
                          return c === 'primary' ? activeProject.colors.primary : c === 'secondary' ? activeProject.colors.secondary : c === 'accent' ? activeProject.colors.accent : c === 'neutral' ? '#64748b' : c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : (activeProject.typography.subheadingCustomColor || '#06b6d4');
                        })()
                      }}
                    >
                      This is a Subheading element for smaller sections
                    </h3>
                  </div>

                  {/* Body Preview */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block">Body ({activeProject.typography.bodySize || 14}px)</span>
                    <p
                      style={{
                        fontFamily: activeProject.typography.bodyFont,
                        fontSize: `${activeProject.typography.bodySize || 14}px`,
                        fontWeight: activeProject.typography.bodyWeight || '400',
                        lineHeight: '1.5',
                        color: (() => {
                          const c = activeProject.typography.bodyColor || 'neutral';
                          return c === 'primary' ? activeProject.colors.primary : c === 'secondary' ? activeProject.colors.secondary : c === 'accent' ? activeProject.colors.accent : c === 'neutral' ? (darkMode ? '#cbd5e1' : '#475569') : c === 'white' ? '#ffffff' : c === 'black' ? '#000000' : (activeProject.typography.bodyCustomColor || '#475569');
                        })()
                      }}
                    >
                      This body text uses the {activeProject.typography.bodyFont} typeface. It is clean, legible, and optimized for digital readability. Changes made to sizes or families are reflected immediately in this preview window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. ICON LIBRARY TAB */}
          {activeTab === 'icons' && (() => {
            const colors = activeProject.colors || { primary: '#6366f1', secondary: '#a855f7', accent: '#06b6d4' };
            const styleSpec = activeProject.iconStyle || {
              bgType: 'none',
              radius: 8,
              borderWidth: 0,
              strokeWidth: 2,
              colorType: 'primary'
            };

            const glyphColor = {
              primary: colors.primary,
              secondary: colors.secondary,
              accent: colors.accent,
              neutral: '#64748b'
            }[styleSpec.colorType] || colors.primary;

            const containerStyle = {
              borderRadius: `${styleSpec.radius || 8}px`,
              border: (styleSpec.borderWidth || 0) > 0 ? `${styleSpec.borderWidth}px solid ${glyphColor}30` : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out'
            };

            if (styleSpec.bgType === 'solid') {
              containerStyle.background = `${glyphColor}15`;
            } else if (styleSpec.bgType === 'gradient') {
              containerStyle.background = `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}15)`;
            } else if (styleSpec.bgType === 'glass') {
              containerStyle.background = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
              containerStyle.backdropFilter = 'blur(4px)';
              containerStyle.border = '1px solid rgba(156, 163, 175, 0.15)';
            }

            return (
              <div className="space-y-6 animate-in fade-in duration-350">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Icon Set Selection</h3>
                    <p className={`text-xs ${cardDescClass}`}>Select and favorite brand icons to include in your design system.</p>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Search icons..."
                      className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none border focus:border-indigo-505 ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  {/* Left Column: Configurator (1 col) */}
                  <Card className={`${cardClass} p-5 space-y-4 lg:col-span-1`}>
                    <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest border-b pb-2 dark:border-slate-800">Icon Styling Settings</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Icon Pack</label>
                        <CustomSelect
                          value={styleSpec.library || 'Lucide React'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setIconLibraryView(val);
                            updateProject(activeProjectId, {
                              iconStyle: { ...styleSpec, library: val }
                            });
                          }}
                          darkMode={darkMode}
                          options={[
                            { value: 'Lucide React', label: 'Lucide React' },
                            { value: 'Font Awesome', label: 'Font Awesome' },
                            { value: 'Icons8', label: 'Icons8 Web' },
                            { value: 'Material Symbols', label: 'Material Symbols' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Stroke Width ({styleSpec.strokeWidth || 2}px)</label>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.5"
                          value={styleSpec.strokeWidth || 2}
                          onChange={(e) => updateProject(activeProjectId, {
                            iconStyle: { ...styleSpec, strokeWidth: parseFloat(e.target.value) }
                          })}
                          className="w-full accent-indigo-650"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Background Type</label>
                        <CustomSelect
                          value={styleSpec.bgType || 'none'}
                          onChange={(e) => updateProject(activeProjectId, {
                            iconStyle: { ...styleSpec, bgType: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'None (Plain glyph)' },
                            { value: 'solid', label: 'Solid Accent' },
                            { value: 'gradient', label: 'Gradient Accent' },
                            { value: 'glass', label: 'Glassmorphism' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Corner Radius ({styleSpec.radius || 8}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={styleSpec.radius || 8}
                          onChange={(e) => updateProject(activeProjectId, {
                            iconStyle: { ...styleSpec, radius: parseInt(e.target.value) }
                          })}
                          className="w-full accent-indigo-650"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Color Type</label>
                        <CustomSelect
                          value={styleSpec.colorType || 'primary'}
                          onChange={(e) => updateProject(activeProjectId, {
                            iconStyle: { ...styleSpec, colorType: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'primary', label: 'Primary Brand' },
                            { value: 'secondary', label: 'Secondary Brand' },
                            { value: 'accent', label: 'Accent Brand' },
                            { value: 'neutral', label: 'Neutral Slate' }
                          ]}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Right Column: Icon Search grid & Favorites (3 cols) */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Favorites row */}
                    {activeProject.icons.length > 0 && (
                      <div className={`border p-4 rounded-xl ${
                        darkMode ? 'bg-indigo-950/15 border-indigo-500/15' : 'bg-indigo-55/5 border-indigo-200/50'
                      }`}>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-3">Brand Favorites</span>
                        <div className="flex flex-wrap gap-3">
                          {activeProject.icons.map((name) => (
                            <div key={name} className={`flex items-center space-x-2 border p-2 rounded-lg text-xs font-medium ${
                              darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-805'
                            }`}>
                              <div style={containerStyle} className="h-8 w-8 flex items-center justify-center">
                                <div style={{ color: glyphColor }}>
                                  <DynamicIcon name={name} size={16} strokeWidth={styleSpec.strokeWidth || 2} />
                                </div>
                              </div>
                              <span className="truncate max-w-20">{name.replace('fa-', '').replace('i8-', '').replace('sym-', '')}</span>
                              <button
                                onClick={() => toggleIconFavorite(activeProjectId, name)}
                                className="text-red-555 hover:text-red-400 ml-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {filteredIcons.map((name) => {
                        const isFav = activeProject.icons.includes(name);
                        return (
                          <button
                            key={name}
                            onClick={() => toggleIconFavorite(activeProjectId, name)}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                              isFav
                                ? 'border-indigo-500/40 bg-indigo-500/5'
                                : darkMode
                                  ? 'border-slate-800 hover:border-slate-700 bg-slate-900/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white shadow-xs'
                            }`}
                          >
                            <div style={containerStyle} className="h-12 w-12 flex items-center justify-center mb-2">
                              <div style={{ color: glyphColor }}>
                                <DynamicIcon name={name} size={24} strokeWidth={styleSpec.strokeWidth || 2} />
                              </div>
                            </div>
                            <span className="text-[10px] font-medium mt-1 truncate max-w-full text-slate-655 dark:text-slate-300">
                              {name.replace('fa-', '').replace('i8-', '').replace('sym-', '')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 6. COMPONENT LAB TAB */}
          {activeTab === 'components' && (() => {
            const btnStyle = activeProject.buttonStyle || {
              bgType: 'solid',
              radius: 8,
              borderWidth: 0,
              borderStyle: 'solid',
              shadow: 'sm',
              colorType: 'primary',
              customColor: '#6366f1'
            };
            const badgeStyle = activeProject.badgeStyle || {
              bgType: 'soft',
              radius: 'full'
            };
            const labelStyle = activeProject.labelStyle || {
              fontWeight: 'semibold',
              textTransform: 'uppercase'
            };
            const alertStyle = activeProject.alertStyle || {
              leftBorder: true,
              bgType: 'soft',
              radius: 8
            };

            return (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Brand Component Lab</h3>
                  <p className={`text-xs ${cardDescClass}`}>Configure, preview, and export customized UI components in real-time.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Configurator Panel (4 cols) */}
                  <Card className={`${cardClass} p-5 space-y-4 lg:col-span-4 h-155 overflow-y-auto shadow-xl border dark:border-slate-800`}>
                    <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest border-b pb-2 dark:border-slate-800">UI Component Styling</h4>
                    
                    {/* Buttons styling */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block border-b pb-1 dark:border-slate-800/40">Buttons Style</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bg Fill Type</label>
                        <CustomSelect
                          value={btnStyle.bgType}
                          onChange={(e) => updateProject(activeProjectId, {
                            buttonStyle: { ...btnStyle, bgType: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'solid', label: 'Solid Color' },
                            { value: 'gradient', label: 'Gradient' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Border Width ({btnStyle.borderWidth || 0}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          value={btnStyle.borderWidth || 0}
                          onChange={(e) => updateProject(activeProjectId, {
                            buttonStyle: { ...btnStyle, borderWidth: parseInt(e.target.value) }
                          })}
                          className="w-full accent-indigo-650"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shadow Elevation</label>
                        <CustomSelect
                          value={btnStyle.shadow}
                          onChange={(e) => updateProject(activeProjectId, {
                            buttonStyle: { ...btnStyle, shadow: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'None' },
                            { value: 'sm', label: 'Subtle (sm)' },
                            { value: 'md', label: 'Medium (md)' },
                            { value: 'lg', label: 'Large (lg)' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Badges styling */}
                    <div className="space-y-3 pt-2 border-t dark:border-slate-800/60">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block border-b pb-1 dark:border-slate-800/40">Badges Style</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bg Style</label>
                        <CustomSelect
                          value={badgeStyle.bgType}
                          onChange={(e) => updateProject(activeProjectId, {
                            badgeStyle: { ...badgeStyle, bgType: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'solid', label: 'Solid background' },
                            { value: 'soft', label: 'Soft tint background' },
                            { value: 'outline', label: 'Outline border' },
                            { value: 'glass', label: 'Glassmorphic' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Corner Style</label>
                        <CustomSelect
                          value={badgeStyle.radius}
                          onChange={(e) => updateProject(activeProjectId, {
                            badgeStyle: { ...badgeStyle, radius: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'Sharp (0px)' },
                            { value: 'sm', label: 'Small (2px)' },
                            { value: 'md', label: 'Medium (6px)' },
                            { value: 'lg', label: 'Large (8px)' },
                            { value: 'full', label: 'Pill / Full' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Labels styling */}
                    <div className="space-y-3 pt-2 border-t dark:border-slate-800/60">
                      <span className="text-[10px] font-bold text-indigo-505 uppercase tracking-wider block border-b pb-1 dark:border-slate-800/40">Labels Style</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Font Weight</label>
                        <CustomSelect
                          value={labelStyle.fontWeight}
                          onChange={(e) => updateProject(activeProjectId, {
                            labelStyle: { ...labelStyle, fontWeight: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'normal', label: 'Normal (400)' },
                            { value: 'medium', label: 'Medium (500)' },
                            { value: 'semibold', label: 'Semibold (600)' },
                            { value: 'bold', label: 'Bold (700)' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Text Transform</label>
                        <CustomSelect
                          value={labelStyle.textTransform}
                          onChange={(e) => updateProject(activeProjectId, {
                            labelStyle: { ...labelStyle, textTransform: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'none', label: 'None' },
                            { value: 'uppercase', label: 'ALL CAPS' },
                            { value: 'lowercase', label: 'all lowercase' },
                            { value: 'capitalize', label: 'First Letters Capitalized' }
                          ]}
                        />
                      </div>
                    </div>

                    {/* Alerts styling */}
                    <div className="space-y-3 pt-2 border-t dark:border-slate-800/60">
                      <span className="text-[10px] font-bold text-indigo-505 uppercase tracking-wider block border-b pb-1 dark:border-slate-800/40">Alerts Style</span>
                      
                      <div className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id="alertLeftBorderCheck"
                          checked={alertStyle.leftBorder}
                          onChange={(e) => updateProject(activeProjectId, {
                            alertStyle: { ...alertStyle, leftBorder: e.target.checked }
                          })}
                          className="h-4 w-4 rounded accent-indigo-650 cursor-pointer"
                        />
                        <label htmlFor="alertLeftBorderCheck" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer">Left accent border</label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Bg Style</label>
                        <CustomSelect
                          value={alertStyle.bgType}
                          onChange={(e) => updateProject(activeProjectId, {
                            alertStyle: { ...alertStyle, bgType: e.target.value }
                          })}
                          darkMode={darkMode}
                          options={[
                            { value: 'solid', label: 'Solid Color' },
                            { value: 'soft', label: 'Soft tint background' },
                            { value: 'glass', label: 'Glassmorphic' }
                          ]}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Corner Radius ({alertStyle.radius || 8}px)</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={alertStyle.radius || 8}
                          onChange={(e) => updateProject(activeProjectId, {
                            alertStyle: { ...alertStyle, radius: parseInt(e.target.value) }
                          })}
                          className="w-full accent-indigo-650"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Right Column: Previews and Code Exporters (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Showcases */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Buttons Showcase */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-404 dark:text-slate-505 uppercase tracking-widest block" style={getLabelStyle(activeProject)}>Buttons</label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="px-4 py-2 text-sm font-semibold rounded text-white shadow hover:opacity-90 cursor-pointer transition-all flex items-center space-x-1.5"
                            style={getButtonStyle(activeProject, 'primary')}
                          >
                            <span>Primary Brand</span>
                          </button>
                          <button
                            className="px-4 py-2 text-sm font-semibold rounded text-white shadow hover:opacity-90 cursor-pointer transition-all flex items-center space-x-1.5"
                            style={getButtonStyle(activeProject, 'secondary')}
                          >
                            <span>Secondary</span>
                          </button>
                          <button
                            className="px-4 py-2 text-sm font-semibold rounded cursor-pointer transition-all flex items-center space-x-1.5"
                            style={getButtonStyle(activeProject, 'outline')}
                          >
                            <span>Outline Accent</span>
                          </button>
                        </div>
                      </div>

                      {/* Badges Showcase */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-404 dark:text-slate-505 uppercase tracking-widest block" style={getLabelStyle(activeProject)}>Badges & Tags</label>
                        <div className="flex flex-wrap gap-2.5">
                          <span style={getBadgeStyle(activeProject, 'primary')}>
                            Primary Badge
                          </span>
                          <span style={getBadgeStyle(activeProject, 'success')}>
                            Success Status
                          </span>
                          <span style={getBadgeStyle(activeProject, 'error')}>
                            Error Status
                          </span>
                        </div>
                      </div>

                      {/* Input form mockup */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-404 dark:text-slate-505 uppercase tracking-widest block" style={getLabelStyle(activeProject)}>Form Input</label>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase" style={getLabelStyle(activeProject)}>Input Label</label>
                          <input
                            type="text"
                            placeholder="Type here..."
                            className="w-full text-sm py-2.5 px-3.5 focus:outline-none transition-all focus:ring-1"
                            style={{
                              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.3)' : '#ffffff',
                              border: `1.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1'}`,
                              color: darkMode ? '#ffffff' : '#1e293b',
                              borderRadius: `${activeProject.spacing?.borderRadius || 8}px`,
                              fontFamily: activeProject.typography?.bodyFont
                            }}
                          />
                        </div>
                      </div>

                      {/* Alert Showcase */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-404 dark:text-slate-505 uppercase tracking-widest block" style={getLabelStyle(activeProject)}>Notification Alert</label>
                        <div style={getAlertStyle(activeProject, 'primary')}>
                          <Info className="h-5 w-5 mt-0.5" style={{ color: activeProject.colors.primary, flexShrink: 0 }} />
                          <div>
                            <span className={`block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: activeProject.typography?.headingFont }}>Design System Synced</span>
                            <span className="block text-[11px] text-slate-400">All components updated in real-time.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exporters */}
                    <div className="pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Real-time Tokens & Exports</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className={`${cardClass} p-4`}>
                          <span className="text-[10px] font-bold text-indigo-505 dark:text-indigo-400 uppercase block mb-2">Tailwind CSS v4 Config</span>
                          <pre className="bg-slate-950 p-4 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-40">
{`@theme {
  --color-primary: ${activeProject.colors.primary};
  --color-secondary: ${activeProject.colors.secondary};
  --color-accent: ${activeProject.colors.accent};
  
  --font-heading: "${activeProject.typography.headingFont}", sans-serif;
  --font-body: "${activeProject.typography.bodyFont}", sans-serif;
  
  --radius-brand: ${activeProject.spacing.borderRadius}px;
  
  --btn-radius: ${btnStyle.radius}px;
  --btn-border: ${btnStyle.borderWidth}px;
  --btn-shadow: ${btnStyle.shadow};
}`}
                          </pre>
                        </Card>

                        <Card className={`${cardClass} p-4`}>
                          <span className="text-[10px] font-bold text-indigo-550 dark:text-indigo-400 uppercase block mb-2">CSS Variables</span>
                          <pre className="bg-slate-950 p-4 rounded-lg text-[10px] font-mono text-slate-350 overflow-x-auto max-h-40">
{`:root {
  --brand-primary: ${activeProject.colors.primary};
  --brand-secondary: ${activeProject.colors.secondary};
  --brand-accent: ${activeProject.colors.accent};
  --brand-radius: ${activeProject.spacing.borderRadius}px;
  --font-heading: '${activeProject.typography.headingFont}';
  --font-body: '${activeProject.typography.bodyFont}';
  --line-height-body: ${activeProject.typography.lineHeight || '1.5'};
  --letter-spacing: ${activeProject.typography.letterSpacing || '0px'};
}`}
                          </pre>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 7. LIVE PREVIEWS TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-8 animate-in fade-in duration-300 relative">
              {/* Background Aesthetic Glows */}
              <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-1000" style={{ backgroundColor: activeProject.colors.primary }} />
              <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: activeProject.colors.secondary || activeProject.colors.primary }} />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                <div>
                  <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Visual Previews</h3>
                  <p className={`text-xs ${cardDescClass}`}>See how the active brand kit renders on web, admin, and mobile screens.</p>
                </div>
              </div>

              {/* Glassmorphic Switcher Tab Bar */}
              <div className={`flex flex-col sm:flex-row items-center justify-between border p-3 rounded-2xl backdrop-blur-xl shadow-lg relative z-10 transition-all ${
                darkMode ? 'bg-slate-950/30 border-slate-800/60 shadow-black/30' : 'bg-white/70 border-slate-202/60 shadow-slate-200/20'
              }`}>
                <div className="flex items-center space-x-2.5 mb-3 sm:mb-0">
                  <span className="text-sm">👁️</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-305 tracking-wide uppercase">Mockup Sandbox Engine</span>
                </div>
                <div className="flex p-1 bg-black/20 dark:bg-black/45 backdrop-blur-lg rounded-xl border border-white/5 space-x-1">
                  <button
                    onClick={() => setPreviewType('landing')}
                    className={`text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer focus:outline-none ${
                      previewType === 'landing' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] scale-102' 
                        : 'text-slate-405 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Landing Page
                  </button>
                  <button
                    onClick={() => setPreviewType('dashboard')}
                    className={`text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer focus:outline-none ${
                      previewType === 'dashboard' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] scale-102' 
                        : 'text-slate-405 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    SaaS Dashboard
                  </button>
                  <button
                    onClick={() => setPreviewType('mobile')}
                    className={`text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer focus:outline-none ${
                      previewType === 'mobile' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] scale-102' 
                        : 'text-slate-405 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Mobile Viewport
                  </button>
                </div>
              </div>

              {/* MOCKUP DISPLAY WINDOW */}
              <div className="relative z-10">
                {(previewType === 'landing' || previewType === 'dashboard') ? (
                  /* Premium Frosted Browser Frame */
                  <div className={`border rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all ${
                    darkMode ? 'bg-slate-950/45 border-slate-800/60 shadow-black/80' : 'bg-white/60 border-slate-202/80 shadow-slate-300/40'
                  }`}>
                    {/* Browser Chrome Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 dark:border-slate-800/40 bg-slate-900/10 dark:bg-slate-900/40 backdrop-blur-md">
                      <div className="flex space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] block" />
                      </div>
                      <div className="px-4 py-1.5 rounded-lg bg-black/10 dark:bg-black/30 border border-white/5 dark:border-slate-800/20 text-[10px] text-slate-405 truncate w-1/3 md:w-1/2 text-center select-none font-mono">
                        https://{activeProject.name.toLowerCase().replace(/\s+/g, '')}.com/preview
                      </div>
                      <div className="flex items-center space-x-2 text-[9px] text-emerald-400 font-bold tracking-wider uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Live Synced</span>
                      </div>
                    </div>

                    {/* Preview Viewport */}
                    <div className="p-1">
                {/* 1. LANDING PAGE PREVIEW */}
                {previewType === 'landing' && (() => {
                  const scrollPreviewSection = (id) => {
                    const container = document.getElementById('landing-preview-container');
                    const target = document.getElementById(`landing-preview-${id}`);
                    if (container && target) {
                      container.scrollTo({
                        top: target.offsetTop - container.offsetTop - 12,
                        behavior: 'smooth'
                      });
                    }
                  };
                  return (
                    <div
                      id="landing-preview-container"
                      className="w-full flex flex-col text-left max-h-[550px] overflow-y-auto scroll-smooth"
                      style={{
                        backgroundColor: activeProject.colors.background,
                        color: activeProject.colors.text,
                        fontFamily: activeProject.typography.bodyFont
                      }}
                    >
                      {/* Floating Premium Nav */}
                      <div className="sticky top-0 px-4 py-4 md:px-8 z-30 backdrop-blur-md" style={{ backgroundColor: `${activeProject.colors.background}dd` }}>
                        <div className="flex items-center justify-between p-3 rounded-2xl border" style={{ backgroundColor: `${activeProject.colors.surface}aa`, borderColor: `${activeProject.colors.text}10` }}>
                          <div className="flex items-center space-x-2">
                            {renderBrandIcon(activeProject, 'w-8 h-8 text-sm')}
                            <span
                              className="font-black tracking-wider text-sm md:text-base"
                              style={{ fontFamily: activeProject.typography.headingFont, color: activeProject.colors.text }}
                            >
                              {activeProject.logo || activeProject.name}
                            </span>
                          </div>
                          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold opacity-80">
                            <button onClick={() => scrollPreviewSection('features')} className="hover:opacity-100 hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none">Features</button>
                            <button onClick={() => scrollPreviewSection('showcase')} className="hover:opacity-100 hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none">Showcase</button>
                            <button onClick={() => scrollPreviewSection('pricing')} className="hover:opacity-100 hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none">Pricing</button>
                            <button onClick={() => scrollPreviewSection('about')} className="hover:opacity-100 hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none">About</button>
                          </div>
                          <div>
                            <button
                              className="px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer hover:scale-102 active:scale-98 transition-all"
                              style={getButtonStyle(activeProject, 'primary')}
                            >
                              Get Started
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hero Section */}
                      <div id="landing-preview-hero" className="px-4 py-12 md:px-8 md:py-16 text-center max-w-3xl mx-auto space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase mx-auto" style={{ backgroundColor: `${activeProject.colors.primary}10`, borderColor: `${activeProject.colors.primary}30`, color: activeProject.colors.primary }}>
                          <span>✨ New Launch</span>
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: activeProject.colors.primary }} />
                          <span>Brand system verified</span>
                        </div>

                        <h1
                          className="text-3xl md:text-5xl font-black leading-tight tracking-tight max-w-2xl mx-auto"
                          style={{ fontFamily: activeProject.typography.headingFont, color: activeProject.colors.text }}
                        >
                          {activeProject.tagline || 'Elevate Your Digital Brand Experience'}
                        </h1>

                        <p className="text-xs md:text-sm opacity-75 max-w-xl mx-auto leading-relaxed">
                          {activeProject.description || 'Powering high-growth digital companies with beautiful visual assets, unified design standards, and premium component guides.'}
                        </p>

                        <div className="flex items-center justify-center space-x-3 pt-2">
                          <button
                            className="px-5 py-2.5 text-xs font-bold text-white cursor-pointer hover:scale-102 active:scale-98 transition-all"
                            style={getButtonStyle(activeProject, 'primary')}
                          >
                            Explore Brand Kits
                          </button>
                          <button
                            className="px-5 py-2.5 text-xs font-bold cursor-pointer hover:bg-white/10 transition-all border"
                            style={getButtonStyle(activeProject, 'outline')}
                          >
                            Learn More
                          </button>
                        </div>
                      </div>

                      {/* Brand Tokens Live Showcase Banner */}
                      <div id="landing-preview-showcase" className="px-4 md:px-8 py-8 border-t" style={{ borderColor: `${activeProject.colors.text}08` }}>
                        <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${activeProject.colors.text}10` }}>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-60 animate-pulse" style={getLabelStyle(activeProject)}>Live Brand Identity Preview</span>
                            <div className="flex space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            {/* Palette Swatches */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold opacity-60 uppercase" style={getLabelStyle(activeProject)}>Color Palettes</span>
                              <div className="flex space-x-2">
                                <div className="flex-1 text-center p-3 rounded-lg border transition-transform hover:scale-105" style={{ backgroundColor: activeProject.colors.primary, borderColor: `${activeProject.colors.text}10` }}>
                                  <span className="block text-[8px] font-black text-white bg-black/35 px-1 py-0.5 rounded truncate">Primary</span>
                                </div>
                                <div className="flex-1 text-center p-3 rounded-lg border transition-transform hover:scale-105" style={{ backgroundColor: activeProject.colors.secondary, borderColor: `${activeProject.colors.text}10` }}>
                                  <span className="block text-[8px] font-black text-white bg-black/35 px-1 py-0.5 rounded truncate">Secondary</span>
                                </div>
                                <div className="flex-1 text-center p-3 rounded-lg border transition-transform hover:scale-105" style={{ backgroundColor: activeProject.colors.accent, borderColor: `${activeProject.colors.text}10` }}>
                                  <span className="block text-[8px] font-black text-white bg-black/35 px-1 py-0.5 rounded truncate">Accent</span>
                                </div>
                              </div>
                            </div>

                            {/* Button Typography specimens */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold opacity-60 uppercase" style={getLabelStyle(activeProject)}>Typography Tokens</span>
                              <div className="p-3 rounded-lg border space-y-1.5" style={{ backgroundColor: `${activeProject.colors.background}50`, borderColor: `${activeProject.colors.text}10` }}>
                                <div className="text-xs truncate font-bold" style={{ fontFamily: activeProject.typography.headingFont }}>
                                  Heading: {activeProject.typography.headingFont}
                                </div>
                                <div className="text-[10px] truncate opacity-80" style={{ fontFamily: activeProject.typography.bodyFont }}>
                                  Body: {activeProject.typography.bodyFont}
                                </div>
                              </div>
                            </div>

                            {/* Components specimen */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold opacity-60 uppercase" style={getLabelStyle(activeProject)}>Standard Badges</span>
                              <div className="flex flex-wrap gap-2 items-center p-2.5 rounded-lg border h-[52px]" style={{ backgroundColor: `${activeProject.colors.background}50`, borderColor: `${activeProject.colors.text}10` }}>
                                <span style={getBadgeStyle(activeProject, 'primary')}>Primary Spec</span>
                                <span style={getBadgeStyle(activeProject, 'secondary')}>Secondary Spec</span>
                                <span style={getBadgeStyle(activeProject, 'accent')}>Accent Spec</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Features Section */}
                      <div id="landing-preview-features" className="px-4 py-12 md:px-8 md:py-16 space-y-8 text-center max-w-5xl mx-auto border-t" style={{ borderColor: `${activeProject.colors.text}08` }}>
                        <div className="space-y-2">
                          <span className="text-xs font-bold" style={{ color: activeProject.colors.primary, ...getLabelStyle(activeProject) }}>Integrated Features</span>
                          <h2 className="text-xl md:text-3xl font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>Engineered for Consistency</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                          {/* Card 1 */}
                          <div className="p-5 border rounded-2xl space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: activeProject.colors.primary }}>
                              <span className="text-sm">🎨</span>
                            </div>
                            <h4 className="text-sm font-bold" style={{ fontFamily: activeProject.typography.headingFont }}>Color Harmonization</h4>
                            <p className="text-[11px] opacity-75 leading-relaxed">
                              Every component dynamically propagates the brand's primary, secondary, and accent colors automatically.
                            </p>
                          </div>
                          {/* Card 2 */}
                          <div className="p-5 border rounded-2xl space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: activeProject.colors.secondary }}>
                              <span className="text-sm">✍</span>
                            </div>
                            <h4 className="text-sm font-bold" style={{ fontFamily: activeProject.typography.headingFont }}>Typography Scales</h4>
                            <p className="text-[11px] opacity-75 leading-relaxed">
                              Google Web Fonts compile dynamically with custom weight scales to present visual consistency across pages.
                            </p>
                          </div>
                          {/* Card 3 */}
                          <div className="p-5 border rounded-2xl space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: activeProject.colors.accent }}>
                              <span className="text-sm">⚙</span>
                            </div>
                            <h4 className="text-sm font-bold" style={{ fontFamily: activeProject.typography.headingFont }}>Grid Configurations</h4>
                            <p className="text-[11px] opacity-75 leading-relaxed">
                              Tailored border-radius, shadows, and grid padding tokens align buttons, badges, and boxes identically.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div id="landing-preview-pricing" className="px-4 py-12 md:px-8 md:py-16 bg-black/5 dark:bg-white/5 border-t" style={{ borderColor: `${activeProject.colors.text}08` }}>
                        <div className="max-w-4xl mx-auto space-y-8 text-center">
                          <div className="space-y-2">
                            <span className="text-xs font-bold" style={{ color: activeProject.colors.primary, ...getLabelStyle(activeProject) }}>Subscription Tiers</span>
                            <h2 className="text-xl md:text-3xl font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>Predictable Pricing Plans</h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
                            {/* Basic Plan */}
                            <div className="p-6 border rounded-2xl flex flex-col justify-between" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="space-y-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={getLabelStyle(activeProject)}>Basic</span>
                                <div className="text-2xl font-black" style={{ fontFamily: activeProject.typography.headingFont }}>Free</div>
                                <p className="text-[10px] opacity-75">Perfect for personal portfolios and draft design models.</p>
                                <ul className="text-[10px] space-y-2 pt-2 opacity-80">
                                  <li>✓ 1 Active Workspace</li>
                                  <li>✓ Core Presets Enabled</li>
                                  <li>✓ Export Specifications</li>
                                </ul>
                              </div>
                              <div className="flex justify-center mt-6">
                                <button className="px-6 py-2 text-[10px] font-bold border hover:bg-white/5 transition-colors cursor-pointer w-auto" style={getButtonStyle(activeProject, 'outline')}>
                                  Get Started
                                </button>
                              </div>
                            </div>

                            {/* Pro Plan */}
                            <div className="p-6 border rounded-2xl flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: activeProject.colors.surface, borderColor: activeProject.colors.primary, borderWidth: '2px' }}>
                              <div className="absolute top-0 right-0" style={{ transform: 'translate(25%, 25%) rotate(45deg)' }}>
                                <span className="text-[8px] font-black uppercase text-white px-8 py-1 tracking-wider" style={{ backgroundColor: activeProject.colors.primary }}>POPULAR</span>
                              </div>
                              <div className="space-y-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: activeProject.colors.primary, ...getLabelStyle(activeProject) }}>Professional</span>
                                <div className="text-2xl font-black" style={{ fontFamily: activeProject.typography.headingFont }}>$29<span className="text-xs opacity-60 font-medium">/mo</span></div>
                                <p className="text-[10px] opacity-75">Ideal for startup founders and growing agency design teams.</p>
                                <ul className="text-[10px] space-y-2 pt-2 opacity-80">
                                  <li>✓ Unlimited Custom Brand Kits</li>
                                  <li>✓ Full AI Generator Access</li>
                                  <li>✓ High-fidelity PDF Guidelines</li>
                                  <li>✓ Priority Technical Audits</li>
                                </ul>
                              </div>
                              <div className="flex justify-center mt-6">
                                <button className="px-6 py-2 text-[10px] font-bold text-white transition-all hover:scale-102 cursor-pointer w-auto" style={getButtonStyle(activeProject, 'primary')}>
                                  Upgrade to Pro
                                </button>
                              </div>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="p-6 border rounded-2xl flex flex-col justify-between" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="space-y-3">
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={getLabelStyle(activeProject)}>Enterprise</span>
                                <div className="text-2xl font-black" style={{ fontFamily: activeProject.typography.headingFont }}>Custom</div>
                                <p className="text-[10px] opacity-75">Configured specifically for large corporate systems.</p>
                                <ul className="text-[10px] space-y-2 pt-2 opacity-80">
                                  <li>✓ Dedicated Design Specialist</li>
                                  <li>✓ SLA Service Contracts</li>
                                  <li>✓ Custom Tailwind Compilation</li>
                                  <li>✓ Unlimited Team Seats</li>
                                </ul>
                              </div>
                              <div className="flex justify-center mt-6">
                                <button className="px-6 py-2 text-[10px] font-bold text-white transition-all hover:scale-102 cursor-pointer w-auto" style={getButtonStyle(activeProject, 'secondary')}>
                                  Contact Sales
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* About Section */}
                      <div id="landing-preview-about" className="px-4 py-12 md:px-8 md:py-16 max-w-4xl mx-auto border-t space-y-6" style={{ borderColor: `${activeProject.colors.text}08` }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeProject.colors.primary, ...getLabelStyle(activeProject) }}>About {activeProject.name}</span>
                            <h3 className="text-2xl font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>Empowering Brand Excellence</h3>
                            <p className="text-xs opacity-75 leading-relaxed">
                              We build frameworks that unite designers, developers, and product owners under a single source of brand truth. We believe beautiful design systems should be intuitive to scale, compile instantly, and remain perfectly compliant with WCAG accessibility guidelines.
                            </p>
                          </div>
                          <div className="p-6 rounded-2xl border flex flex-col justify-center space-y-4" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🌱</span>
                              <div>
                                <span className="block text-xs font-bold">100% Sustainable</span>
                                <span className="block text-[10px] opacity-60">Digital-first assets optimized for low carbon loads.</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">⚡</span>
                              <div>
                                <span className="block text-xs font-bold">Sub-millisecond Compilation</span>
                                <span className="block text-[10px] opacity-60">Optimized asset delivery pipeline via edge CDNs.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-8 md:px-8 border-t text-[10px] opacity-60 flex items-center justify-between" style={{ borderColor: `${activeProject.colors.text}10` }}>
                        <span>© {new Date().getFullYear()} {activeProject.name}. All rights reserved.</span>
                        <div className="flex space-x-4">
                          <span>Terms</span>
                          <span>Privacy</span>
                          <span>Cookies</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. SAAS DASHBOARD PREVIEW */}
                {previewType === 'dashboard' && (
                  <div
                    className="w-full flex flex-col sm:flex-row min-h-135 text-left animate-in fade-in duration-200"
                    style={{
                      backgroundColor: activeProject.colors.background,
                      color: activeProject.colors.text,
                      fontFamily: activeProject.typography.bodyFont
                    }}
                  >
                    {/* Left Sidebar */}
                    <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r p-4 space-y-6 flex flex-col justify-between shrink-0" style={{ borderColor: `${activeProject.colors.text}10` }}>
                      <div className="space-y-6">
                        {/* Logo header */}
                        <div className="flex items-center space-x-2">
                          {renderBrandIcon(activeProject, 'w-7 h-7 text-xs')}
                          <span
                            className="font-bold text-sm tracking-wider block"
                            style={{ fontFamily: activeProject.typography.headingFont, color: activeProject.colors.text }}
                          >
                            {activeProject.logo || activeProject.name}
                          </span>
                        </div>

                        {/* Navigation links */}
                        <div className="flex sm:flex-col space-x-4 sm:space-x-0 sm:space-y-1.5 text-[10px] sm:text-xs">
                          <button
                            onClick={() => setDashboardTab('dashboard')}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold transition-all text-left cursor-pointer focus:outline-none"
                            style={dashboardTab === 'dashboard' ? { backgroundColor: `${activeProject.colors.primary}15`, color: activeProject.colors.primary } : { opacity: 0.6 }}
                          >
                            <span>📊</span>
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={() => setDashboardTab('analytics')}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold transition-all text-left cursor-pointer focus:outline-none"
                            style={dashboardTab === 'analytics' ? { backgroundColor: `${activeProject.colors.primary}15`, color: activeProject.colors.primary } : { opacity: 0.6 }}
                          >
                            <span>📈</span>
                            <span>Analytics</span>
                          </button>
                          <button
                            onClick={() => setDashboardTab('team')}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold transition-all text-left cursor-pointer focus:outline-none"
                            style={dashboardTab === 'team' ? { backgroundColor: `${activeProject.colors.primary}15`, color: activeProject.colors.primary } : { opacity: 0.6 }}
                          >
                            <span>👥</span>
                            <span>Team Members</span>
                          </button>
                          <button
                            onClick={() => setDashboardTab('settings')}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg font-bold transition-all text-left cursor-pointer focus:outline-none"
                            style={dashboardTab === 'settings' ? { backgroundColor: `${activeProject.colors.primary}15`, color: activeProject.colors.primary } : { opacity: 0.6 }}
                          >
                            <span>⚙</span>
                            <span>Settings</span>
                          </button>
                        </div>
                      </div>

                      {/* User panel */}
                      <div className="hidden sm:flex items-center space-x-2 pt-4 border-t" style={{ borderColor: `${activeProject.colors.text}10` }}>
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase shrink-0" style={{ backgroundColor: activeProject.colors.primary }}>
                          {(user?.name || 'A').substring(0, 2)}
                        </div>
                        <div className="text-[10px] truncate flex-1 text-left">
                          <span className="block font-bold truncate">{user?.name || 'Amols'}</span>
                          <span className="block opacity-50 truncate text-[8px]">{user?.email || 'user@example.com'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Main panel */}
                    <div className="flex-1 p-4 md:p-6 space-y-6 flex flex-col justify-between">
                      {/* Top bar */}
                      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${activeProject.colors.text}10` }}>
                        <div className="flex items-center space-x-2 text-xs opacity-75">
                          <span className="opacity-50">Pages</span>
                          <span>/</span>
                          <span className="font-semibold capitalize" style={{ color: activeProject.colors.text }}>{dashboardTab === 'dashboard' ? 'Overview' : dashboardTab}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="relative hidden md:block">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="px-3 py-1 text-[10px] rounded-lg border w-40 bg-transparent focus:outline-none"
                              style={{ borderColor: `${activeProject.colors.text}15`, color: activeProject.colors.text }}
                            />
                          </div>
                          <span
                            className="text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm shrink-0"
                            style={{ backgroundColor: `${activeProject.colors.primary}20`, color: activeProject.colors.primary }}
                          >
                            Online Simulator
                          </span>
                        </div>
                      </div>

                      {/* SUB-PAGES RENDER */}
                      {dashboardTab === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          {/* Stat Metrics Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Monthly Revenue</span>
                                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">+14.2%</span>
                              </div>
                              <div className="flex items-end justify-between pt-1">
                                <span className="text-xl font-extrabold" style={{ color: activeProject.colors.text }}>$48,259.00</span>
                                {/* SVG sparkline */}
                                <svg className="w-16 h-7 text-emerald-500" viewBox="0 0 100 30" fill="none">
                                  <path d="M0 25 L20 20 L40 22 L60 10 L80 15 L100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>

                            {/* Card 2 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Active Customers</span>
                                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">+8.6%</span>
                              </div>
                              <div className="flex items-end justify-between pt-1">
                                <span className="text-xl font-extrabold" style={{ color: activeProject.colors.text }}>1,842</span>
                                {/* SVG sparkline */}
                                <svg className="w-16 h-7 text-emerald-500" viewBox="0 0 100 30" fill="none">
                                  <path d="M0 28 L20 22 L40 15 L60 18 L80 8 L100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>

                            {/* Card 3 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Brand System Health</span>
                                <span style={getBadgeStyle(activeProject, 'accent')}>Optimal</span>
                              </div>
                              <div className="flex items-end justify-between pt-1">
                                <span className="text-xl font-extrabold" style={{ color: activeProject.colors.text }}>98% Compliance</span>
                                {/* SVG sparkline */}
                                <svg className="w-16 h-7" style={{ color: activeProject.colors.primary }} viewBox="0 0 100 30" fill="none">
                                  <path d="M0 10 L20 12 L40 8 L60 9 L80 5 L100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Main Chart Area */}
                          <div
                            className="p-4 border flex flex-col justify-between space-y-4"
                            style={{
                              backgroundColor: activeProject.colors.surface,
                              borderColor: `${activeProject.colors.text}10`,
                              borderRadius: `${activeProject.spacing.borderRadius}px`
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Data Analytics Stream</span>
                                <h5 className="text-xs font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>User Activity & Operations</h5>
                              </div>
                              <div className="flex items-center space-x-2 text-[8px] md:text-[9px]">
                                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeProject.colors.primary }} />
                                <span>This Period</span>
                                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeProject.colors.secondary }} />
                                <span>Prior Period</span>
                              </div>
                            </div>

                            {/* Real-looking SVG Area Chart */}
                            <div className="relative h-40 w-full flex items-end">
                              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
                                {/* Gridlines */}
                                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />
                                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />
                                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />
                                <line x1="125" y1="0" x2="125" y2="150" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />
                                <line x1="250" y1="0" x2="250" y2="150" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />
                                <line x1="375" y1="0" x2="375" y2="150" stroke="rgba(128, 128, 128, 0.08)" strokeDasharray="3,3" />

                                {/* Gradients */}
                                <defs>
                                  <linearGradient id="gradient-primary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={activeProject.colors.primary} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={activeProject.colors.primary} stopOpacity="0.0" />
                                  </linearGradient>
                                  <linearGradient id="gradient-secondary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={activeProject.colors.secondary || activeProject.colors.primary} stopOpacity="0.15" />
                                    <stop offset="100%" stopColor={activeProject.colors.secondary || activeProject.colors.primary} stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>

                                {/* Prior Period Area */}
                                <path d="M0 120 Q 125 100, 250 110 T 500 80 L 500 150 L 0 150 Z" fill="url(#gradient-secondary)" />
                                <path d="M0 120 Q 125 100, 250 110 T 500 80" stroke={activeProject.colors.secondary || activeProject.colors.primary} strokeWidth="1.5" fill="none" strokeDasharray="3,3" />

                                {/* This Period Area */}
                                <path d="M0 130 Q 125 90, 250 50 T 500 30 L 500 150 L 0 150 Z" fill="url(#gradient-primary)" />
                                <path d="M0 130 Q 125 90, 250 50 T 500 30" stroke={activeProject.colors.primary} strokeWidth="3" fill="none" />

                                {/* Highlight Point */}
                                <circle cx="250" cy="50" r="5" fill={activeProject.colors.primary} stroke="#ffffff" strokeWidth="1.5" />
                                <line x1="250" y1="50" x2="250" y2="150" stroke={activeProject.colors.primary} strokeWidth="1" strokeDasharray="2,2" />
                              </svg>

                              {/* Hover tooltip representation */}
                              <div
                                className="absolute bg-slate-900 text-white text-[8px] p-1.5 rounded border border-slate-800 shadow-lg text-left"
                                style={{ left: '260px', top: '15px' }}
                              >
                                <span className="block font-bold">Tuesday Peak</span>
                                <span className="block" style={{ color: activeProject.colors.primary }}>$1,290.40</span>
                              </div>
                            </div>

                            {/* X-Axis labels */}
                            <div className="flex justify-between text-[8px] opacity-60 px-1">
                              <span>Mon</span>
                              <span>Tue</span>
                              <span>Wed</span>
                              <span>Thu</span>
                              <span>Fri</span>
                              <span>Sat</span>
                              <span>Sun</span>
                            </div>
                          </div>

                          {/* Recent Activities List */}
                          <div
                            className="p-4 border space-y-3"
                            style={{
                              backgroundColor: activeProject.colors.surface,
                              borderColor: `${activeProject.colors.text}10`,
                              borderRadius: `${activeProject.spacing.borderRadius}px`
                            }}
                          >
                            <span className="text-[10px] opacity-60 uppercase font-bold block text-left" style={getLabelStyle(activeProject)}>Recent Operations Logs</span>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] border-b pb-2" style={{ borderColor: `${activeProject.colors.text}08` }}>
                                <div className="flex items-center space-x-2 truncate">
                                  <span className="text-xs">🔑</span>
                                  <span className="font-semibold truncate">User Auth API generated</span>
                                </div>
                                <span style={getBadgeStyle(activeProject, 'primary')}>Success</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] border-b pb-2" style={{ borderColor: `${activeProject.colors.text}08` }}>
                                <div className="flex items-center space-x-2 truncate">
                                  <span className="text-xs">📂</span>
                                  <span className="font-semibold truncate">Vite Environment initialized</span>
                                </div>
                                <span style={getBadgeStyle(activeProject, 'secondary')}>Complete</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]" style={{ borderColor: `${activeProject.colors.text}08` }}>
                                <div className="flex items-center space-x-2 truncate">
                                  <span className="text-xs">📝</span>
                                  <span className="font-semibold truncate">Tailwind compilation synced</span>
                                </div>
                                <span style={getBadgeStyle(activeProject, 'accent')}>Active</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {dashboardTab === 'analytics' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          {/* Stat Metrics Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div>
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Conversion Rate</span>
                                <span className="block text-xl font-extrabold pt-1">3.48%</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded self-start">+0.4% MoM</span>
                            </div>

                            {/* Card 2 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div>
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Bounce Rate</span>
                                <span className="block text-xl font-extrabold pt-1">41.2%</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded self-start">-2.1% MoM</span>
                            </div>

                            {/* Card 3 */}
                            <div
                              className="p-4 border flex flex-col justify-between space-y-3"
                              style={{
                                backgroundColor: activeProject.colors.surface,
                                borderColor: `${activeProject.colors.text}10`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div>
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Session Duration</span>
                                <span className="block text-xl font-extrabold pt-1">4m 12s</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded self-start">+12s Avg</span>
                            </div>
                          </div>

                          {/* SVG Bar Chart for Traffic */}
                          <div
                            className="p-4 border space-y-4"
                            style={{
                              backgroundColor: activeProject.colors.surface,
                              borderColor: `${activeProject.colors.text}10`,
                              borderRadius: `${activeProject.spacing.borderRadius}px`
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] opacity-60 uppercase font-bold" style={getLabelStyle(activeProject)}>Traffic Metrics</span>
                                <h5 className="text-xs font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>Monthly Traffic Distribution</h5>
                              </div>
                              <span style={getBadgeStyle(activeProject, 'primary')}>Pageviews</span>
                            </div>

                            <div className="relative h-40 w-full flex items-end justify-between pt-4 px-2">
                              {/* Y Axis line mock */}
                              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-800" />
                              {/* Horizontal lines */}
                              <div className="absolute left-0 right-0 top-10 border-b border-slate-800/40 border-dashed" />
                              <div className="absolute left-0 right-0 top-20 border-b border-slate-800/40 border-dashed" />
                              <div className="absolute left-0 right-0 top-30 border-b border-slate-800/40 border-dashed" />

                              {/* Bars */}
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm" style={{ height: '55px', backgroundColor: activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">Jan</span>
                              </div>
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm animate-pulse" style={{ height: '95px', backgroundColor: activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">Feb</span>
                              </div>
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm" style={{ height: '70px', backgroundColor: activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">Mar</span>
                              </div>
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm animate-pulse" style={{ height: '115px', backgroundColor: activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">Apr</span>
                              </div>
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm" style={{ height: '85px', backgroundColor: activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">May</span>
                              </div>
                              <div className="flex-1 flex flex-col items-center space-y-1">
                                <div className="w-6 md:w-8 rounded-t-sm animate-pulse" style={{ height: '130px', backgroundColor: activeProject.colors.secondary || activeProject.colors.primary }} />
                                <span className="text-[8px] opacity-60">Jun</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {dashboardTab === 'team' && (
                        <div className="space-y-6 animate-in fade-in duration-200 text-left">
                          <div>
                            <h5 className="text-sm font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>Brand & Design Team</h5>
                            <p className="text-[10px] opacity-60">Contributors and editors managing visual design standards.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Member 1 */}
                            <div className="p-4 border rounded-xl flex items-center space-x-3" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase shrink-0" style={{ backgroundColor: activeProject.colors.primary }}>
                                ER
                              </div>
                              <div className="truncate flex-1">
                                <span className="block text-xs font-bold truncate">Elena Rostova</span>
                                <span className="block text-[9px] opacity-60 truncate">Chief Creative Officer</span>
                                <span className="block text-[8px] opacity-40 truncate">elena@company.com</span>
                              </div>
                              <span style={getBadgeStyle(activeProject, 'primary')} className="!text-[8px]">Active</span>
                            </div>

                            {/* Member 2 */}
                            <div className="p-4 border rounded-xl flex items-center space-x-3" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase shrink-0" style={{ backgroundColor: activeProject.colors.secondary }}>
                                MV
                              </div>
                              <div className="truncate flex-1">
                                <span className="block text-xs font-bold truncate">Marcus Vance</span>
                                <span className="block text-[9px] opacity-60 truncate">Typography Architect</span>
                                <span className="block text-[8px] opacity-40 truncate">marcus@company.com</span>
                              </div>
                              <span style={getBadgeStyle(activeProject, 'secondary')} className="!text-[8px]">Away</span>
                            </div>

                            {/* Member 3 */}
                            <div className="p-4 border rounded-xl flex items-center space-x-3" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase shrink-0" style={{ backgroundColor: activeProject.colors.accent }}>
                                SJ
                              </div>
                              <div className="truncate flex-1">
                                <span className="block text-xs font-bold truncate">Sarah Jenkins</span>
                                <span className="block text-[9px] opacity-60 truncate">Senior Visual Designer</span>
                                <span className="block text-[8px] opacity-40 truncate">sarah@company.com</span>
                              </div>
                              <span style={getBadgeStyle(activeProject, 'primary')} className="!text-[8px]">Active</span>
                            </div>

                            {/* Member 4 */}
                            <div className="p-4 border rounded-xl flex items-center space-x-3" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                              <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase shrink-0" style={{ backgroundColor: activeProject.colors.primary }}>
                                AD
                              </div>
                              <div className="truncate flex-1">
                                <span className="block text-xs font-bold truncate">{user?.name || 'Amols Dev'}</span>
                                <span className="block text-[9px] opacity-60 truncate">Lead Developer</span>
                                <span className="block text-[8px] opacity-40 truncate">{user?.email || 'amols@company.com'}</span>
                              </div>
                              <span style={getBadgeStyle(activeProject, 'primary')} className="!text-[8px]">Active</span>
                            </div>
                          </div>

                          <button
                            className="px-4 py-2 text-xs font-bold text-white hover:scale-102 active:scale-98 transition-all cursor-pointer"
                            style={getButtonStyle(activeProject, 'primary')}
                          >
                            + Invite Team Member
                          </button>
                        </div>
                      )}

                      {dashboardTab === 'settings' && (
                        <div className="space-y-6 animate-in fade-in duration-200 text-left">
                          <div>
                            <h5 className="text-sm font-extrabold" style={{ fontFamily: activeProject.typography.headingFont }}>System Settings</h5>
                            <p className="text-[10px] opacity-60">Manage visual output compiler preferences.</p>
                          </div>

                          <div className="space-y-4 max-w-md">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase opacity-65 tracking-wider block" style={getLabelStyle(activeProject)}>Company Name</label>
                              <input
                                type="text"
                                defaultValue={activeProject.name}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border bg-transparent outline-none"
                                style={{ borderColor: `${activeProject.colors.text}15`, fontFamily: activeProject.typography.bodyFont }}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase opacity-65 tracking-wider block" style={getLabelStyle(activeProject)}>Domain URL</label>
                              <input
                                type="text"
                                defaultValue={activeProject.website || 'activeproject.com'}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border bg-transparent outline-none"
                                style={{ borderColor: `${activeProject.colors.text}15`, fontFamily: activeProject.typography.bodyFont }}
                              />
                            </div>

                            <div className="space-y-1 pt-2">
                              <span className="text-[9px] font-bold uppercase opacity-65 tracking-wider block mb-2" style={getLabelStyle(activeProject)}>Compiler Parameters</span>
                              <div className="flex items-center justify-between p-2.5 rounded-lg border" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">Real-time compilation</span>
                                  <span className="text-[8px] opacity-50">Sync UI instantly with CSS tokens.</span>
                                </div>
                                <div className="w-8 h-4 rounded-full p-0.5 cursor-pointer flex items-center justify-end" style={{ backgroundColor: activeProject.colors.primary }}>
                                  <div className="w-3 h-3 rounded-full bg-white" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-2.5 rounded-lg border mt-2" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}10` }}>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">CSS Minification</span>
                                  <span className="text-[8px] opacity-50">Compress exported styles bundle.</span>
                                </div>
                                <div className="w-8 h-4 rounded-full p-0.5 cursor-pointer flex items-center justify-end" style={{ backgroundColor: activeProject.colors.secondary || activeProject.colors.primary }}>
                                  <div className="w-3 h-3 rounded-full bg-white" />
                                </div>
                              </div>
                            </div>

                            <button
                              className="px-5 py-2 text-xs font-bold text-white hover:scale-102 active:scale-98 transition-all cursor-pointer mt-2"
                              style={getButtonStyle(activeProject, 'primary')}
                            >
                              Save Configurations
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
                  <div className="w-full flex items-center justify-center p-4 md:p-8 bg-slate-955 animate-in fade-in duration-200 relative overflow-hidden rounded-3xl border border-slate-800/40 backdrop-blur-xl">
                    {/* Specs badge */}
                    <div className="absolute top-4 left-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 px-2 py-0.5 rounded border border-white/5 select-none z-20">
                      Mobile Chassis Simulator
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 select-none z-20">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      <span>Ready</span>
                    </div>

                    {/* Smartphone Chassis Frame */}
                    <div
                      className="w-58 h-100 md:w-66 md:h-115 border-8 border-slate-900 rounded-[36px] overflow-hidden flex flex-col justify-between shadow-2xl relative text-left"
                      style={{
                        backgroundColor: activeProject.colors.background,
                        color: activeProject.colors.text,
                        fontFamily: activeProject.typography.bodyFont
                      }}
                    >
                      {/* Notch & Camera Element */}
                      <div className="absolute top-0 inset-x-0 flex justify-center z-25">
                        <div className="bg-slate-900 h-4 w-28 rounded-b-xl flex items-center justify-center space-x-2">
                          {/* Speaker line */}
                          <div className="w-8 h-1 bg-slate-800 rounded-full" />
                          {/* Camera circle */}
                          <div className="w-2 h-2 bg-slate-900 rounded-full border border-slate-700/50" />
                        </div>
                      </div>

                      {/* Status bar */}
                      <div className="pt-5 px-5 flex items-center justify-between text-[8px] font-bold z-20 opacity-75">
                        <span>9:41</span>
                        <div className="flex items-center space-x-1">
                          {/* Signal strength bars */}
                          <svg className="w-2.5 h-2" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="10" y="70" width="15" height="30" />
                            <rect x="30" y="50" width="15" height="50" />
                            <rect x="50" y="30" width="15" height="70" />
                            <rect x="70" y="10" width="15" height="90" />
                          </svg>
                          {/* Wifi */}
                          <span>📶</span>
                          {/* Battery */}
                          <span className="text-[10px]">🔋</span>
                        </div>
                      </div>

                      {/* Mobile App Header */}
                      <div className="pt-2 px-4 pb-2 flex items-center justify-between border-b" style={{ borderColor: `${activeProject.colors.text}10` }}>
                        <div className="flex items-center space-x-1.5">
                          {renderBrandIcon(activeProject, 'w-5 h-5 text-[9px]')}
                          <span className="text-[10px] md:text-xs font-bold" style={{ fontFamily: activeProject.typography.headingFont }}>
                            {activeProject.logo || activeProject.name}
                          </span>
                        </div>
                        <span className="text-xs">🔔</span>
                      </div>

                      {/* Mobile Body Content (Scrollable Container Simulation) */}
                      <div className="px-4 py-2 space-y-4 flex-1 overflow-y-auto scrollbar-none text-left">
                        {mobileTab === 'home' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Welcome Hero Card with Brand Gradient */}
                            <div
                              className="p-4 rounded-xl text-white space-y-2 relative overflow-hidden"
                              style={{
                                backgroundImage: `linear-gradient(135deg, ${activeProject.colors.primary}, ${activeProject.colors.secondary || activeProject.colors.primary})`,
                                borderRadius: `${activeProject.spacing.borderRadius}px`
                              }}
                            >
                              <div className="absolute -right-3 -bottom-3 opacity-10 text-4xl font-bold font-mono">
                                {activeProject.name.substring(0, 1)}
                              </div>
                              <span className="text-[7px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">Brand Space</span>
                              <h5 className="text-[11px] md:text-xs font-black leading-tight" style={{ fontFamily: activeProject.typography.headingFont }}>
                                {activeProject.tagline || 'Modern Design Systems'}
                              </h5>
                              <p className="text-[8px] opacity-90 leading-relaxed truncate">
                                {activeProject.description || 'Welcome to your premium mobile guidelines.'}
                              </p>
                            </div>

                            {/* Colors Palette Section */}
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold opacity-60 uppercase block" style={getLabelStyle(activeProject)}>Palette Swatches</span>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-1 rounded-lg border flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                                  <span className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: activeProject.colors.primary }} />
                                  <span className="text-[6px] truncate max-w-full font-bold">Primary</span>
                                </div>
                                <div className="p-1 rounded-lg border flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activeProject.colors.secondary }} />
                                  <span className="text-[6px] truncate max-w-full font-bold">Secondary</span>
                                </div>
                                <div className="p-1 rounded-lg border flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activeProject.colors.accent }} />
                                  <span className="text-[6px] truncate max-w-full font-bold">Accent</span>
                                </div>
                              </div>
                            </div>

                            {/* Recent Activity Section */}
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold opacity-60 uppercase block" style={getLabelStyle(activeProject)}>Activity Feed</span>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                                  <div className="flex items-center space-x-2 truncate">
                                    <span className="text-[9px]">✅</span>
                                    <div className="truncate leading-tight">
                                      <span className="block text-[8px] font-bold truncate">Color checked</span>
                                      <span className="block text-[6px] opacity-60">WCAG compliance passed</span>
                                    </div>
                                  </div>
                                  <span style={getBadgeStyle(activeProject, 'primary')} className="!text-[6px] !px-1.5">AA Rating</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg border" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                                  <div className="flex items-center space-x-2 truncate">
                                    <span className="text-[9px]">📝</span>
                                    <div className="truncate leading-tight">
                                      <span className="block text-[8px] font-bold truncate">Typography updated</span>
                                      <span className="block text-[6px] opacity-60">Google Fonts loaded</span>
                                    </div>
                                  </div>
                                  <span style={getBadgeStyle(activeProject, 'secondary')} className="!text-[6px] !px-1.5">Font Scale</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-1">
                              <button
                                className="w-full py-2 text-[8px] font-bold text-white text-center hover:opacity-90 cursor-pointer transition-all"
                                style={getButtonStyle(activeProject, 'primary')}
                              >
                                Launch Workspace
                              </button>
                            </div>
                          </div>
                        )}

                        {mobileTab === 'search' && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Search bar input mock */}
                            <div className="flex items-center p-1.5 rounded-lg border bg-transparent" style={{ borderColor: `${activeProject.colors.text}10` }}>
                              <span className="text-[10px] pl-1 opacity-50">🔍</span>
                              <input
                                type="text"
                                placeholder="Search brand assets..."
                                className="w-full bg-transparent border-0 outline-none text-[10px] pl-1.5"
                                style={{ fontFamily: activeProject.typography.bodyFont }}
                              />
                            </div>

                            {/* Trending Pill Tags */}
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold opacity-60 uppercase block" style={getLabelStyle(activeProject)}>Categories</span>
                              <div className="flex flex-wrap gap-1.5">
                                <span style={getBadgeStyle(activeProject, 'primary')} className="!text-[6px] !px-1.5 cursor-pointer">Logos</span>
                                <span style={getBadgeStyle(activeProject, 'secondary')} className="!text-[6px] !px-1.5 cursor-pointer">Colors</span>
                                <span style={getBadgeStyle(activeProject, 'accent')} className="!text-[6px] !px-1.5 cursor-pointer">Fonts</span>
                              </div>
                            </div>

                            {/* Simulated Results */}
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-bold opacity-60 uppercase block" style={getLabelStyle(activeProject)}>Recent Assets</span>
                              <div className="space-y-1.5">
                                <div className="p-2 border rounded-lg flex items-center justify-between" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}05` }}>
                                  <div className="truncate">
                                    <span className="block text-[8px] font-bold truncate">logo_dark_primary.png</span>
                                    <span className="block text-[6px] opacity-50">Image/PNG • 24.8 KB</span>
                                  </div>
                                  <span className="text-[10px] cursor-pointer">📥</span>
                                </div>
                                <div className="p-2 border rounded-lg flex items-center justify-between" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}05` }}>
                                  <div className="truncate">
                                    <span className="block text-[8px] font-bold truncate">outfit_heavy.ttf</span>
                                    <span className="block text-[6px] opacity-50">Font/TTF • 120.4 KB</span>
                                  </div>
                                  <span className="text-[10px] cursor-pointer">📥</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {mobileTab === 'profile' && (
                          <div className="space-y-4 animate-in fade-in duration-200 text-center py-2">
                            {/* Profile details */}
                            <div className="flex flex-col items-center space-y-2">
                              <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm text-white uppercase" style={{ backgroundColor: activeProject.colors.primary }}>
                                {(user?.name || 'A').substring(0, 2)}
                              </div>
                              <div>
                                <span className="block text-xs font-bold">{user?.name || 'Amols Dev'}</span>
                                <span className="block text-[8px] opacity-60">{user?.email || 'user@example.com'}</span>
                              </div>
                            </div>

                            {/* Active brand kit summary */}
                            <div className="p-3 border rounded-lg text-left space-y-2" style={{ backgroundColor: activeProject.colors.surface, borderColor: `${activeProject.colors.text}08` }}>
                              <span className="text-[8px] font-bold uppercase opacity-60 block border-b pb-1" style={{ borderColor: `${activeProject.colors.text}05`, ...getLabelStyle(activeProject) }}>Current Kit</span>
                              <div>
                                <span className="block text-[9px] font-bold">{activeProject.name}</span>
                                <span className="block text-[7px] opacity-60 truncate">Typography: {activeProject.typography.headingFont}</span>
                              </div>
                            </div>

                            <button
                              className="w-full py-2 text-[8px] font-bold hover:scale-102 transition-all cursor-pointer border"
                              style={getButtonStyle(activeProject, 'outline')}
                            >
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mobile Bottom Nav */}
                      <div className="border-t py-2 px-6 flex justify-between items-center text-[8px] font-bold opacity-80 z-20 shrink-0" style={{ borderColor: `${activeProject.colors.text}10`, backgroundColor: activeProject.colors.surface }}>
                        <button
                          onClick={() => setMobileTab('home')}
                          className="flex flex-col items-center cursor-pointer focus:outline-none"
                          style={mobileTab === 'home' ? { color: activeProject.colors.primary } : { opacity: 0.6 }}
                        >
                          <span>🏠</span>
                          <span className="text-[6px] mt-0.5 font-bold">Home</span>
                        </button>
                        <button
                          onClick={() => setMobileTab('search')}
                          className="flex flex-col items-center cursor-pointer focus:outline-none"
                          style={mobileTab === 'search' ? { color: activeProject.colors.primary } : { opacity: 0.6 }}
                        >
                          <span>🔍</span>
                          <span className="text-[6px] mt-0.5 font-bold">Search</span>
                        </button>
                        <button
                          onClick={() => setMobileTab('profile')}
                          className="flex flex-col items-center cursor-pointer focus:outline-none"
                          style={mobileTab === 'profile' ? { color: activeProject.colors.primary } : { opacity: 0.6 }}
                        >
                          <span>👤</span>
                          <span className="text-[6px] mt-0.5 font-bold">Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Floating Quick Stats & Utility Control Bar */}
              <div className={`flex flex-wrap items-center justify-between gap-4 border p-4 rounded-2xl backdrop-blur-xl relative z-10 shadow-md ${
                darkMode ? 'bg-slate-900/30 border-slate-800/60 shadow-black/30' : 'bg-white/75 border-slate-202/60 shadow-slate-200/10'
              }`}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-405">
                  <div>
                    <span className="block text-[9px] uppercase font-bold opacity-60">Resolution Specs</span>
                    <span className="font-semibold text-slate-200 dark:text-slate-350">
                      {previewType === 'mobile' ? 'Mobile App • 390 x 844 px' : 'Desktop Web • 1440 x 900 px'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[9px] uppercase font-bold opacity-60">Scale Ratio</span>
                    <span className="font-semibold text-slate-200 dark:text-slate-350">100% Fit Sandbox</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold opacity-60">Fonts Compiled</span>
                    <span className="font-semibold text-slate-200 dark:text-slate-350">
                      {activeProject.typography.headingFont} / {activeProject.typography.bodyFont}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const cssText = `:root {\n  --color-primary: ${activeProject.colors.primary};\n  --color-secondary: ${activeProject.colors.secondary};\n  --color-accent: ${activeProject.colors.accent};\n  --font-heading: "${activeProject.typography.headingFont}";\n  --font-body: "${activeProject.typography.bodyFont}";\n  --border-radius: ${activeProject.spacing.borderRadius}px;\n}`;
                      navigator.clipboard.writeText(cssText);
                      triggerToast('CSS variables copied to clipboard!', 'success');
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-white rounded-lg hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                    style={getButtonStyle(activeProject, 'primary')}
                  >
                    📋 Copy CSS Variables
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 8. SERVICES WORKSPACE TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left w-full">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-905'}`}>Brand Kit Specialist Services</h3>
                <p className={`text-xs ${cardDescClass}`}>Select the services you are interested in, fill in your contact information, and our design team will contact you to build your custom brand kit.</p>
              </div>

              <Card className={`${cardClass} p-6 shadow-xl border dark:border-slate-800 relative overflow-hidden backdrop-blur-md`}>
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-[60px] opacity-15 pointer-events-none" style={{ backgroundColor: activeProject.colors?.primary || '#6366f1' }} />
                <ServicesForm 
                  activeProject={activeProject} 
                  darkMode={darkMode} 
                  cardClass={cardClass} 
                  inputClass={inputClass} 
                  getButtonStyle={getButtonStyle} 
                  triggerToast={triggerToast} 
                />
              </Card>
            </div>
          )}
          {/* 9. PURCHASE PLAN WORKSPACE TAB */}
          {activeTab === 'purchase-plan' && (
            <div className="space-y-6 animate-in fade-in duration-300 p-6 md:p-8 rounded-2xl border border-sky-200/50 bg-[#e0f2fe]/40 dark:bg-[#0c4a6e]/10 backdrop-blur-md shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100">
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body {
                    background: white !important;
                    color: black !important;
                  }
                  /* Hide everything on the page */
                  body * {
                    visibility: hidden !important;
                  }
                  /* Make only the invoice container visible */
                  #payment-invoice-receipt, #payment-invoice-receipt * {
                    visibility: visible !important;
                  }
                  /* Pin the invoice container to fill the print canvas */
                  #payment-invoice-receipt {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: white !important;
                    color: black !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                }
              `}} />
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 h-48 w-48 bg-sky-400/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none" />

              {paymentSuccess && activeInvoice ? (
                <div className="space-y-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
                  {/* Success notification banner */}
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                    <CheckCircle size={18} className="shrink-0 animate-pulse text-emerald-500" />
                    <div>
                      <span className="font-black">Payment Approved!</span> Your brand kit specifications are now fully unlocked and downloaded.
                    </div>
                  </div>

                  {/* Printable Receipt/Invoice Card */}
                  <div id="payment-invoice-receipt" className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl space-y-6 text-slate-800 dark:text-slate-200 print:border-none print:shadow-none print:bg-white print:text-black">
                    <div className="flex justify-between items-start border-b dark:border-slate-800 pb-5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white font-black text-sm">
                            BK
                          </div>
                          <span className="font-extrabold text-base tracking-tight">BrandKit Inc.</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">100 Pine Street, San Francisco, CA 94111</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 rounded-full">
                          PAID
                        </span>
                        <h4 className="text-sm font-extrabold mt-2 text-slate-900 dark:text-white">{activeInvoice.id}</h4>
                        <p className="text-[10px] text-slate-400">Date: {activeInvoice.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Billed To:</span>
                        <p className="font-bold mt-1 text-slate-900 dark:text-white">{activeInvoice.customerName}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{activeInvoice.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Details:</span>
                        <p className="font-bold mt-1 text-slate-900 dark:text-white">Gateway: {activeInvoice.gateway}</p>
                        <p className="text-[10px] font-mono text-slate-450 dark:text-slate-400 mt-0.5">Ref: {activeInvoice.txnId}</p>
                      </div>
                    </div>

                    <div className="border-t border-b dark:border-slate-800 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b dark:border-slate-800 pb-2 text-[10px] uppercase font-black tracking-wider">
                            <th className="text-left py-2">Item Description</th>
                            <th className="text-center py-2 w-16">Qty</th>
                            <th className="text-right py-2 w-24">Price</th>
                            <th className="text-right py-2 w-24">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800/50">
                          <tr>
                            <td className="py-3 font-semibold text-slate-900 dark:text-white">{activeInvoice.item}</td>
                            <td className="py-3 text-center">1</td>
                            <td className="py-3 text-right">${activeInvoice.subtotal.toFixed(2)}</td>
                            <td className="py-3 text-right">${activeInvoice.total.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end text-xs">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal:</span>
                          <span>${activeInvoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Tax (0%):</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between border-t dark:border-slate-800 pt-2 font-extrabold text-sm text-slate-900 dark:text-white">
                          <span>Total Paid:</span>
                          <span className="text-indigo-600 dark:text-indigo-400">${activeInvoice.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      onClick={() => {
                        setPaymentSuccess(false);
                        setActiveInvoice(null);
                        setActiveTab('presets');
                      }}
                      variant="outline"
                      className="text-xs font-bold px-4 py-2 cursor-pointer border dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                    >
                      ← Back to Presets
                    </Button>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="text-xs font-bold px-4 py-2 cursor-pointer border dark:border-slate-800 flex items-center space-x-1.5 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                      >
                        <Printer size={12} />
                        <span>Print Invoice</span>
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.setFont('helvetica', 'bold');
                          doc.setFontSize(20);
                          doc.text('INVOICE / RECEIPT', 20, 30);
                          doc.setFontSize(10);
                          doc.setFont('helvetica', 'normal');
                          doc.text(`Invoice ID: ${activeInvoice.id}`, 20, 40);
                          doc.text(`Date: ${activeInvoice.date}`, 20, 45);
                          doc.text(`Status: PAID`, 20, 50);
                          doc.text('------------------------------------------------------------', 20, 55);
                          doc.text(`Billed To: ${activeInvoice.customerName} (${activeInvoice.customerEmail})`, 20, 65);
                          doc.text(`Payment Gateway: ${activeInvoice.gateway}`, 20, 72);
                          doc.text(`Transaction Ref: ${activeInvoice.txnId}`, 20, 77);
                          doc.text('------------------------------------------------------------', 20, 85);
                          doc.text('Item Description', 20, 95);
                          doc.text('Qty', 140, 95);
                          doc.text('Price', 160, 95);
                          doc.text('Amount', 180, 95);
                          doc.text('------------------------------------------------------------', 20, 100);
                          doc.setFont('helvetica', 'bold');
                          doc.text(activeInvoice.item.substring(0, 50), 20, 110);
                          doc.setFont('helvetica', 'normal');
                          doc.text('1', 140, 110);
                          doc.text(`$${activeInvoice.subtotal.toFixed(2)}`, 160, 110);
                          doc.text(`$${activeInvoice.total.toFixed(2)}`, 180, 110);
                          doc.text('------------------------------------------------------------', 20, 120);
                          doc.text(`Subtotal: $${activeInvoice.subtotal.toFixed(2)}`, 140, 130);
                          doc.text('Tax (0%): $0.00', 140, 135);
                          doc.setFontSize(12);
                          doc.setFont('helvetica', 'bold');
                          doc.text(`Total Paid: $${activeInvoice.total.toFixed(2)}`, 140, 145);
                          doc.save(`${activeInvoice.id}.pdf`);
                          triggerToast('Invoice PDF downloaded successfully!', 'success');
                        }}
                        className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 cursor-pointer flex items-center space-x-1.5"
                      >
                        <FileDown size={12} />
                        <span>Download Invoice PDF</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : isProcessingPayment ? (
                <div className="text-center py-20 space-y-6 max-w-sm mx-auto animate-in fade-in duration-200">
                  <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
                    <Shield size={32} className="text-sky-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Authorizing Secured Payment</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Please do not refresh the browser. Registering merchant metadata and securing SSL handshake protocols...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Form & Plans */}
                  <div className="lg:col-span-8 space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block mb-1">
                        Secure Purchase
                      </span>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Select a subscription scheme</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Unlock high-fidelity PDF manual compilations, Markdown export utilities, and style dictionary JSON specification builds.
                      </p>
                    </div>

                    {/* Plan Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Single */}
                      <div 
                        onClick={() => setSelectedPlan('single')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900/30 ${
                          selectedPlan === 'single'
                            ? 'border-sky-500 ring-1 ring-sky-500/20 shadow-md shadow-sky-500/5'
                            : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black uppercase text-slate-400">Single Kit</span>
                          <span className="text-lg font-black text-sky-500">$19</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                          Lifetime download & updates for the selected brand kit.
                        </p>
                      </div>

                      {/* Pro */}
                      <div 
                        onClick={() => setSelectedPlan('pro')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900/30 relative ${
                          selectedPlan === 'pro'
                            ? 'border-indigo-500 ring-1 ring-indigo-500/20 shadow-md shadow-indigo-500/5'
                            : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[8px] font-black bg-indigo-600 text-white rounded-full uppercase tracking-wider">
                          Popular
                        </span>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black uppercase text-indigo-500 dark:text-indigo-400">Startup Pro</span>
                          <span className="text-lg font-black text-indigo-500">$49</span>
                        </div>
                        <p className="text-[10px] text-slate-505 dark:text-slate-400 leading-normal">
                          Create unlimited kits, download specs, and sync to Figma.
                        </p>
                      </div>

                      {/* Enterprise */}
                      <div 
                        onClick={() => setSelectedPlan('enterprise')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900/30 ${
                          selectedPlan === 'enterprise'
                            ? 'border-purple-500 ring-1 ring-purple-500/20 shadow-md shadow-purple-500/5'
                            : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black uppercase text-purple-500 dark:text-purple-400">Enterprise</span>
                          <span className="text-lg font-black text-purple-500">$99</span>
                        </div>
                        <p className="text-[10px] text-slate-505 dark:text-slate-400 leading-normal">
                          Unlimited kits, custom design tokens, and team seats.
                        </p>
                      </div>
                    </div>

                    {/* Payment Gateway Form Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-6 shadow-sm">
                      <div className="flex flex-col space-y-2 pb-2">
                        <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                          Select Payment Gateway
                        </label>
                        <div className="relative">
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className={`w-full px-3 py-2.5 rounded-lg text-xs outline-none transition-all appearance-none cursor-pointer pr-10 ${inputClass}`}
                          >
                            <option value="card">💳 Credit or Debit Card (via Stripe)</option>
                            <option value="paypal">💛 PayPal Express checkout link</option>
                            <option value="upi">📲 UPI Scanner instant code</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                              triggerToast('Please complete all card details', 'error');
                              return;
                            }
                            executePayment();
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">
                                Card Number
                              </label>
                              <input
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${inputClass}`}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${inputClass}`}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">
                                CVV / Security Code
                              </label>
                              <input
                                type="password"
                                placeholder="***"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${inputClass}`}
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${inputClass}`}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <Button
                              type="submit"
                              className="px-8 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-extrabold py-2.5 rounded-xl shadow-md cursor-pointer transition-all w-auto"
                            >
                              Pay Now {selectedPlan === 'single' ? '$19.00' : selectedPlan === 'pro' ? '$49.00' : '$99.00'} via Stripe Secure
                            </Button>
                          </div>
                        </form>
                      )}

                      {paymentMethod === 'paypal' && (
                        <div className="text-center py-8 space-y-4 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                          <div className="flex justify-center space-x-2 font-black text-indigo-500 text-2xl tracking-tight italic">
                            <span className="text-sky-500">Pay</span><span>Pal</span>
                          </div>
                          <p className="text-xs text-slate-505 dark:text-slate-400 max-w-xs mx-auto">
                            Authorization window will redirect to PayPal secure popup interface.
                          </p>
                          <Button
                            onClick={executePayment}
                            className="bg-yellow-500 hover:bg-yellow-455 text-slate-900 font-extrabold px-8 py-2 rounded-xl shadow-md cursor-pointer"
                          >
                            Proceed with PayPal Express
                          </Button>
                        </div>
                      )}

                      {paymentMethod === 'upi' && (
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                            <div className="h-32 w-32 bg-white p-2 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-md">
                              <div className="grid grid-cols-8 gap-1 w-full h-full p-1 bg-slate-100">
                                {[...Array(64)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`rounded-xs ${
                                      (i % 3 === 0 || i % 7 === 0 || i < 8 || i % 8 === 0 || i > 55) && i !== 23 && i !== 44
                                        ? 'bg-slate-900' : 'bg-transparent'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-left space-y-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">
                                Fast Scan & Pay
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">UPI ID: brandkit@stripeupi</h4>
                              <p className="text-[10px] text-slate-555 dark:text-slate-400 leading-normal max-w-xs">
                                Scan the QR code using Google Pay, PhonePe, Paytm, or any BHIM UPI app. Enter the Transaction Ref ID below to complete processing.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                              Transaction / Reference ID
                            </label>
                            <input
                              type="text"
                              placeholder="TXN123456789"
                              value={upiTxId}
                              onChange={(e) => setUpiTxId(e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg text-xs outline-none transition-all ${inputClass}`}
                            />
                          </div>

                          <div className="flex justify-center">
                            <Button
                              onClick={() => {
                                if (!upiTxId) {
                                  triggerToast('Please enter the UPI Transaction Reference ID', 'error');
                                  return;
                                }
                                executePayment();
                              }}
                              className="px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl cursor-pointer w-auto"
                            >
                              Verify Transaction
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Summary Checklist */}
                  <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-6 shadow-sm">
                    <h4 className="text-sm font-black border-b dark:border-slate-800 pb-3 text-slate-900 dark:text-white">
                      Order Summary
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-505 dark:text-slate-400">Selected Brand:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{activeProject?.name || 'My Brand Kit'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-505 dark:text-slate-400">Active Version:</span>
                        <span className="font-mono">v{activeProject?.changelog?.length || 1}.0</span>
                      </div>
                      <div className="flex justify-between border-t dark:border-slate-800 pt-3 text-sm font-black">
                        <span>Total Due:</span>
                        <span className="text-sky-500">
                          {selectedPlan === 'single' ? '$19.00' : selectedPlan === 'pro' ? '$49.00' : '$99.00'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] space-y-2 text-slate-500 dark:text-slate-400 leading-normal">
                      <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white font-bold">
                        <Shield size={12} className="text-emerald-500" />
                        <span>Secured Encryption</span>
                      </div>
                      <p>
                        We use industry-standard SSL encryption protocols to secure all payload dispatcher events. Cards are processed with fully compliant test sandbox keys.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Success Modal Popup */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSuccessModal(null)} 
          />
          
          {/* Modal Container */}
          <div 
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200 ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-white shadow-black/80' 
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}
          >
            {/* Checkmark Graphic Icon */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-bounce">
                <Sparkles className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {successModal.title}
                </h3>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                  {successModal.message}
                </p>
              </div>
            </div>

            {/* Exporter Details Box */}
            <div className={`mt-5 p-4 rounded-xl border text-xs space-y-3 ${
              darkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-150'
            }`}>
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                🎁 Packages Downloaded Automatically:
              </span>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Design spec markdown manual</strong> (<code>.md</code>)</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Token Studio data payload</strong> (<code>.json</code>)</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span><strong>7-Page design specification guide</strong> (<code>.pdf</code>)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSuccessModal(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-lg shadow-lg shadow-indigo-500/20"
              >
                Close & Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl border p-0 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-slate-900/50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/30">
              <div className="flex items-center space-x-2">
                <LucideIcons.FileText className="text-indigo-600 dark:text-indigo-400" size={18} />
                <h4 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Guidelines Manual: <span className="text-indigo-600 dark:text-indigo-400">{previewPdfName}</span>
                </h4>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={closePdfPreview}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border-none"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Viewer Iframe container */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODIFY BRAND KIT (APPLY PRESET) MODAL OVERLAY
          ======================================================== */}
      {modifyingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setModifyingProject(null)} />
          
          <div className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh] ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-202 text-slate-800'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-base font-extrabold flex items-center space-x-2">
                  <LucideIcons.Sparkles className="text-sky-500 h-5 w-5" />
                  <span>Modify Design Foundation: {modifyingProject.name}</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Overwrite your brand kit's design parameters with a preset template configuration.
                </p>
              </div>
              <button 
                onClick={() => setModifyingProject(null)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <LucideIcons.X size={16} />
              </button>
            </div>

            {/* Presets Library (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select Preset Foundation</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetProjects.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected 
                          ? 'border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/20' 
                          : darkMode 
                            ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60' 
                            : 'border-slate-202 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs">{preset.name}</span>
                          {isSelected && <span className="h-2 w-2 rounded-full bg-sky-500 block" />}
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{preset.industry}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-500/5">
                        <div className="flex space-x-1 items-center">
                          <span className="h-3 w-3 rounded-full border block" style={{ backgroundColor: preset.colors.primary }} />
                          <span className="h-3 w-3 rounded-full border block" style={{ backgroundColor: preset.colors.secondary }} />
                          <span className="h-3 w-3 rounded-full border block" style={{ backgroundColor: preset.colors.accent }} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{preset.typography.headingFont}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirmation details (Always Visible!) */}
            {selectedPresetId && (
              <div className={`p-4 border-t dark:border-slate-800 space-y-3 shrink-0 ${
                darkMode ? 'bg-slate-950/20' : 'bg-slate-50'
              }`}>
                <div className="flex items-start space-x-2">
                  <LucideIcons.AlertTriangle className="text-amber-500 h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold block text-slate-800 dark:text-slate-200">Overwriting Confirmation</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Applying <strong className="text-slate-850 dark:text-slate-100">"{presetProjects.find(p => p.id === selectedPresetId)?.name}"</strong> will replace the existing color palette, typography font families, typography weights, margin spacing parameters, and icons of <strong className="text-slate-850 dark:text-slate-100">"{modifyingProject.name}"</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-start space-x-2 text-[10px] text-slate-500 leading-relaxed">
                  <LucideIcons.CheckCircle className="text-sky-500 h-4 w-4 shrink-0 mt-0.2" />
                  <span>
                    <strong>Automated Backup:</strong> A backup of this kit's current design configuration will be committed to the Changelog history as version <strong>v{(modifyingProject.changelog?.length || 0) + 1}.0</strong>. You can restore this version at any time.
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-500/5">
                  <label className="flex items-start space-x-2.5 text-[10px] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmOverwrite}
                      onChange={(e) => setConfirmOverwrite(e.target.checked)}
                      className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 cursor-pointer h-3.5 w-3.5"
                    />
                    <span className="text-slate-500 leading-normal">
                      I explicitly choose to replace the design system parameters of <strong>"{modifyingProject.name}"</strong>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t dark:border-slate-800 shrink-0">
              <Button
                onClick={() => setModifyingProject(null)}
                variant="outline"
                className={`flex-1 font-bold py-2 px-4 rounded-lg text-xs justify-center ${
                  darkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-202 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Cancel</span>
              </Button>
              <Button
                onClick={() => {
                  try {
                    console.log('Confirm & Load Workstation clicked!');
                    console.log('selectedPresetId:', selectedPresetId);
                    console.log('confirmOverwrite:', confirmOverwrite);
                    console.log('modifyingProject:', modifyingProject);
                    
                    if (!selectedPresetId) {
                      triggerToast('Please select a system preset first!', 'warning');
                      return;
                    }
                    if (!confirmOverwrite) {
                      triggerToast('Please explicitly check the overwrite confirmation box!', 'warning');
                      return;
                    }
                    
                    const preset = presetProjects.find(p => p.id === selectedPresetId);
                    console.log('Found preset:', preset);
                    if (!preset) {
                      triggerToast('Selected preset could not be found!', 'error');
                      return;
                    }

                    console.log('Calling applyPresetToProject with:', modifyingProject.id, selectedPresetId);
                    const success = applyPresetToProject(modifyingProject.id, selectedPresetId);
                    console.log('applyPresetToProject success:', success);

                    if (success) {
                      setShowSuccessModal({
                        projectId: modifyingProject.id,
                        projectName: modifyingProject.name,
                        presetName: preset.name,
                        version: `${(modifyingProject.changelog?.length || 0) + 1}.0`
                      });
                    } else {
                      triggerToast('Failed to apply preset foundation to this brand kit!', 'error');
                    }
                  } catch (err) {
                    console.error('Error in Confirm button handler:', err);
                    triggerToast(`Error: ${err.message}`, 'error');
                  }
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-650 text-white font-extrabold py-2 px-4 rounded-lg shadow-md cursor-pointer text-xs text-center justify-center border-none"
              >
                <span>Confirm & Load Workstation</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ACTIVATE BRAND KIT FIRST MODAL OVERLAY
          ======================================================== */}
      {showActivateFirstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowActivateFirstModal(null)} />
          
          <div className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-202 text-slate-800'
          }`}>
            <div className="h-14 w-14 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <LucideIcons.AlertTriangle className="h-7 w-7" />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold">
                Activate Brand Kit
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                You must activate <strong className="text-slate-850 dark:text-slate-150">"{showActivateFirstModal.name}"</strong> as your active workstation project before you can modify its design system with a preset foundation.
              </p>
            </div>

            <div className="flex w-full space-x-3 pt-2">
              <Button
                onClick={() => setShowActivateFirstModal(null)}
                variant="outline"
                className={`flex-1 font-bold py-2 px-4 rounded-lg text-xs justify-center ${
                  darkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-202 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Cancel</span>
              </Button>
              <Button
                onClick={() => {
                  const targetKit = showActivateFirstModal;
                  setActiveProject(targetKit.id);
                  loadPresetIntoBuilder(targetKit);
                  setIsBrandSelectedOrCreated(true);
                  setActiveTab('create-brand');
                  setShowActivateFirstModal(null);
                  
                  // Instantly open Modify / Apply Preset Modal since it is active now!
                  setModifyingProject(targetKit);
                  setSelectedPresetId('');
                  setConfirmOverwrite(false);
                  triggerToast(`Activated "${targetKit.name}" workstation! Choose a preset foundation.`, 'success');
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-650 text-white font-extrabold py-2 px-4 rounded-lg shadow-md cursor-pointer text-xs text-center justify-center border-none"
              >
                <span>Activate & Proceed</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRESET APPLIED SUCCESS MODAL OVERLAY
          ======================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-350">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowSuccessModal(null)} />
          
          <div className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-202 text-slate-800'
          }`}>
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-bounce">
              <LucideIcons.CheckCircle className="h-7 w-7" />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold">
                Preset Foundation Applied!
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                The design foundation from <strong className="text-emerald-550 dark:text-emerald-400">"{showSuccessModal.presetName}"</strong> has been successfully applied to your brand kit <strong className="text-slate-850 dark:text-white">"{showSuccessModal.projectName}"</strong>.
              </p>
              <span className="text-[10px] text-slate-400 block mt-2">
                A backup rollback point has been created as version <strong>v{showSuccessModal.version}</strong>.
              </span>
            </div>

            <div className="w-full pt-2">
              <Button
                onClick={() => {
                  try {
                    const projectId = showSuccessModal.projectId;
                    console.log('Success Modal Continue clicked for project:', projectId);
                    
                    const updated = useStore.getState().projects.find(p => p.id === projectId);
                    console.log('Updated project from store:', updated);
                    
                    setActiveProject(projectId);
                    if (updated) {
                      loadPresetIntoBuilder(updated);
                    }
                    setIsBrandSelectedOrCreated(true);
                    setActiveTab('create-brand');
                    
                    // Reset all modal states
                    setShowSuccessModal(null);
                    setModifyingProject(null);
                    triggerToast(`Loaded updated "${showSuccessModal.projectName}" workstation!`, 'success');
                  } catch (err) {
                    console.error('Error in Success Modal Continue action:', err);
                    triggerToast(`Error: ${err.message}`, 'error');
                  }
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-650 text-white font-extrabold py-2 px-4 rounded-lg shadow-md cursor-pointer text-xs text-center justify-center border-none"
              >
                <span>Continue to Workstation</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setConfirmDialog(null)} 
          />
          
          {/* Modal Container */}
          <div 
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200 ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-white shadow-black/80' 
                : 'bg-white border-slate-202 text-slate-800 shadow-slate-200/50'
            }`}
          >
            {/* Warning Graphic Icon */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10 animate-pulse">
                <AlertCircle className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-905'}`}>
                  {confirmDialog.title}
                </h3>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-505'}`}>
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end space-x-3">
              <Button
                onClick={() => setConfirmDialog(null)}
                variant="outline"
                className={`text-xs py-2 px-4 rounded-lg font-bold border transition-all cursor-pointer ${
                  darkMode ? 'border-slate-800 hover:bg-slate-909 text-slate-300' : 'border-slate-202 hover:bg-slate-50 text-slate-707'
                }`}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDialog.onConfirm}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}
