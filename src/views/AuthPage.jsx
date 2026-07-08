import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Button, Input, Card } from '../components/UI';
import { Mail, Phone, Lock, Globe, Apple, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function AuthPage() {
  const { login, loginMobile, loginSocial, darkMode, toggleTheme } = useStore();
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'mobile'
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Mobile state
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  // General state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    
    // Simulate API request
    setTimeout(() => {
      const success = login(email, password, isAdmin ? 'admin' : 'user');
      setLoading(false);
      if (!success) {
        setErrorMessage('Invalid email or password.');
      }
    }, 1000);
  };

  const handleSendOtp = () => {
    if (!mobile) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }
    setOtpSent(true);
    setTimer(30);
    setErrorMessage('');
  };

  const handleMobileLogin = (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage('Please enter the OTP.');
      return;
    }
    if (otp !== '123456') {
      setErrorMessage('Invalid OTP. Use code 123456.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginMobile(mobile);
      setLoading(false);
    }, 1000);
  };

  // Social auth state
  const [socialModal, setSocialModal] = useState(null); // 'Google' | 'Apple' | null
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('google_client_id') || '');
  const [appleClientId, setAppleClientId] = useState(localStorage.getItem('apple_client_id') || '');
  const [appleRedirectUri, setAppleRedirectUri] = useState(localStorage.getItem('apple_redirect_uri') || '');
  
  // Custom simulated input fields
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  
  // Clean up deprecated/invalid sandbox client ID to prevent 403 load errors
  useEffect(() => {
    const storedId = localStorage.getItem('google_client_id');
    if (storedId === '1046985390977-plf1fipsh8bdticd79t2j0u325r26a76.apps.googleusercontent.com') {
      localStorage.removeItem('google_client_id');
      setGoogleClientId('');
    }
  }, []);

  const initializeGoogleGSI = () => {
    if (!window.google) return;
    
    const clientId = localStorage.getItem('google_client_id');
    if (!clientId) {
      // Exit early to prevent "given client ID is not found" 403 console warning/error.
      return;
    }
    
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const payload = decodeJwt(response.credential);
          if (payload) {
            loginSocial('Google', {
              email: payload.email,
              name: payload.name,
              avatar: payload.picture
            });
          }
        }
      });

      const googleBtnDiv = document.getElementById('google-native-btn');
      if (googleBtnDiv) {
        window.google.accounts.id.renderButton(
          googleBtnDiv,
          { 
            theme: darkMode ? 'filled_black' : 'outline', 
            size: 'large', 
            width: googleBtnDiv.clientWidth || 320,
            text: 'continue_with',
            shape: 'pill'
          }
        );
      }

      // Trigger One Tap
      window.google.accounts.id.prompt();
    } catch (e) {
      console.error("Google GSI Init error:", e);
    }
  };

  // Load SDKs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Google GSI script
      if (!document.getElementById('google-gsi-sdk')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-sdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleGSI();
        };
        document.body.appendChild(script);
      } else if (window.google) {
        initializeGoogleGSI();
      }
      // Apple Sign-In script
      if (!document.getElementById('apple-signin-sdk')) {
        const script = document.createElement('script');
        script.id = 'apple-signin-sdk';
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Re-run Google GSI rendering on theme change or mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google) {
        initializeGoogleGSI();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [darkMode]);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleRealLogin = () => {
    if (!googleClientId) {
      setErrorMessage('Please enter a valid Google Client ID.');
      return;
    }
    localStorage.setItem('google_client_id', googleClientId);
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (!window.google) {
        setErrorMessage('Google Sign-In SDK is loading. Please try again in a moment.');
        setLoading(false);
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`)
              .then(res => res.json())
              .then(userInfo => {
                loginSocial('Google', {
                  email: userInfo.email,
                  name: userInfo.name,
                  avatar: userInfo.picture
                });
                setSocialModal(null);
                setLoading(false);
              })
              .catch(err => {
                setLoading(false);
                setErrorMessage('Error fetching Google profile: ' + err.message);
              });
          } else {
            setLoading(false);
            setErrorMessage('Google authorization was cancelled or failed.');
          }
        }
      });
      client.requestAccessToken();
      
    } catch (err) {
      setLoading(false);
      setErrorMessage('Google Login Error: ' + err.message);
    }
  };

  const handleAppleRealLogin = (clientIdParam = null, redirectUriParam = null) => {
    const clientId = clientIdParam || appleClientId || 'com.brandkit.auth';
    const redirectUri = redirectUriParam || appleRedirectUri || window.location.origin;

    if (clientIdParam || (appleClientId && appleRedirectUri)) {
      localStorage.setItem('apple_client_id', clientId);
      localStorage.setItem('apple_redirect_uri', redirectUri);
    }
    
    try {
      setLoading(true);
      setErrorMessage('');

      if (!window.AppleID) {
        setErrorMessage('Apple Sign-In SDK is loading. Please try again in a moment.');
        setLoading(false);
        return;
      }

      window.AppleID.auth.init({
        clientId: clientId,
        scope: 'name email',
        redirectURI: redirectUri,
        state: 'auth_state',
        usePopup: true
      });
      
      window.AppleID.auth.signIn()
        .then((response) => {
          setLoading(false);
          if (response.user) {
            loginSocial('Apple', {
              email: response.user.email,
              name: `${response.user.name?.firstName || 'Apple'} ${response.user.name?.lastName || 'User'}`
            });
            setSocialModal(null);
          } else {
            const payload = decodeJwt(response.authorization.id_token);
            if (payload) {
              loginSocial('Apple', {
                email: payload.email,
                name: payload.email.split('@')[0]
              });
              setSocialModal(null);
            } else {
              setErrorMessage('Failed to decode Apple credentials.');
            }
          }
        })
        .catch((err) => {
          setLoading(false);
          setErrorMessage('Apple Sign-In Error: ' + (err.error || err.message));
        });
        
    } catch (err) {
      setLoading(false);
      setErrorMessage('Apple Login Error: ' + err.message);
    }
  };

  const handleSimulatedSocialLogin = (e) => {
    e.preventDefault();
    if (!customEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      loginSocial(socialModal, {
        email: customEmail,
        name: customName || `${socialModal} User`
      });
      setLoading(false);
      setSocialModal(null);
    }, 800);
  };

  const handleSocialLogin = (provider) => {
    setSocialModal(provider);
    setErrorMessage('');
  };

  const handleQuickSelect = (type) => {
    if (type === 'user') {
      setEmail('hello@brandkit.ai');
      setPassword('user1234');
      setIsAdmin(false);
    } else {
      setEmail('admin@brandkit.ai');
      setPassword('admin1234');
      setIsAdmin(true);
    }
    setAuthMethod('email');
  };

  // Define background gradient classes based on light/dark mode
  const pageBgClass = darkMode 
    ? 'bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#1a183d]' 
    : 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ff]';

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden p-4 transition-colors duration-300 ${pageBgClass}`}>
      
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/login-bg.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/brand.mp4" type="video/mp4" />
          <img
            src="/login-bg.jpg"
            alt="Design Collaboration Background"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* Image Overlay - Softens the image and adds contrast for the light card */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-[2px] z-10 pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] dark:opacity-[0.1]" style={{
        backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <div className="w-full max-w-md z-20">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Brand Kit & Design System
          </h1>
          <p className="text-xs text-white/80 mt-1.5 font-medium">
            Dream up and export premium brand guidelines in seconds.
          </p>
        </div>

        {/* Light Glassmorphic Login Card */}
        <Card className="glass-panel-light bg-white/70 border-white/45 shadow-2xl backdrop-blur-xl p-6 md:p-8 rounded-2xl text-slate-800">
          
          {/* Auth Method Toggle */}
          <div className="flex bg-slate-100/90 border border-slate-200/50 p-1 rounded-lg mb-5">
            <button
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail size={14} />
              <span>Email & Password</span>
            </button>
            <button
              onClick={() => {
                setAuthMethod('mobile');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                authMethod === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone size={14} />
              <span>Mobile OTP</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg font-medium flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. EMAIL FORM */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white/85 border border-slate-200/80 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 transition-colors placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/85 border border-slate-200/80 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 transition-colors placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Admin Role Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-semibold text-slate-505">Login as Administrator</span>
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2 text-white">
                {loading ? 'Signing in...' : 'Sign In with Email'}
              </Button>
            </form>
          )}

          {/* 2. MOBILE OTP FORM */}
          {authMethod === 'mobile' && (
            <form onSubmit={handleMobileLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Mobile Number</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={otpSent}
                      className="w-full bg-white/85 border border-slate-200/80 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 transition-colors disabled:opacity-50 placeholder:text-slate-400"
                    />
                  </div>
                  {!otpSent && (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      variant="outline"
                      className="whitespace-nowrap border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2.5"
                    >
                      Send OTP
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Verification Code (OTP)</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-white/85 border border-slate-200/80 rounded-lg py-2 px-4 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 transition-colors text-center font-mono tracking-widest text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-405">
                    <span>Simulated code: <strong>123456</strong></span>
                    {timer > 0 ? (
                      <span>Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-indigo-600 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full mt-2 text-white">
                    {loading ? 'Verifying...' : 'Verify & Log In'}
                  </Button>
                </div>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/70" />
            </div>
            {/* <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white/90 px-3 text-slate-400 font-bold rounded-full">Or continue with</span>
            </div> */}
          </div>

          {/* Social Logins */}
          <div className="space-y-3 flex flex-col items-center w-full">
            {/* Google Native Sign-In Button or Custom Fallback */}
            {googleClientId ? (
              <div id="google-native-btn" className="w-full flex justify-center min-h-[40px] transition-all" />
            ) : (
              <button
                onClick={() => {
                  setSocialModal('Google');
                  setErrorMessage('A Google Client ID is required for real OAuth. Please configure it below or run the Developer Simulated flow.');
                }}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-white/80 border border-slate-200/80 hover:bg-slate-50 rounded-full py-2.5 px-4 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
            
            {/* Apple Sign-In Button */}
            {/* <button
              onClick={() => handleSocialLogin('Apple')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-white/80 border border-slate-200/80 hover:bg-slate-50 rounded-full py-2.5 px-4 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Apple size={14} className="text-slate-800" />
              <span>Continue with Apple</span>
            </button> */}

            {/* Custom Client ID Configuration Settings Gear */}
            {/* <button 
              onClick={() => {
                setSocialModal('Google');
                setErrorMessage('');
              }}
              className="text-[10px] text-slate-400 hover:text-indigo-650 hover:underline cursor-pointer flex items-center space-x-1 mt-1"
            >
              <span>⚙️ Configure OAuth Client IDs</span>
            </button> */}
          </div>

          {/* Demo Accounts Panel */}
          <div className="mt-5 pt-4 border-t border-slate-200/60">
            {/* <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">Demo Account Access</span> */}
            <div className="space-y-1.5">
              <button
                onClick={() => handleQuickSelect('user')}
                className="w-full text-left bg-slate-50/80 border border-slate-200/50 hover:bg-slate-100/80 rounded-lg p-2 transition-colors flex items-center justify-between text-xs text-slate-700 cursor-pointer"
              >
                <span className="font-semibold">Client Workspace</span>
                <span className="text-[9px] text-slate-400">hello@brandkit.ai</span>
              </button>
              <button
                onClick={() => handleQuickSelect('admin')}
                className="w-full text-left bg-slate-50/80 border border-slate-200/50 hover:bg-slate-100/80 rounded-lg p-2 transition-colors flex items-center justify-between text-xs text-slate-700 cursor-pointer"
              >
                <span className="font-semibold">Admin Panel</span>
                <span className="text-[9px] text-slate-400">admin@brandkit.ai</span>
              </button>
            </div>
          </div>

        </Card>

        {/* Copyright Footer */}
        <div className="text-center mt-6 text-[10px] text-white/60 tracking-wider font-semibold uppercase">
          &copy; {new Date().getFullYear()} Antigravity Brand Kit. All rights reserved.
        </div>
      </div>
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSocialModal(null)} 
          />
          
          {/* Modal Container */}
          <div 
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200 bg-white border-slate-200 text-slate-800 shadow-slate-200/50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                {socialModal === 'Google' ? <Globe className="text-indigo-650 h-4 w-4" /> : <Apple className="text-slate-800 h-4 w-4" />}
                <span>Sign In with {socialModal}</span>
              </h3>
              <button 
                onClick={() => setSocialModal(null)}
                className="text-xs text-slate-400 hover:text-slate-655 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message specific to modal */}
            {errorMessage && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            {/* Layout Tab Selector */}
            <div className="space-y-4">
              
              {/* Option A: Real Credentials SDK Flow */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Option A: Real OAuth2 Integration</span>
                
                {socialModal === 'Google' ? (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Google Client ID</label>
                      <input
                        type="text"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="your-client-id.apps.googleusercontent.com"
                        className="w-full bg-white border border-slate-202 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-405 leading-normal">
                      Runs the official Google Client API flow. Access token is queried securely in-browser to get real user details.
                    </p>
                    <Button 
                      type="button" 
                      onClick={handleGoogleRealLogin} 
                      disabled={loading}
                      className="w-full text-white bg-indigo-650 hover:bg-indigo-600 text-xs py-2 cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Sign In with Real Google'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Apple Client ID (Services ID)</label>
                      <input
                        type="text"
                        value={appleClientId}
                        onChange={(e) => setAppleClientId(e.target.value)}
                        placeholder="com.yourdomain.service"
                        className="w-full bg-white border border-slate-202 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Redirect URI</label>
                      <input
                        type="text"
                        value={appleRedirectUri}
                        onChange={(e) => setAppleRedirectUri(e.target.value)}
                        placeholder="https://yourdomain.com/auth/callback"
                        className="w-full bg-white border border-slate-202 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-405 leading-normal">
                      Initializes AppleID Sign-In JS flow via secure redirect callback.
                    </p>
                    <Button 
                      type="button" 
                      onClick={() => handleAppleRealLogin()} 
                      disabled={loading}
                      className="w-full text-white bg-indigo-650 hover:bg-indigo-600 text-xs py-2 cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Sign In with Real Apple ID'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Option B: Simulated Sandbox Custom Credentials */}
              <div className="border border-dashed border-slate-202 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Option B: Simulated Developer Sandbox</span>
                
                <form onSubmit={handleSimulatedSocialLogin} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Real Name</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full bg-white border border-slate-202 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase tracking-wider">Real Email</label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="e.g. sarah@gmail.com"
                        className="w-full bg-white border border-slate-202 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-900 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-405 leading-normal">
                    Log in instantly with custom email credentials for local testing without needing any OAuth Setup.
                  </p>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs py-2 cursor-pointer"
                  >
                    Simulate login with Custom Credentials
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
