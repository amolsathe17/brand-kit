import React, { useEffect } from 'react';

// --- CARD COMPONENT ---
export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl border shadow-sm transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

// --- BUTTON COMPONENT ---
export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]';
  
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/10',
    glass: 'glass-panel text-white hover:bg-slate-800/60 border-slate-700',
    ai: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-indigo-500/25 ai-glow'
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-12 rounded-lg px-8 text-base',
    icon: 'h-10 w-10 p-0'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// --- INPUT COMPONENT ---
export function Input({ className = '', type = 'text', label, error, ...props }) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`flex h-10 w-full rounded-lg px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// --- MODAL COMPONENT ---
export function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- TOAST COMPONENT / STORE ---
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgTypes = {
    success: 'bg-emerald-500 border-emerald-600 shadow-emerald-500/15 text-white',
    error: 'bg-red-500 border-red-600 shadow-red-500/15 text-white',
    info: 'bg-blue-500 border-blue-600 shadow-blue-500/15 text-white',
    warning: 'bg-amber-500 border-amber-600 shadow-amber-500/15 text-white'
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-between space-x-6 rounded-xl border p-5 shadow-2xl animate-in zoom-in-95 duration-200 max-w-md w-[90%] md:w-auto min-w-[300px] ${bgTypes[type]}`}
    >
      <div className="text-sm font-semibold tracking-wide leading-relaxed">{message}</div>
      <button
        onClick={onClose}
        className="rounded-lg p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 font-bold text-xs"
      >
        ✕
      </button>
    </div>
  );
}
