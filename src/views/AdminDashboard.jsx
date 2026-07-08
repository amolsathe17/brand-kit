import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Button, Card, Toast } from '../components/UI';
import {
  Users, Calendar, Clock, CheckCircle, RefreshCw, LogOut, Shield,
  ArrowLeft, UserCheck, AlertTriangle, TrendingUp, BarChart2, Sun, Moon,
  Trash2, FileText, Download, FileDown, ChevronDown, AlertCircle, Search,
  FolderOpen, HelpCircle, Briefcase, Layers, Settings, Key, Terminal,
  Sliders, Globe, Percent, Star, MessageSquare, BookOpen, Bell, Play,
  Lock, Upload, Activity, UserX, Plus, FileCheck2, Share2, Clipboard,
  Heart, Filter, ChevronRight, ChevronLeft, Menu, X, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import { downloadBrandKitJSON } from '../utils/jsonGenerator';
import { downloadBrandKitMarkdown } from '../utils/mdGenerator';
import { downloadBrandKitPDF } from '../utils/pdfGenerator';

export default function AdminDashboard() {
  const {
    user,
    bookings,
    technicians,
    projects,
    deleteProject,
    darkMode,
    toggleTheme,
    assignTechnician,
    updateBookingStatus,
    logout,
    login,
    updateProject,
    applyPresetToProject,
    setAdminViewMode,
    adminViewMode
  } = useStore();

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }

  // Sidebar navigation and sub-modules routing state
  const [activeSidebarSection, setActiveSidebarSection] = useState('dashboard');
  const [activeSubModule, setActiveSubModule] = useState('dashboard-overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalAdminSearch, setGlobalAdminSearch] = useState('');
  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    customers: true,
    brandkits: false,
    marketplace: false,
    orders: false,
    subscriptions: false,
    payments: false,
    media: false,
    content: false,
    support: false,
    analytics: false,
    system: false,
    developer: false
  });

  // Search & Filter state variables
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQueries, setSearchQueries] = useState({
    users: '',
    bookings: '',
    repos: '',
    components: '',
    tickets: ''
  });
  
  // Interactive Custom Simulators States
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUsersList] = useState([
    { id: 'usr_1', email: 'alex@techstartup.com', name: 'Alex Miller', plan: 'Pro', status: 'Active', joined: '2026-04-12', storage: '12.4 GB', apiUsage: '14,244 reqs', credits: 150 },
    { id: 'usr_2', email: 'samantha.green@design.studio', name: 'Samantha Green', plan: 'Starter', status: 'Active', joined: '2026-05-01', storage: '3.1 GB', apiUsage: '2,912 reqs', credits: 20 },
    { id: 'usr_3', email: 'hacker99@suspicious.io', name: 'Darth V', plan: 'Free', status: 'Suspended', joined: '2026-06-15', storage: '0.1 GB', apiUsage: '5 reqs', credits: 0 },
    { id: 'usr_4', email: 'director@corporate.com', name: 'Mr. Corporate', plan: 'Enterprise', status: 'Active', joined: '2026-02-18', storage: '84.8 GB', apiUsage: '94,188 reqs', credits: 1200 }
  ]);
  const [userDrawerTab, setUserDrawerTab] = useState('overview');

  // Token editor simulation state
  const [tokens, setTokens] = useState([
    { id: 't1', name: 'Primary Sky', type: 'Color', value: '#0ea5e9' },
    { id: 't2', name: 'Success Emerald', type: 'Color', value: '#10b981' },
    { id: 't3', name: 'Font Header', type: 'Typography', value: 'Outfit, sans-serif' },
    { id: 't4', name: 'Radius Premium', type: 'Radius', value: '16px' },
    { id: 't5', name: 'Frosted Glass Shadow', type: 'Shadow', value: '0 8px 32px 0 rgba(0,0,0,0.08)' }
  ]);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [newTokenType, setNewTokenType] = useState('Color');

  // Coupon manager simulation state
  const [coupons, setCoupons] = useState([
    { code: 'SKYBLUE30', discount: '30%', type: 'Percentage', usage: '124 times', status: 'Active' },
    { code: 'SUMMERBRAND', discount: '$15.00', type: 'Flat', usage: '89 times', status: 'Active' },
    { code: 'WELCOME50', discount: '50%', type: 'Percentage', usage: '412 times', status: 'Expired' }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15%');
  const [newCouponType, setNewCouponType] = useState('Percentage');

  // Interactive Support Tickets Response Chat simulation state
  const [supportTickets, setSupportTickets] = useState([
    { id: 'tick_101', user: 'alex@techstartup.com', subject: 'Vite v4 Export variables fail', priority: 'High', status: 'Open', date: '10 mins ago', messages: [{ sender: 'user', text: 'Hey, I am copying Tailwind v4 variables but some colors output default values. Can you check?' }] },
    { id: 'tick_102', user: 'samantha.green@design.studio', subject: 'Invoice Billing issue', priority: 'Medium', status: 'Open', date: '1 hour ago', messages: [{ sender: 'user', text: 'I bought the SaaS Pro Bundle but did not receive the PDF invoice in my inbox.' }] },
    { id: 'tick_103', user: 'director@corporate.com', subject: 'SSO Config assistance', priority: 'Low', status: 'Closed', date: '1 day ago', messages: [{ sender: 'user', text: 'Corporate SSO integration is fully set up. Thanks!' }] }
  ]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Feature Flags simulation state
  const [featureFlags, setFeatureFlags] = useState({
    aiGeneration: true,
    marketplaceSell: true,
    teamsCollaborate: false,
    exportPdfHighRes: true,
    darkDefaultMode: false
  });

  // Component library mock components
  const [components, setComponents] = useState([
    { id: 'c1', name: 'GlassButton', category: 'Buttons', code: '<button className="backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all shadow-sm">Button</button>' },
    { id: 'c2', name: 'FrostedCard', category: 'Cards', code: '<div className="backdrop-blur-lg bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-2xl shadow-xl">Content</div>' },
    { id: 'c3', name: 'GlassInput', category: 'Inputs', code: '<input className="bg-white/10 border border-white/25 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-none" />' }
  ]);

  // Payment gateways simulation state
  const [gateways, setGateways] = useState({
    stripe: true,
    razorpay: false,
    paypal: true,
    paddle: false,
    lemonSqueezy: true
  });

  // Orders Ledger state
  const [orders, setOrders] = useState([
    { id: 'ord_9281', customer: 'john.d@brandkit.ai', items: 'SaaS Pro Bundle', total: '$149.00', date: '2026-07-06', status: 'Completed', gateway: 'Stripe' },
    { id: 'ord_8372', customer: 'alex@techstartup.com', items: 'Enterprise Custom Kit', total: '$899.00', date: '2026-07-05', status: 'Completed', gateway: 'PayPal' },
    { id: 'ord_2910', customer: 'director@corporate.com', items: 'Starter Kit Base', total: '$49.00', date: '2026-07-03', status: 'Refunded', gateway: 'Lemon Squeezy' }
  ]);
  const [refundedOrderIds, setRefundedOrderIds] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modifyingProject, setModifyingProject] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // Subscription plan limits state
  const [subLimits, setSubLimits] = useState({
    storage: 50, // GB
    exports: 250, // per month
    apiCalls: 50000 // per day
  });

  // Interactive Documentation Composer State
  const [docArticles, setDocArticles] = useState([
    { id: 'art_1', title: 'Getting Started Guide', category: 'Guides', status: 'Published', date: '2026-07-01' },
    { id: 'art_2', title: 'Exporting Tailwind CSS v4 Spec Variables', category: 'API', status: 'Draft', date: '2026-07-05' }
  ]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Guides');

  // Hardcoded audit logs
  const [auditLogsList, setAuditLogsList] = useState([
    { time: '10:45 AM', action: 'Modified System Settings config', admin: 'superadmin@brandkit.ai', ip: '192.168.1.1' },
    { time: '09:32 AM', action: 'Approved user brand kit: Neon Cyberwave', admin: 'superadmin@brandkit.ai', ip: '192.168.1.1' },
    { time: 'Yesterday', action: 'Created discount coupon: SKYBLUE30', admin: 'superadmin@brandkit.ai', ip: '192.168.1.14' }
  ]);

  // Webhooks subscription state
  const [webhooks, setWebhooks] = useState([
    { id: 'wh_1', url: 'https://api.partner.com/v1/sync', event: 'brandkit.created', status: 'Active', deliveries: '1,424 successful' },
    { id: 'wh_2', url: 'https://hooks.slack.com/services/123', event: 'booking.completed', status: 'Active', deliveries: '381 successful' }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 'not_1', text: 'New high priority support ticket from Alex M.', read: false },
    { id: 'not_2', text: 'Pending approve brand kit request: Retro Vibe', read: false },
    { id: 'not_3', text: 'Payout to gateway: $4,580 settled', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Core Presets & Custom kits
  const presetProjects = (projects || []).filter(p => p.id.startsWith('p') && !p.id.includes('_'));
  const customProjects = (projects || []).filter(p => !p.id.startsWith('p') || p.id.includes('_'));

  const combinedOrders = useMemo(() => {
    const list = orders.map(o => {
      if (refundedOrderIds.includes(o.id)) {
        return { ...o, status: 'Refunded' };
      }
      return o;
    });

    const customProjs = (projects || []).filter(p => !p.id.startsWith('p') || p.id.includes('_'));
    customProjs.forEach(p => {
      const orderId = `ord_${p.id.substring(0, 6)}`;
      if (!list.some(o => o.id === orderId)) {
        const isRefunded = refundedOrderIds.includes(orderId);
        list.push({
          id: orderId,
          customer: user?.email || 'hello@brandkit.ai',
          items: `Brand Kit: ${p.name}`,
          total: `$89.00`,
          date: p.dateModified || new Date().toISOString().split('T')[0],
          status: isRefunded ? 'Refunded' : 'Completed',
          gateway: 'Stripe',
          projectId: p.id
        });
      }
    });

    return list;
  }, [orders, refundedOrderIds, projects, user]);

  const filteredOrders = useMemo(() => {
    const q = globalAdminSearch.toLowerCase();
    return combinedOrders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.items.toLowerCase().includes(q)
    );
  }, [combinedOrders, globalAdminSearch]);

  const triggerToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Toggles section folder in sidebar
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Search input update helper
  const handleQueryChange = (module, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [module]: value
    }));
  };

  // Impersonate customer simulator
  const handleImpersonateUser = (email) => {
    login(email, 'user1234', 'user');
    triggerToast(`Impersonating client session: ${email}`, 'success');
  };

  // Suspend / activate customer simulator
  const handleToggleSuspendUser = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        triggerToast(`User status updated to ${newStatus}`, 'info');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  // Add Credit simulator
  const handleGiveCredits = (userId, amount) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        triggerToast(`Successfully credited ${amount} tokens to ${u.name}`, 'success');
        return { ...u, credits: u.credits + amount };
      }
      return u;
    }));
    // If selected user is open in detail drawer, update details
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, credits: prev.credits + amount }));
    }
  };

  // Add Design Token Simulator
  const handleAddToken = (e) => {
    e.preventDefault();
    if (!newTokenName || !newTokenValue) return;
    const token = {
      id: `t_${Date.now()}`,
      name: newTokenName,
      type: newTokenType,
      value: newTokenValue
    };
    setTokens(prev => [...prev, token]);
    setNewTokenName('');
    setNewTokenValue('');
    triggerToast(`Added design token: ${newTokenName}`, 'success');
  };

  // Add Coupon Simulator
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const coupon = {
      code: newCouponCode.toUpperCase().replace(/\s+/g, ''),
      discount: newCouponDiscount,
      type: newCouponType,
      usage: '0 times',
      status: 'Active'
    };
    setCoupons(prev => [...prev, coupon]);
    setNewCouponCode('');
    triggerToast(`Created promo code: ${coupon.code}`, 'success');
  };

  // Send Support reply simulator
  const handleSendTicketReply = () => {
    if (!ticketReplyText || !selectedTicket) return;
    setSupportTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        const updated = {
          ...t,
          messages: [...t.messages, { sender: 'admin', text: ticketReplyText }],
          status: 'Replied'
        };
        setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));
    setTicketReplyText('');
    triggerToast('Reply dispatched to client inbox', 'success');
  };

  // Create article composer simulator
  const handleCreateArticle = (e) => {
    e.preventDefault();
    if (!newDocTitle) return;
    const article = {
      id: `art_${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      status: 'Published',
      date: new Date().toISOString().split('T')[0]
    };
    setDocArticles(prev => [article, ...prev]);
    setNewDocTitle('');
    triggerToast(`Published documentation: "${newDocTitle}"`, 'success');
  };

  // Filter lists based on search queries
  const filteredUsers = useMemo(() => {
    const q = searchQueries.users.toLowerCase();
    return usersList.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.plan.toLowerCase().includes(q)
    );
  }, [usersList, searchQueries.users]);

  const filteredBookings = useMemo(() => {
    const q = searchQueries.bookings.toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesSearch = q === '' || 
        b.brandName.toLowerCase().includes(q) ||
        b.serviceType.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.userId.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQueries.bookings]);

  const filteredCustom = useMemo(() => {
    const q = searchQueries.repos.toLowerCase();
    return customProjects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q)
    );
  }, [customProjects, searchQueries.repos]);

  const filteredPresets = useMemo(() => {
    const q = searchQueries.repos.toLowerCase();
    return presetProjects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.industry.toLowerCase().includes(q)
    );
  }, [presetProjects, searchQueries.repos]);

  // Calculate stats summary
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const inProgressBookings = bookings.filter((b) => b.status === 'In Progress').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;

  // Chart Memo Calculations
  const chartData = useMemo(() => {
    return technicians.map((tech) => {
      const activeTasks = bookings.filter(
        (b) => b.assignedTechnicianId === tech.id && b.status !== 'Completed'
      ).length;
      return {
        name: tech.name.split(' ')[0],
        Tasks: activeTasks,
        fullName: tech.name,
        role: tech.role
      };
    });
  }, [technicians, bookings]);

  const industryData = useMemo(() => {
    return Object.entries(
      projects.reduce((acc, p) => {
        const ind = p.industry || 'Other';
        acc[ind] = (acc[ind] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const PIE_COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#10b981', '#f43f5e', '#eab308'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-extrabold">
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  // Roles access matrix configuration
  const [rolesPermissions, setRolesPermissions] = useState({
    SuperAdmin: { read: true, write: true, delete: true, refund: true },
    Moderator: { read: true, write: true, delete: false, refund: false },
    Support: { read: true, write: false, delete: false, refund: false },
    Finance: { read: true, write: true, delete: false, refund: true }
  });

  // Theme variables configurations
  const bgMain = darkMode 
    ? 'bg-[#03050d] text-slate-100 bg-[linear-gradient(to_right,rgba(14,165,233,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.02)_1px,transparent_1px)] bg-[size:32px_32px]' 
    : 'bg-[#f8fafc] text-slate-800 bg-[linear-gradient(to_right,rgba(14,165,233,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.012)_1px,transparent_1px)] bg-[size:32px_32px]';
    
  const bgHeader = darkMode ? 'bg-[#060918]/80 border-slate-800/80 backdrop-blur-lg' : 'bg-white/80 border-slate-200/60 shadow-sm backdrop-blur-lg';
  const bgSidebar = darkMode 
    ? 'bg-[#060918]/90 border-slate-800/80 backdrop-blur-lg' 
    : 'bg-white/90 border-slate-200/60 shadow-sm backdrop-blur-lg';
  const cardClass = 'backdrop-blur-md bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-sky-500/[0.005] rounded-2xl transition-all duration-300';
  const cardTitleClass = darkMode ? 'text-white' : 'text-slate-900';
  const cardDescClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const tableHeaderClass = darkMode ? 'bg-slate-900/40 border-slate-800/50 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700';
  const tableRowClass = darkMode ? 'hover:bg-sky-950/[0.08]' : 'hover:bg-sky-50/40';
  const selectClass = darkMode 
    ? 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-sky-500/50 backdrop-blur-sm' 
    : 'bg-white/80 border-slate-200 text-slate-800 hover:border-sky-500/50 shadow-sm backdrop-blur-sm';

  // Left Sidebar Tree Data structure
  const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart2
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    subItems: [
      { id: 'customers-users', label: 'Users' },
      { id: 'customers-orgs', label: 'Organizations' },
      { id: 'customers-teams', label: 'Teams' },
      { id: 'customers-activity', label: 'User Activity' }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: TrendingUp,
    subItems: [
      { id: 'marketplace-published', label: 'Published Kits' },
      { id: 'marketplace-featured', label: 'Featured' },
      { id: 'marketplace-reviews', label: 'Reviews' },
      { id: 'marketplace-downloads', label: 'Downloads' }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Calendar,
    subItems: [
      { id: 'orders-purchases', label: 'Purchases' },
      { id: 'orders-invoices', label: 'Invoices' },
      { id: 'orders-refunds', label: 'Refunds' },
      { id: 'orders-coupons', label: 'Coupons' }
    ]
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: Clock,
    subItems: [
      { id: 'subscriptions-plans', label: 'Plans' },
      { id: 'subscriptions-active', label: 'Active Subscriptions' },
      { id: 'subscriptions-trials', label: 'Trials' },
      { id: 'subscriptions-limits', label: 'Usage Limits' }
    ]
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: UserCheck,
    subItems: [
      { id: 'payments-transactions', label: 'Transactions' },
      { id: 'payments-gateways', label: 'Payment Gateways' },
      { id: 'payments-payouts', label: 'Payouts' },
      { id: 'payments-taxes', label: 'Taxes' }
    ]
  },
  {
    id: 'support',
    label: 'Support',
    icon: MessageSquare,
    subItems: [
      { id: 'support-tickets', label: 'Tickets' },
      { id: 'support-contact', label: 'Contact Forms' },
      { id: 'support-features', label: 'Feature Requests' }
    ]
  },
  {
    id: 'system',
    label: 'System Settings',
    icon: Settings,
    subItems: [
      { id: 'system-settings', label: 'General Settings' },
      { id: 'system-roles', label: 'Roles & Permissions' },
      { id: 'system-flags', label: 'Feature Flags' },
      { id: 'system-audit', label: 'Audit Logs' },
      { id: 'system-keys', label: 'API Keys' }
    ]
  },
  {
    id: 'developer',
    label: 'Developer Hub',
    icon: Terminal,
    subItems: [
      { id: 'developer-api', label: 'API Logs' },
      { id: 'developer-webhooks', label: 'Webhooks' },
      { id: 'developer-integrations', label: 'Integrations' }
    ]
  }
];

  // Helper for Breadcrumb path resolving
  const breadcrumbPath = useMemo(() => {
    for (const item of navigationItems) {
      if (item.subItems) {
        const match = item.subItems.find(sub => sub.id === activeSubModule);
        if (match) {
          return [item.label, match.label];
        }
      }
      if (item.id === activeSubModule || (item.id === 'dashboard' && activeSubModule.startsWith('dashboard-'))) {
        const subLabels = {
          'dashboard-overview': 'Overview',
          'dashboard-analytics': 'Analytics',
          'dashboard-activity': 'Recent Activity'
        };
        return [item.label, subLabels[activeSubModule] || item.label];
      }
    }
    return ['Admin', 'Control Panel'];
  }, [activeSubModule]);


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

        {/* Navigation Items */}
        <div className="space-y-1 px-4">
          {navigationItems.map((group) => {
            const isGroupExpanded = expandedSections[group.id];
            const IconComp = group.icon;
            const isSectionActive = activeSidebarSection === group.id;
            const hasSubItems = group.subItems && group.subItems.length > 0;
            
            return (
              <div key={group.id} className="space-y-0.5 relative group">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      if (sidebarCollapsed && !isMobile) {
                        setActiveSidebarSection(group.id);
                        setActiveSubModule(group.subItems[0].id);
                      } else {
                        toggleSection(group.id);
                      }
                    } else {
                      setActiveSidebarSection(group.id);
                      const defaults = {
                        'dashboard': 'dashboard-overview'
                      };
                      setActiveSubModule(defaults[group.id] || group.id);
                      if (isMobile) setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full flex items-center rounded-lg text-xs font-extrabold transition-all text-left cursor-pointer ${
                    sidebarCollapsed && !isMobile ? 'justify-center py-3' : 'justify-between px-3 py-2'
                  } ${
                    isSectionActive
                      ? 'bg-sky-500/5 text-sky-600 dark:text-sky-400' 
                      : 'text-slate-700 dark:text-slate-400 hover:bg-slate-500/5 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <IconComp size={14} className="shrink-0" />
                    {(!sidebarCollapsed || isMobile) && <span>{group.label}</span>}
                  </div>
                  {(!sidebarCollapsed || isMobile) && hasSubItems && (
                    <ChevronRight 
                      size={12} 
                      className={`transition-transform duration-200 text-slate-400 shrink-0 ${
                        isGroupExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Sub-menu drawer */}
                {(!sidebarCollapsed || isMobile) && isGroupExpanded && hasSubItems && (
                  <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-slate-200/50 dark:border-slate-800/60 ml-4.5 animate-in slide-in-from-left-1 duration-150">
                    {group.subItems.map((sub) => {
                      const isSubActive = activeSubModule === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveSidebarSection(group.id);
                            setActiveSubModule(sub.id);
                            if (isMobile) setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/10'
                              : 'text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-slate-900/20'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Collapsed Hover Flyout Sub-menu Popover */}
                 {sidebarCollapsed && !isMobile && hasSubItems && (
                   <div className="absolute left-full ml-1 top-0 py-2 w-48 rounded-xl border bg-slate-950 border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 translate-x-0.5 group-hover:translate-x-0 space-y-0.5 px-2">
                     <span className="block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/60 mb-1.5">
                       {group.label}
                     </span>
                     {group.subItems.map((sub) => {
                       const isSubActive = activeSubModule === sub.id;
                       return (
                         <button
                           key={sub.id}
                           onClick={() => {
                             setActiveSidebarSection(group.id);
                             setActiveSubModule(sub.id);
                           }}
                           className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer block ${
                             isSubActive
                               ? 'bg-sky-500 text-white shadow-md'
                               : 'text-slate-300 hover:bg-slate-900/50 hover:text-white'
                           }`}
                         >
                           {sub.label}
                         </button>
                       );
                     })}
                   </div>
                 )}

                {/* Collapsed Hover Tooltip Popover (Black background / White text) */}
                {sidebarCollapsed && !isMobile && !hasSubItems && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-bold rounded-xl shadow-lg border border-slate-800 bg-slate-950 text-white transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                    {group.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Profile */}
      <div className={`border-t border-slate-205/50 dark:border-slate-800/60 mt-auto flex flex-col bg-slate-500/[0.02] ${
        sidebarCollapsed && !isMobile ? 'p-3 items-center justify-center space-y-0' : 'p-4 space-y-3'
      }`}>
        <div className={`flex items-center overflow-hidden ${sidebarCollapsed && !isMobile ? 'justify-center space-x-0' : 'space-x-3'}`}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-md shadow-sky-500/10">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="overflow-hidden animate-in fade-in duration-200 text-left">
              <span className={`block text-xs font-black truncate ${cardTitleClass}`}>
                {user?.name || 'Admin User'}
              </span>
              <span className="block text-[10px] text-slate-455 dark:text-slate-500 truncate">
                {user?.email || 'admin@brandkit.ai'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 relative ${bgMain}`}>
      
      {darkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.06),transparent_70%)]" />
          <div className="absolute top-[-10%] right-[-5%] h-[400px] w-[400px] bg-sky-500/5 rounded-full blur-[130px] animate-pulse duration-[10000ms]" />
          <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] bg-indigo-500/5 rounded-full blur-[160px] animate-pulse duration-[8000ms]" />
        </div>
      )}
      {!darkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.03),transparent_70%)]" />
        </div>
      )}

      {/* Mobile Sidebar Backdrop/Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className={`relative flex flex-col w-64 h-full border-r shadow-2xl transition-all duration-300 ${bgSidebar} animate-in slide-in-from-left duration-250`}>
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
        {/* Header */}
        <header className={`h-16 shrink-0 border-b backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 transition-all duration-300 ${bgHeader}`}>
          <div className="flex items-center space-x-4">
            {/* Desktop Collapsible Trigger */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:block p-2 rounded-lg border transition-all cursor-pointer ${
                darkMode
                  ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white'
                  : 'border-slate-202 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
            
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 rounded-lg border md:hidden transition-all cursor-pointer ${
                darkMode
                  ? 'border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white'
                  : 'border-slate-202 hover:bg-slate-100 text-slate-606 hover:text-slate-906'
              }`}
            >
              <Menu size={15} />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <h2 className={`text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate max-w-20 sm:max-w-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {breadcrumbPath[1] || breadcrumbPath[0] || 'Dashboard'}
              </h2>
              <div className={`h-3.5 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className="flex items-center space-x-1 bg-sky-500/10 border border-sky-500/15 py-0.5 px-1.5 rounded-full shrink-0">
                <span className="text-[9px] sm:text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest font-mono">
                  Super Admin
                </span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 dark:text-slate-550">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search administration..."
                value={globalAdminSearch}
                onChange={(e) => setGlobalAdminSearch(e.target.value)}
                className={`pl-9 pr-4 py-1.5 text-xs font-semibold rounded-lg border outline-none transition-all w-32 sm:w-44 md:w-52 focus:w-60 focus:border-sky-500 ${
                  darkMode
                    ? 'bg-slate-950/60 border-slate-800 text-slate-200 focus:bg-slate-950'
                    : 'bg-slate-50/50 border-slate-200 text-slate-800 focus:bg-white focus:shadow-xs'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                  darkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-202 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Bell size={15} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 block animate-ping" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border p-4 shadow-2xl z-45 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white">
                  <div className="flex justify-between items-center border-b pb-2 mb-2 dark:border-slate-800">
                    <span className="font-extrabold uppercase">Notifications</span>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                      className="text-[10px] text-sky-500 font-bold hover:underline"
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2 rounded-lg ${n.read ? 'opacity-60' : 'bg-sky-500/5 border-l-2 border-l-sky-500'}`}>
                        {n.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                darkMode
                  ? 'border-slate-800 hover:bg-slate-900 text-slate-400'
                  : 'border-slate-202 hover:bg-slate-100 text-slate-605'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminViewMode('user')}
              className={`${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'} text-xs text-sky-600 dark:text-sky-400 flex items-center space-x-1 shrink-0`}
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Client Studio</span>
            </Button>
            
            <button
              onClick={logout}
              className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="p-4 sm:p-6 md:p-8 w-full space-y-8 flex-1 overflow-x-hidden">
          {activeSidebarSection === 'dashboard' && (
            <div className="flex border-b dark:border-slate-800 space-x-6 text-xs font-bold pb-2">
              <button
                onClick={() => setActiveSubModule('dashboard-overview')}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeSubModule === 'dashboard-overview'
                    ? 'border-sky-500 text-sky-500 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSubModule('dashboard-analytics')}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeSubModule === 'dashboard-analytics'
                    ? 'border-sky-500 text-sky-500 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveSubModule('dashboard-activity')}
                className={`pb-2 border-b-2 transition-all cursor-pointer ${
                  activeSubModule === 'dashboard-activity'
                    ? 'border-sky-500 text-sky-500 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                }`}
              >
                Recent Activity
              </button>
            </div>
          )}

                    {activeSubModule === 'dashboard-overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Dispatcher table */}
                <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div>
                        <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Service Request Dispatcher</h3>
                        <p className={`text-xs ${cardDescClass}`}>Manage, assign, and update booking records in real-time.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative shrink-0">
                          <input
                            type="text"
                            placeholder="Search dispatcher..."
                            value={searchQueries.bookings}
                            onChange={(e) => handleQueryChange('bookings', e.target.value)}
                            className={`text-xs rounded-lg pl-8 pr-3.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-bold w-52 ${
                              darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-850 shadow-sm'
                            }`}
                          />
                          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className={`flex border p-0.5 rounded-lg shrink-0 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                          {['all', 'Pending', 'In Progress', 'Completed'].map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setStatusFilter(filter)}
                              className={`text-[9px] px-2 py-1 rounded font-bold transition-all cursor-pointer border border-transparent ${
                                statusFilter === filter ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-455'
                              }`}
                            >
                              {filter === 'all' ? 'All' : filter}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                      <table className="w-full text-left text-xs min-w-[550px]">
                        <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                          <tr>
                            <th className="p-3">Client & Brand</th>
                            <th className="p-3">Service Details</th>
                            <th className="p-3">Assign Specialist</th>
                            <th className="p-3">Set Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                          {filteredBookings.map((b) => (
                            <tr key={b.id} className={`transition-colors ${tableRowClass}`}>
                              <td className="p-3">
                                <span className={`block font-semibold ${cardTitleClass}`}>{b.brandName}</span>
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{b.userId}</span>
                              </td>
                              <td className="p-3">
                                <span className={`block font-bold ${cardTitleClass}`}>{b.serviceType}</span>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 max-w-[200px] mt-0.5">{b.description}</p>
                              </td>
                              <td className="p-3">
                                <select
                                  value={b.assignedTechnicianId || ''}
                                  onChange={(e) => handleAssignTech(b.id, e.target.value || null)}
                                  className={`text-[11px] rounded-lg py-1 px-2 border w-full ${selectClass}`}
                                >
                                  <option value="">-- Assign Tech --</option>
                                  {technicians.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3">
                                <select
                                  value={b.status}
                                  onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                  className={`text-[11px] rounded-lg py-1 px-2 border font-bold ${selectClass} ${
                                    b.status === 'Completed' ? 'text-emerald-500' :
                                    b.status === 'In Progress' ? 'text-sky-500' : 'text-slate-400'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Assigned">Assigned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Specialists Workload list */}
                <Card className={`${cardClass} p-6 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <UserCheck className="text-sky-500 h-5 w-5 shrink-0" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">Specialist Workload</h3>
                    </div>
                    <p className="text-xs text-slate-500">Live active bookings assigned to design specialists.</p>
                  </div>
                  <div className={`border-t pt-4 mt-6 space-y-2.5 ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                    {technicians.map((t) => {
                      const assigned = bookings.filter(b => b.assignedTechnicianId === t.id && b.status !== 'Completed').length;
                      return (
                        <div key={t.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-500/5 border border-slate-800/5">
                          <div>
                            <span className="text-slate-850 dark:text-slate-200 font-bold block">{t.name}</span>
                            <span className="text-[9px] opacity-50 block">{t.role}</span>
                          </div>
                          <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                            assigned >= 2 ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'
                          }`}>
                            {assigned} Active
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Chart Widgets Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className={`${cardClass} p-6`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart2 className="text-sky-500 h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-350">Workload Statistics</h3>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke={darkMode ? '#6b7280' : '#475569'} fontSize={9} />
                        <YAxis stroke={darkMode ? '#6b7280' : '#475569'} fontSize={9} />
                        <Tooltip />
                        <Bar dataKey="Tasks" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className={`${cardClass} p-6`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="text-sky-500 h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-405 dark:text-slate-350">Industry Distribution</h3>
                  </div>
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={industryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          dataKey="value"
                        >
                          {industryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: DASHBOARD ANALYTICS */}
          {activeSubModule === 'dashboard-analytics' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className={`${cardClass} p-6 space-y-4`}>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${cardTitleClass}`}>Geographic Distribution</h3>
                  <div className="space-y-3 mt-4">
                    {[
                      { code: 'US', name: 'United States', share: '42%', width: 'w-[42%]' },
                      { code: 'DE', name: 'Germany', share: '15%', width: 'w-[15%]' },
                      { code: 'GB', name: 'United Kingdom', share: '12%', width: 'w-[12%]' },
                      { code: 'IN', name: 'India', share: '10%', width: 'w-[10%]' }
                    ].map(geo => (
                      <div key={geo.code} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{geo.name} ({geo.code})</span>
                          <span>{geo.share}</span>
                        </div>
                        <div className="w-full bg-slate-500/10 dark:bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full bg-sky-500 ${geo.width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className={`${cardClass} p-6 space-y-4`}>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${cardTitleClass}`}>Conversion Funnel</h3>
                  <div className="space-y-3 mt-4">
                    {[
                      { stage: 'Platform Visitors', val: '24,580 users', ratio: '100%', width: 'w-full' },
                      { stage: 'Account Signups', val: '8,420 users', ratio: '34.2%', width: 'w-[34%]' },
                      { stage: 'Brand Kits Created', val: '4,120 users', ratio: '16.7%', width: 'w-[17%]' },
                      { stage: 'Subscribed Users', val: '1,428 users', ratio: '5.8%', width: 'w-[6%]' }
                    ].map(stage => (
                      <div key={stage.stage} className="flex items-center space-x-3 text-xs">
                        <span className="w-32 font-semibold text-slate-400">{stage.stage}</span>
                        <div className="flex-1 bg-slate-500/10 dark:bg-slate-800/40 rounded-full h-4 overflow-hidden relative">
                          <div className={`h-full bg-sky-500/20 dark:bg-sky-500/10 border-r border-sky-500/40 ${stage.width}`} />
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{stage.val} ({stage.ratio})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: DASHBOARD RECENT ACTIVITY */}
          {activeSubModule === 'dashboard-activity' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${cardTitleClass}`}>Recent Platform Activity Feed</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {[
                  { time: '2 mins ago', type: 'Purchase', user: 'customer.john@gmail.com', desc: 'Purchased SaaS Pro Bundle for $149.00' },
                  { time: '15 mins ago', type: 'Publish', user: 'designer.apex@tech.io', desc: 'Published Neon Cyberwave template to global presets' },
                  { time: '1 hour ago', type: 'Registration', user: 'info@vectorlabs.net', desc: 'Registered new organization account (Vector Labs)' },
                  { time: '2 hours ago', type: 'Refund', user: 'admin.finance@brandkit.ai', desc: 'Issued refund of $49.00 to user.darth@suspicious.io' }
                ].map((act, index) => (
                  <div key={index} className="flex space-x-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4 relative py-2">
                    <span className="absolute -left-1.5 top-3.5 h-3.5 w-3.5 rounded-full border bg-white dark:bg-slate-900 border-sky-500 block" />
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-extrabold">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 uppercase tracking-widest">{act.type}</span>
                        <span>{act.user}</span>
                        <span className="text-slate-400 font-normal text-[10px]">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* VIEW: CUSTOMERS USERS */}
          {activeSubModule === 'customers-users' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Customer Accounts Manager</h3>
                  <p className={`text-xs ${cardDescClass}`}>Suspend, impersonate sessions, or credit token counts.</p>
                </div>
                <div className="relative shrink-0 w-64">
                  <input
                    type="text"
                    placeholder="Search customer email..."
                    value={searchQueries.users}
                    onChange={(e) => handleQueryChange('users', e.target.value)}
                    className={`text-xs rounded-lg pl-8 pr-3.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-bold w-full ${
                      darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  />
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Customer Profile</th>
                      <th className="p-3">Plan Tier</th>
                      <th className="p-3">Storage space</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3 cursor-pointer" onClick={() => { setSelectedUser(u); setUserDrawerTab('overview'); }}>
                          <span className={`block font-semibold hover:text-sky-500 transition-colors ${cardTitleClass}`}>{u.name}</span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500">{u.email}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">{u.plan}</td>
                        <td className="p-3 text-slate-500">{u.storage}</td>
                        <td className="p-3 font-bold text-sky-500">{u.credits} pts</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleImpersonateUser(u.email)}
                            className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white font-extrabold text-[10px] transition-all cursor-pointer"
                            title="Impersonate User"
                          >
                            Login
                          </button>
                          <button
                            onClick={() => handleToggleSuspendUser(u.id)}
                            className={`px-2 py-1 rounded font-extrabold text-[10px] transition-all cursor-pointer ${
                              u.status === 'Active' ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white' : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW: CUSTOMERS ORGS / TEAMS / ACTIVITY */}
          {['customers-orgs', 'customers-teams', 'customers-activity'].includes(activeSubModule) && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Organizations & Teams Control</h3>
              <p className="text-xs text-slate-500">Overview of client structure, active teams, and API usage stats.</p>
              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Organization Name</th>
                      <th className="p-3">Active Seats</th>
                      <th className="p-3">Subdomain Access</th>
                      <th className="p-3 text-right">Quota Limits</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {[
                      { name: 'Vector Labs Ltd', seats: '8 seats', domain: 'vectorlabs.brandkit.app', quota: 'Unlimited' },
                      { name: 'Design Studio LLC', seats: '4 seats', domain: 'designstudio.brandkit.app', quota: 'Pro 250 GB' },
                      { name: 'Corp Tech Systems', seats: '24 seats', domain: 'corptech.brandkit.app', quota: 'Enterprise SSO' }
                    ].map((org, index) => (
                      <tr key={index} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3 font-semibold text-slate-850 dark:text-slate-200">{org.name}</td>
                        <td className="p-3 font-medium text-slate-500">{org.seats}</td>
                        <td className="p-3 text-sky-500 font-mono text-[10px]">{org.domain}</td>
                        <td className="p-3 text-right font-bold">{org.quota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW: ALL BRAND KITS */}
          {activeSubModule === 'brandkits-all' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-end">
                <div className="relative shrink-0">
                  <input
                    type="text"
                    placeholder="Search brand kits..."
                    value={searchQueries.repos}
                    onChange={(e) => handleQueryChange('repos', e.target.value)}
                    className={`text-xs rounded-lg pl-8 pr-3.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-bold w-64 ${
                      darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  />
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Custom Brand Kits */}
                <Card className={`${cardClass} p-6 space-y-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className={`text-base font-extrabold flex items-center space-x-2.5 ${cardTitleClass}`}>
                        <Shield className="text-sky-500 h-5 w-5 shrink-0" />
                        <span>Custom Brand Kits Repository</span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                      <table className="w-full text-left text-xs min-w-[500px]">
                        <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                          <tr>
                            <th className="p-3">Brand Name</th>
                            <th className="p-3">Industry</th>
                            <th className="p-3">Colors</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                          {filteredCustom.map((project) => (
                            <tr key={project.id} className={`transition-colors ${tableRowClass}`}>
                              <td className="p-3">
                                <span className={`font-semibold ${cardTitleClass}`}>{project.name}</span>
                              </td>
                              <td className="p-3 text-slate-500">{project.industry}</td>
                              <td className="p-3">
                                <div className="flex space-x-1 items-center">
                                  <span className="h-3.5 w-3.5 rounded-full border block" style={{ backgroundColor: project.colors.primary }} />
                                  <span className="h-3.5 w-3.5 rounded-full border block" style={{ backgroundColor: project.colors.secondary }} />
                                </div>
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  onClick={() => {
                                    downloadBrandKitJSON(project);
                                    triggerToast(`Exported JSON specs for ${project.name}!`, 'success');
                                  }}
                                  className="p-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer border-none"
                                  title="Download JSON Spec"
                                >
                                  <FileText size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    downloadBrandKitMarkdown(project);
                                    triggerToast(`Downloaded Markdown specs for ${project.name}!`, 'success');
                                  }}
                                  className="p-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer border-none"
                                  title="Download Markdown Spec"
                                >
                                  <Download size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    downloadBrandKitPDF(project);
                                    triggerToast(`Downloaded PDF report for ${project.name}!`, 'success');
                                  }}
                                  className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer border-none"
                                  title="Download PDF Spec"
                                >
                                  <FileDown size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    setModifyingProject(project);
                                    setSelectedPresetId('');
                                    setConfirmOverwrite(false);
                                  }}
                                  className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white font-extrabold text-[10px] transition-all cursor-pointer border-none"
                                  title="Modify design system foundation"
                                >
                                  Modify
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      title: 'Delete Brand Kit',
                                      message: `Are you sure you want to delete kit "${project.name}"?`,
                                      onConfirm: () => {
                                        deleteProject(project.id);
                                        setConfirmDialog(null);
                                        triggerToast(`Deleted brand kit ${project.name}`, 'success');
                                      }
                                    });
                                  }}
                                  className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                  title="Delete Kit"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Global Brand Presets */}
                <Card className={`${cardClass} p-6 space-y-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <h3 className={`text-base font-extrabold flex items-center space-x-2.5 ${cardTitleClass}`}>
                      <Shield className="text-indigo-500 h-5 w-5 shrink-0" />
                      <span>Global Brand Kits Presets</span>
                    </h3>
                    <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                      <table className="w-full text-left text-xs min-w-[500px]">
                        <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                          <tr>
                            <th className="p-3">Brand Preset Name</th>
                            <th className="p-3">Industry</th>
                            <th className="p-3">Colors</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                          {filteredPresets.map((project) => (
                            <tr key={project.id} className={`transition-colors ${tableRowClass}`}>
                              <td className="p-3 font-semibold text-slate-800 dark:text-white">{project.name}</td>
                              <td className="p-3 text-slate-500">{project.industry}</td>
                              <td className="p-3">
                                <div className="flex space-x-1 items-center">
                                  <span className="h-3.5 w-3.5 rounded-full border block" style={{ backgroundColor: project.colors.primary }} />
                                  <span className="h-3.5 w-3.5 rounded-full border block" style={{ backgroundColor: project.colors.secondary }} />
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => downloadBrandKitPDF(project)}
                                  className="p-1 rounded bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-all cursor-pointer"
                                  title="Export PDF Guidelines"
                                >
                                  <Download size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW: DESIGN TOKENS EDITOR */}
          {activeSubModule === 'brandkits-categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Global Design Tokens Registry</h3>
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Token Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Token Value</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {tokens.map(t => (
                        <tr key={t.id} className={`transition-colors ${tableRowClass}`}>
                          <td className="p-3 font-semibold">{t.name}</td>
                          <td className="p-3 text-slate-500 font-mono">{t.type}</td>
                          <td className="p-3 font-mono text-[10px] text-sky-500">{t.value}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setTokens(prev => prev.filter(tok => tok.id !== t.id));
                                triggerToast(`Removed token ${t.name}`, 'info');
                              }}
                              className="text-red-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Creator Form */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Add Global Token</h3>
                <form onSubmit={handleAddToken} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Token Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Primary Sky"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Token Type</label>
                    <select
                      value={newTokenType}
                      onChange={(e) => setNewTokenType(e.target.value)}
                      className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}
                    >
                      <option value="Color">Color Hex</option>
                      <option value="Typography">Font Family</option>
                      <option value="Radius">Border Radius</option>
                      <option value="Shadow">Box Shadow</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Token Value</label>
                    <input
                      type="text"
                      placeholder="e.g. #0ea5e9"
                      value={newTokenValue}
                      onChange={(e) => setNewTokenValue(e.target.value)}
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md shadow-sky-500/10 cursor-pointer text-xs">
                    <Plus size={13} className="inline mr-1" />
                    <span>Publish Token</span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: COMPONENT LIBRARY */}
          {activeSubModule === 'brandkits-components' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Reusable UI Component Spec Library</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {components.map(c => (
                    <div key={c.id} className="border dark:border-slate-800/80 rounded-2xl p-4 bg-slate-500/[0.01] flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${cardTitleClass}`}>{c.name}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 uppercase tracking-widest">{c.category}</span>
                        </div>
                        <pre className="text-[10px] font-mono p-2 rounded-lg bg-slate-950 text-sky-400 border border-slate-850 overflow-x-auto max-h-24 mt-2">
                          <code>{c.code}</code>
                        </pre>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          triggerToast('Syntax code block copied to clipboard!', 'success');
                        }}
                        className="flex items-center space-x-1 text-[10px] text-sky-500 font-bold hover:underline cursor-pointer border-none bg-transparent"
                      >
                        <Clipboard size={11} />
                        <span>Copy Code Block</span>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Creator Form */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Add UI Component</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  triggerToast('Component spec registered successfully!', 'success');
                }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Component Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GlassButton"
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                    <select className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}>
                      <option>Buttons</option>
                      <option>Cards</option>
                      <option>Inputs</option>
                      <option>Navigation</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">JSX Code Syntax</label>
                    <textarea
                      placeholder="<button className='...'></button>"
                      rows="4"
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md shadow-sky-500/10 cursor-pointer text-xs">
                    <Plus size={13} className="inline mr-1" />
                    <span>Publish Component</span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: MARKETPLACE MODERATION */}
          {activeSubModule === 'marketplace-published' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Marketplace Published Kits</h3>
              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Brand Kit</th>
                      <th className="p-3">Publisher</th>
                      <th className="p-3">List Price</th>
                      <th className="p-3">Sales Rev</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">Moderation Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {[
                      { id: 'kit_1', name: 'Apex FinTech Pro', owner: 'john.d@brandkit.ai', price: '$89.00', revenue: '$3,560.00', rating: 4.8, status: 'Approved', verified: true },
                      { id: 'kit_2', name: 'Retro Cyberwave Space', owner: 'alex@techstartup.com', price: '$49.00', revenue: '$980.00', rating: 4.5, status: 'Pending Review', verified: false },
                      { id: 'kit_3', name: 'Corporate Minimalist', owner: 'director@corporate.com', price: '$129.00', revenue: '$14,244.00', rating: 4.9, status: 'Approved', verified: true }
                    ].map((kit) => (
                      <tr key={kit.id} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3">
                          <span className={`font-semibold ${cardTitleClass}`}>{kit.name}</span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">ID: {kit.id}</span>
                        </td>
                        <td className="p-3 text-slate-400">{kit.owner}</td>
                        <td className="p-3 font-semibold">{kit.price}</td>
                        <td className="p-3 font-bold text-emerald-500">{kit.revenue}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1 text-amber-500 font-bold">
                            <Star size={12} fill="#eab308" />
                            <span>{kit.rating}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {kit.status === 'Pending Review' ? (
                            <>
                              <button 
                                onClick={() => triggerToast('Marketplace listing approved!', 'success')}
                                className="px-2 py-1 rounded bg-emerald-500 text-white font-extrabold text-[9px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => triggerToast('Marketplace listing rejected.', 'info')}
                                className="px-2 py-1 rounded bg-red-500 text-white font-extrabold text-[9px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-emerald-500 font-extrabold bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2 rounded-full inline-block">
                              {kit.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW: ORDERS & REFUND MANAGER */}
          {activeSubModule === 'orders-purchases' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Orders Ledger</h3>
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Order Code</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Purchased Items</th>
                        <th className="p-3">Gross Total</th>
                        <th className="p-3">Gateway</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {filteredOrders.map(o => (
                        <tr key={o.id} className={`transition-colors ${tableRowClass}`}>
                          <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-355">{o.id}</td>
                          <td className="p-3 text-slate-400">{o.customer}</td>
                          <td className="p-3 font-semibold">{o.items}</td>
                          <td className="p-3 font-bold text-sky-500">{o.total}</td>
                          <td className="p-3 text-slate-550">{o.gateway}</td>
                          <td className="p-3 text-right">
                            {o.status === 'Refunded' ? (
                              <span className="text-[10px] text-red-500 font-extrabold bg-red-500/10 border border-red-500/20 py-0.5 px-2 rounded-full inline-block">
                                Refunded
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    title: 'Refund Transaction',
                                    message: `Are you sure you want to refund ${o.total} back to ${o.customer}?`,
                                    onConfirm: () => {
                                      setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: 'Refunded' } : item));
                                      setRefundedOrderIds(prev => [...prev, o.id]);
                                      setConfirmDialog(null);
                                      triggerToast(`Refund issued for order ${o.id}`, 'success');
                                    }
                                  });
                                }}
                                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-extrabold text-[9px] transition-all cursor-pointer border-none"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Coupon Creator */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Create Promo Coupon</h3>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SKYBLUE30"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Discount</label>
                      <input
                        type="text"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                          darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Type</label>
                      <select 
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value)}
                        className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Flat">Flat Cash</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md shadow-sky-500/10 cursor-pointer text-xs">
                    <span>Create Coupon</span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: INVOICES MANAGER */}
          {activeSubModule === 'orders-invoices' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 space-y-6`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Generated Invoices</h3>
                  <span className="text-[10px] text-slate-500">Transactions synced in real-time</span>
                </div>
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Invoice ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {filteredOrders.map(o => {
                        const invId = `inv_${o.id.substring(4)}`;
                        const isVoided = o.status === 'Refunded';
                        return (
                          <tr key={o.id} className={`transition-colors ${tableRowClass}`}>
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-355">{invId}</td>
                            <td className="p-3 text-slate-400">{o.customer}</td>
                            <td className="p-3 font-bold text-sky-500">{o.total}</td>
                            <td className="p-3 text-slate-500">{o.date}</td>
                            <td className="p-3">
                              <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full inline-block ${
                                isVoided 
                                  ? 'text-red-500 bg-red-500/10 border border-red-500/20' 
                                  : 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                              }`}>
                                {isVoided ? 'Voided' : 'Paid'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedInvoice(o)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white font-extrabold text-[9px] transition-all cursor-pointer border-none"
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* VIEW: REFUNDS MANAGER */}
          {activeSubModule === 'orders-refunds' && (() => {
            const refundedList = combinedOrders.filter(o => o.status === 'Refunded');
            const completedList = combinedOrders.filter(o => o.status === 'Completed');
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
                <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Refund Ledger</h3>
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 py-0.5 px-2.5 rounded-full uppercase">
                      Total Refunds: {refundedList.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                        <tr>
                          <th className="p-3">Refund Code</th>
                          <th className="p-3">Original Order</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                        {refundedList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500">No refunds issued.</td>
                          </tr>
                        ) : (
                          refundedList.map(o => {
                            const refId = `ref_${o.id.substring(4)}`;
                            return (
                              <tr key={o.id} className={`transition-colors ${tableRowClass}`}>
                                <td className="p-3 font-mono font-bold text-red-500">{refId}</td>
                                <td className="p-3 font-mono text-slate-400">{o.id}</td>
                                <td className="p-3 text-slate-400">{o.customer}</td>
                                <td className="p-3 font-bold text-red-500">-{o.total}</td>
                                <td className="p-3">
                                  <span className="text-[9px] font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 py-0.5 px-2 rounded-full inline-block">
                                    Processed
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Instant Refund Processor Card */}
                <Card className={`${cardClass} p-6 space-y-4`}>
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Issue Fast Refund</h3>
                  <p className="text-xs text-slate-500">Select a completed transaction from the system log to issue a direct gateway reversal refund.</p>
                  
                  {completedList.length === 0 ? (
                    <div className="p-4 border border-dashed rounded-lg text-center text-xs text-slate-500">
                      No active completed transactions available to refund.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Completed Transactions</label>
                        <select
                          id="instantRefundSelect"
                          className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}
                        >
                          {completedList.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.id} - {o.customer} ({o.total})
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        onClick={() => {
                          const selectEl = document.getElementById('instantRefundSelect');
                          const selectedOrderId = selectEl ? selectEl.value : null;
                          if (selectedOrderId) {
                            const o = completedList.find(item => item.id === selectedOrderId);
                            if (o) {
                              setConfirmDialog({
                                title: 'Fast Reversal Refund',
                                message: `Are you sure you want to issue a fast reversal of ${o.total} to ${o.customer}?`,
                                onConfirm: () => {
                                  setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: 'Refunded' } : item));
                                  setRefundedOrderIds(prev => [...prev, o.id]);
                                  setConfirmDialog(null);
                                  triggerToast(`Fast refund processed for order ${o.id}`, 'success');
                                }
                              });
                            }
                          }
                        }}
                        className="w-full bg-red-500 hover:bg-red-650 text-white font-extrabold py-2 px-4 rounded-lg shadow-md cursor-pointer text-xs"
                      >
                        Issue Refund
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            );
          })()}

          {/* VIEW: COUPONS MANAGER */}
          {activeSubModule === 'orders-coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Promo Coupon Codes</h3>
                  <span className="text-[10px] text-slate-500">Active system-wide discounts</span>
                </div>
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Coupon Code</th>
                        <th className="p-3">Discount</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Total Usages</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {coupons.map(c => (
                        <tr key={c.code} className={`transition-colors ${tableRowClass}`}>
                          <td className="p-3 font-mono font-extrabold text-sky-500">{c.code}</td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{c.discount}</td>
                          <td className="p-3 text-slate-400">{c.type}</td>
                          <td className="p-3 text-slate-500">{c.usage || '0 times'}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full inline-block ${
                              c.status === 'Active' 
                                ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' 
                                : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setCoupons(prev => prev.filter(item => item.code !== c.code));
                                triggerToast(`Deleted coupon: ${c.code}`, 'warning');
                              }}
                              className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer border-none"
                              title="Delete Coupon"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Coupon Creator */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Create Promo Coupon</h3>
                <form onSubmit={handleAddCoupon} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SKYBLUE30"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Discount</label>
                      <input
                        type="text"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                          darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Type</label>
                      <select 
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value)}
                        className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Flat">Flat Cash</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md shadow-sky-500/10 cursor-pointer text-xs">
                    <span>Create Coupon</span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: SUBSCRIPTIONS & LIMITS EDITORS */}
          {activeSubModule === 'subscriptions-limits' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Active Plan Usage Limits</h3>
                
                <div className="space-y-6">
                  {/* Storage Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Pro Storage Quota per organization</span>
                      <span className="text-sky-500">{subLimits.storage} GB</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={subLimits.storage}
                      onChange={(e) => setSubLimits(prev => ({ ...prev, storage: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* Exports Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Monthly Export downloads allowed</span>
                      <span className="text-sky-500">{subLimits.exports} files</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      value={subLimits.exports}
                      onChange={(e) => setSubLimits(prev => ({ ...prev, exports: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* API Calls Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Daily API rate limits</span>
                      <span className="text-sky-500">{subLimits.apiCalls} reqs/day</span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="200000"
                      step="5000"
                      value={subLimits.apiCalls}
                      onChange={(e) => setSubLimits(prev => ({ ...prev, apiCalls: parseInt(e.target.value) }))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => triggerToast('Sub limits configuration saved globally!', 'success')}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-6 rounded-lg text-xs cursor-pointer shadow-lg shadow-sky-500/10"
                  >
                    Save Tier Quotas
                  </Button>
                </div>
              </Card>

              {/* Plans tier stats overview */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Plan Demographics</h3>
                <div className="space-y-3">
                  {[
                    { tier: 'Enterprise Plan', count: '12 active orgs', icon: Shield },
                    { tier: 'Pro Plan', count: '542 users', icon: UserCheck },
                    { tier: 'Starter Plan', count: '812 users', icon: Clock },
                    { tier: 'Free Sandbox', count: '1,240 trial runs', icon: AlertCircle }
                  ].map((p, index) => (
                    <div key={index} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-500/5">
                      <div className="flex items-center space-x-2 font-bold">
                        <p.icon size={13} className="text-sky-500" />
                        <span>{p.tier}</span>
                      </div>
                      <span className="text-slate-400 font-semibold">{p.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* VIEW: PAYMENT GATEWAYS CONFIGURATION */}
          {activeSubModule === 'payments-gateways' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Active Payment Gateway Integrations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'stripe', name: 'Stripe Payments API', icon: UserCheck, desc: 'Accept credit cards, Apple Pay, Link globally.' },
                  { key: 'paypal', name: 'PayPal Commerce Checkout', icon: Globe, desc: 'Support international account transfers.' },
                  { key: 'lemonSqueezy', name: 'Lemon Squeezy Merchant', icon: Percent, desc: 'Digital asset tax compliance handler.' }
                ].map(gateway => (
                  <div key={gateway.key} className="flex justify-between items-center p-4 border dark:border-slate-800 rounded-2xl bg-slate-500/[0.01]">
                    <div className="flex space-x-3 items-start">
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                        <gateway.icon size={16} />
                      </div>
                      <div>
                        <span className={`font-bold block text-sm ${cardTitleClass}`}>{gateway.name}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{gateway.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newStatus = !gateways[gateway.key];
                        setGateways(prev => ({ ...prev, [gateway.key]: newStatus }));
                        triggerToast(`${gateway.name} ${newStatus ? 'Activated' : 'Deactivated'}`, 'info');
                      }}
                      className={`h-6 w-11 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                        gateways[gateway.key] ? 'bg-sky-500 flex justify-end' : 'bg-slate-300 dark:bg-slate-800 flex justify-start'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full bg-white block shadow-md" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* VIEW: MEDIA ASSET VAULT */}
          {activeSubModule === 'media-images' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Vector & Asset Library Vault</h3>
                  <p className={`text-xs ${cardDescClass}`}>Manage static illustration assets, brand icons, and font packages.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="fileUploadAdmin"
                    className="hidden"
                    onChange={() => triggerToast('Successfully uploaded brand asset to system cloud storage!', 'success')}
                  />
                  <label
                    htmlFor="fileUploadAdmin"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 cursor-pointer transition-all shadow-md shadow-sky-500/10 animate-in fade-in duration-100"
                  >
                    <Upload size={13} />
                    <span>Upload Asset File</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                  { name: 'logo_mark_white.svg', type: 'Logo SVGs', size: '24 KB' },
                  { name: 'avatar_placeholder.png', type: 'System Images', size: '112 KB' },
                  { name: 'outfit_font_bold.woff2', type: 'Fonts', size: '84 KB' },
                  { name: 'fintech_hero_illust.svg', type: 'Illustrations', size: '422 KB' }
                ].map((media, index) => (
                  <div key={index} className="border dark:border-slate-800/85 rounded-2xl p-4 bg-slate-500/[0.01] flex flex-col justify-between h-32 hover:border-sky-500/50 transition-colors">
                    <FolderOpen size={20} className="text-sky-500" />
                    <div>
                      <span className={`block font-bold text-xs truncate ${cardTitleClass}`}>{media.name}</span>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-semibold">
                        <span>{media.type}</span>
                        <span>{media.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* VIEW: CONTENT DOCUMENTATION */}
          {activeSubModule === 'content-docs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>System Knowledge Base Articles</h3>
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Article Title</th>
                        <th className="p-3">Folder Group</th>
                        <th className="p-3">Publish Date</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {docArticles.map(art => (
                        <tr key={art.id} className={`transition-colors ${tableRowClass}`}>
                          <td className="p-3 font-semibold text-slate-800 dark:text-white">{art.title}</td>
                          <td className="p-3 text-slate-500">{art.category}</td>
                          <td className="p-3 text-slate-500">{art.date}</td>
                          <td className="p-3 text-right">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                              art.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {art.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Creator Form */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Write Article</h3>
                <form onSubmit={handleCreateArticle} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Article Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Exporting spec guidelines"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Category Tag</label>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value)}
                      className={`text-xs rounded-lg py-2 px-3 border w-full font-bold ${selectClass}`}
                    >
                      <option value="Guides">General Guides</option>
                      <option value="API">Developer API</option>
                      <option value="Release Notes">Release Notes</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md shadow-sky-500/10 cursor-pointer text-xs">
                    <span>Publish Document</span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* VIEW: SUPPORT TICKETS */}
          {activeSubModule === 'support-tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <Card className={`${cardClass} p-6 lg:col-span-2 space-y-6`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Active Customer Tickets</h3>
                
                <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                      <tr>
                        <th className="p-3">Customer User</th>
                        <th className="p-3">Subject Topic</th>
                        <th className="p-3">Urgency</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                      {supportTickets.map(t => (
                        <tr key={t.id} className={`transition-colors ${tableRowClass} cursor-pointer`} onClick={() => setSelectedTicket(t)}>
                          <td className="p-3">
                            <span className={`block font-semibold ${cardTitleClass}`}>{t.user}</span>
                            <span className="block text-[9px] text-slate-500">{t.date}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{t.subject}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              t.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-550'
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-sky-500">{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ticket Chat Dialog simulation */}
                {selectedTicket && (
                  <div className="border dark:border-slate-800 rounded-2xl p-4 space-y-4 bg-slate-500/[0.01] animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center border-b pb-2 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-slate-400">Replying to:</span>
                        <span className={`block font-semibold ${cardTitleClass}`}>{selectedTicket.subject}</span>
                      </div>
                      <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white border-none bg-transparent">
                        <X size={15} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                      {selectedTicket.messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-2.5 rounded-2xl text-[11px] max-w-[80%] font-semibold ${
                            m.sender === 'admin' 
                              ? 'bg-sky-500 text-white rounded-tr-none' 
                              : 'bg-slate-500/10 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Write support dispatch response..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                          darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-805'
                        }`}
                      />
                      <button
                        onClick={handleSendTicketReply}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs py-2 px-4 rounded-lg cursor-pointer shrink-0 shadow-md shadow-sky-500/10 border-none"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Support stats card */}
              <Card className={`${cardClass} p-6 space-y-4`}>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Queue Statistics</h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span>Average Resolution:</span>
                    <span className="font-bold text-sky-500">14.2 mins</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span>Satisfaction score:</span>
                    <span className="font-bold text-sky-500">98.8% positive</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Common category:</span>
                    <span className="font-bold text-sky-500">Variables Exporters</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* VIEW: SYSTEM SETTINGS */}
          {activeSubModule === 'system-settings' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>General Brand System Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Platform Title Name</label>
                  <input
                    type="text"
                    defaultValue="BrandOS Brand Kit Builder"
                    className={`text-xs rounded-lg px-3 py-2 border w-full font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Custom Domain Host</label>
                  <input
                    type="text"
                    defaultValue="brandos.app"
                    className={`text-xs rounded-lg px-3 py-2 border w-full font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => triggerToast('General settings updated successfully!', 'success')}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-6 rounded-lg text-xs cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  Save Config
                </Button>
              </div>
            </Card>
          )}

          {/* VIEW: SYSTEM FEATURE FLAGS */}
          {activeSubModule === 'system-flags' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Beta Feature Toggles</h3>
              <p className="text-xs text-slate-500">Toggle live feature access flags across the client studio.</p>

              <div className="space-y-3">
                {[
                  { key: 'aiGeneration', name: 'AI Brand Kit Generator Assistant', desc: 'Allow users to query generator specs.' },
                  { key: 'marketplaceSell', name: 'Marketplace Vendor Publishing', desc: 'Enable custom designer marketplace upload pipelines.' },
                  { key: 'teamsCollaborate', name: 'Teams Real-time Workspace Collaboration', desc: 'Sync state modifications between active seats.' }
                ].map(flag => (
                  <div key={flag.key} className="flex justify-between items-center p-3.5 border dark:border-slate-800 rounded-xl bg-slate-500/[0.01]">
                    <div>
                      <span className={`font-bold block text-xs ${cardTitleClass}`}>{flag.name}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{flag.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        const newStatus = !featureFlags[flag.key];
                        setFeatureFlags(prev => ({ ...prev, [flag.key]: newStatus }));
                        triggerToast(`Feature flag ${flag.name} reconfigured`, 'info');
                      }}
                      className={`h-6 w-11 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                        featureFlags[flag.key] ? 'bg-sky-500 flex justify-end' : 'bg-slate-300 dark:bg-slate-800 flex justify-start'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full bg-white block shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* VIEW: SYSTEM ROLES ACCESS MATRIX */}
          {activeSubModule === 'system-roles' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Granular Access Control Matrix</h3>
              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Staff Role</th>
                      <th className="p-3">Read Modules</th>
                      <th className="p-3">Write Changes</th>
                      <th className="p-3">Delete Items</th>
                      <th className="p-3 text-right">Refund Orders</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {Object.entries(rolesPermissions).map(([role, perm]) => (
                      <tr key={role} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3 font-bold text-slate-850 dark:text-slate-200">{role}</td>
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={perm.read}
                            className="accent-sky-500 h-4 w-4 cursor-pointer"
                            onChange={() => triggerToast('Access matrix rule configured.', 'info')}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={perm.write}
                            className="accent-sky-500 h-4 w-4 cursor-pointer"
                            onChange={() => triggerToast('Access matrix rule configured.', 'info')}
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={perm.delete}
                            className="accent-sky-500 h-4 w-4 cursor-pointer"
                            onChange={() => triggerToast('Access matrix rule configured.', 'info')}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input 
                            type="checkbox" 
                            checked={perm.refund}
                            className="accent-sky-500 h-4 w-4 cursor-pointer"
                            onChange={() => triggerToast('Access matrix rule configured.', 'info')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW: SYSTEM AUDIT LOGS */}
          {activeSubModule === 'system-audit' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <h3 className={`text-base font-extrabold ${cardTitleClass}`}>System Audit logs</h3>
              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Admin Username</th>
                      <th className="p-3">Action Event</th>
                      <th className="p-3 text-right">Admin IP</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {auditLogsList.map((log, index) => (
                      <tr key={index} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3 text-slate-400 font-mono">{log.time}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-350">{log.admin}</td>
                        <td className="p-3 font-bold text-sky-500">{log.action}</td>
                        <td className="p-3 text-right font-mono text-[10px] text-slate-500">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* VIEW: DEVELOPER API & WEBHOOK EVENTS */}
          {activeSubModule === 'developer-api' && (
            <Card className={`${cardClass} p-6 space-y-6 animate-in fade-in duration-200`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Webhook Event Dispatcher</h3>
                  <p className="text-xs text-slate-500">Live webhook synchronizers and integrations logs.</p>
                </div>
                <button
                  onClick={() => triggerToast('Test webhook payload dispatched successfully to API endpoints!', 'success')}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs py-1.5 px-4 rounded-lg cursor-pointer transition-all shadow-md shadow-sky-500/10 flex items-center space-x-1 border-none"
                >
                  <Play size={11} />
                  <span>Send Test Event</span>
                </button>
              </div>

              <div className="overflow-x-auto border rounded-xl dark:border-slate-800/60 bg-slate-500/[0.01]">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={`text-xs uppercase font-semibold border-b ${tableHeaderClass}`}>
                    <tr>
                      <th className="p-3">Webhook URL Target</th>
                      <th className="p-3">Subscribed Event</th>
                      <th className="p-3">Delivery Status</th>
                      <th className="p-3 text-right">Integrations Mode</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-200/40'}`}>
                    {webhooks.map(wh => (
                      <tr key={wh.id} className={`transition-colors ${tableRowClass}`}>
                        <td className="p-3 text-sky-500 font-mono text-[10px]">{wh.url}</td>
                        <td className="p-3 font-semibold">{wh.event}</td>
                        <td className="p-3 text-emerald-500 font-bold">{wh.deliveries}</td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] text-sky-500 font-extrabold bg-sky-500/10 border border-sky-500/20 py-0.5 px-2 rounded">
                            {wh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* FALLBACK VIEW FOR OTHER MODULES */}
          {!['dashboard-overview', 'dashboard-analytics', 'dashboard-activity', 'customers-users', 'customers-orgs', 'customers-teams', 'customers-activity', 'brandkits-all', 'brandkits-categories', 'brandkits-components', 'marketplace-published', 'orders-purchases', 'orders-invoices', 'orders-refunds', 'orders-coupons', 'subscriptions-limits', 'payments-gateways', 'media-images', 'content-docs', 'support-tickets', 'system-settings', 'system-flags', 'system-roles', 'system-audit', 'developer-api'].includes(activeSubModule) && (
            <Card className={`${cardClass} p-8 text-center space-y-4 animate-in fade-in duration-200`}>
              <FolderOpen className="text-sky-500 h-12 w-12 mx-auto animate-pulse" />
              <div>
                <h3 className={`text-base font-extrabold ${cardTitleClass}`}>Active Workspace View Loaded</h3>
                <p className="text-xs text-slate-500 mt-1">This module is connected and syncing live data from API. Database transactions are secure.</p>
              </div>
              <Button 
                onClick={() => triggerToast('Synchronized data frame complete!', 'success')}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold py-2 px-6 rounded-lg shadow-md cursor-pointer"
              >
                Trigger Sync Frame
              </Button>
            </Card>
          )}

        </div>
      </main>

      

      {/* ========================================================
          USER DETAILS DRAWER PANEL
          ======================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSelectedUser(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between py-6 px-6 shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Customer account specs</span>
                  <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h3>
                  <span className="text-xs text-sky-500">{selectedUser.email}</span>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="p-1 rounded-lg border border-transparent hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all cursor-pointer bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer tab switcher */}
              <div className="flex border-b dark:border-slate-800 text-xs">
                {['overview', 'logs', 'actions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setUserDrawerTab(tab)}
                    className={`pb-2.5 px-4 font-bold border-b-2 capitalize transition-all cursor-pointer bg-transparent ${
                      userDrawerTab === tab 
                        ? 'border-sky-500 text-sky-500' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Drawer Tab Content */}
              {userDrawerTab === 'overview' && (
                <div className="space-y-4 text-xs font-bold mt-4">
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span className="text-slate-400">Membership Tier:</span>
                    <span className="text-sky-500">{selectedUser.plan} Tier</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span className="text-slate-400">Account Status:</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold ${
                      selectedUser.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span className="text-slate-400">API utilization:</span>
                    <span className="text-slate-600 dark:text-slate-300">{selectedUser.apiUsage}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-slate-800">
                    <span className="text-slate-400">Total Credits Available:</span>
                    <span className="text-sky-500">{selectedUser.credits} pts</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Member since:</span>
                    <span className="text-slate-500 font-mono">{selectedUser.joined}</span>
                  </div>
                </div>
              )}

              {userDrawerTab === 'logs' && (
                <div className="space-y-3 mt-4 font-semibold">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Recent Activity Log</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[
                      { time: '10 mins ago', desc: 'Downloaded Apex FinTech JSON spec' },
                      { time: '1 hour ago', desc: 'Generated palette via AI copilot' },
                      { time: 'Yesterday', desc: 'Modified typography settings: Outfit font' }
                    ].map((log, index) => (
                      <div key={index} className="p-2 border dark:border-slate-800 rounded-lg text-[11px] bg-slate-500/5">
                        <span className="font-mono text-[9px] text-slate-500">{log.time}</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{log.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userDrawerTab === 'actions' && (
                <div className="space-y-4 mt-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Administrative Actions</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleGiveCredits(selectedUser.id, 100)}
                      className="py-2.5 px-4 rounded-xl border border-sky-500/20 hover:border-sky-500/50 bg-sky-500/5 text-sky-600 dark:text-sky-400 font-extrabold text-xs transition-all cursor-pointer text-center"
                    >
                      Give +100 Credits
                    </button>
                    <button
                      onClick={() => {
                        handleToggleSuspendUser(selectedUser.id);
                        setSelectedUser(prev => ({ ...prev, status: prev.status === 'Active' ? 'Suspended' : 'Active' }));
                      }}
                      className={`py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all cursor-pointer text-center ${
                        selectedUser.status === 'Active' 
                          ? 'border border-red-500/20 hover:border-red-500/50 bg-red-500/5 text-red-500' 
                          : 'border border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-500/5 text-emerald-500'
                      }`}
                    >
                      {selectedUser.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => setSelectedUser(null)}
                variant="outline"
                className="text-xs font-extrabold py-2 px-4 rounded-lg cursor-pointer"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          INVOICE RECEIPT MODAL OVERLAY
          ======================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSelectedInvoice(null)} />
          
          <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-202 text-slate-800'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="text-sky-500 h-5 w-5" />
                  <span className="text-sm font-black tracking-widest uppercase">BrandOS Studio</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Invoice Receipt & Payment Confirmation</p>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Invoice Number</span>
                  <span className="font-mono font-bold">{`INV_${selectedInvoice.id.substring(4).toUpperCase()}`}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Date Issued</span>
                  <span className="font-semibold">{selectedInvoice.date}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Payment Method</span>
                  <span className="font-semibold">{selectedInvoice.gateway}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Status</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                    selectedInvoice.status === 'Refunded' 
                      ? 'text-red-500 bg-red-500/10 border border-red-500/20' 
                      : 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                    {selectedInvoice.status === 'Refunded' ? 'Voided / Refunded' : 'Paid'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 dark:border-slate-800">
                <span className="text-[9px] font-bold uppercase text-slate-400 block mb-2">Billed To</span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{selectedInvoice.customer}</span>
              </div>

              {/* Items Breakdown */}
              <div className="border-t pt-4 dark:border-slate-800 space-y-2">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Itemized Breakdown</span>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-500/5">
                  <span className="font-semibold">{selectedInvoice.items}</span>
                  <span className="font-bold">{selectedInvoice.total}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="text-sky-500">{selectedInvoice.total}</span>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex space-x-3 pt-4 border-t dark:border-slate-800">
              <Button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold py-2 px-4 rounded-lg shadow-md cursor-pointer text-xs text-center justify-center border-none"
              >
                <span>Print Invoice</span>
              </Button>
              <Button
                onClick={() => setSelectedInvoice(null)}
                variant="outline"
                className={`flex-1 font-bold py-2 px-4 rounded-lg text-xs justify-center ${
                  darkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-202 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Close</span>
              </Button>
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
                <h3 className={`text-base font-extrabold flex items-center space-x-2 ${cardTitleClass}`}>
                  <Sparkles className="text-sky-500 h-5 w-5" />
                  <span>Modify Design Foundation: {modifyingProject.name}</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Overwrite the design system tokens with a selected System Preset configuration.
                </p>
              </div>
              <button 
                onClick={() => setModifyingProject(null)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets Library Browser (Scrollable) */}
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
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-xs ${cardTitleClass}`}>{preset.name}</span>
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

              {/* Confirmation Dialog & Version Warning */}
              {selectedPresetId && (() => {
                const selectedPreset = presetProjects.find(p => p.id === selectedPresetId);
                return (
                  <div className={`p-4 border rounded-xl space-y-3 transition-all animate-in fade-in duration-300 ${
                    darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="text-amber-500 h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Design System Replacement Warning</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Applying <strong className="text-slate-800 dark:text-slate-100">"{selectedPreset?.name}"</strong> will replace the existing color scales, font mappings, padding, margins, shadows, and default icons of <strong className="text-slate-800 dark:text-slate-100">"{modifyingProject.name}"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-start space-x-2 text-[10px] text-slate-500 leading-relaxed">
                      <CheckCircle className="text-sky-500 h-4 w-4 shrink-0 mt-0.2" />
                      <span>
                        <strong>Automated Backup:</strong> A rollback point will be automatically generated as version <strong>v{(modifyingProject.changelog?.length || 0) + 1}.0</strong> in the Change Log. You can restore your original configurations at any time.
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
                );
              })()}
            </div>

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
                  if (!selectedPresetId) {
                    triggerToast('Please select a system preset first!', 'warning');
                    return;
                  }
                  if (!confirmOverwrite) {
                    triggerToast('Please explicitly check the overwrite confirmation box!', 'warning');
                    return;
                  }
                  const preset = presetProjects.find(p => p.id === selectedPresetId);
                  if (preset) {
                    applyPresetToProject(modifyingProject.id, selectedPresetId);
                    // Force state parameters to update workstation in UserDashboard
                    setActiveProject(modifyingProject.id);
                    setAdminViewMode('user');
                    setModifyingProject(null);
                    triggerToast(`Applied "${preset.name}" preset foundation. Workstation loaded!`, 'success');
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

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Action Confirmation Modal dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setConfirmDialog(null)} 
          />
          
          <div 
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200 ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 text-white shadow-black/80' 
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10 animate-pulse">
                <AlertCircle className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {confirmDialog.title}
                </h3>
                <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <Button
                onClick={() => setConfirmDialog(null)}
                variant="outline"
                className={`text-xs py-2 px-4 rounded-lg font-bold border transition-all cursor-pointer ${
                  darkMode ? 'border-slate-800 hover:bg-slate-909 text-slate-300' : 'border-slate-202 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDialog.onConfirm}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Dispatcher re-assignments
  function handleAssignTech(bookingId, techId) {
    const tech = technicians.find(t => t.id === techId);
    assignTechnician(bookingId, techId);
    if (tech) {
      triggerToast(`Assigned ${tech.name} to this service request.`, 'success');
    } else {
      triggerToast('Removed technician assignment.', 'info');
    }
  }

  function handleStatusChange(bookingId, status) {
    updateBookingStatus(bookingId, status);
    triggerToast(`Booking status updated to "${status}".`, 'success');
  }
}