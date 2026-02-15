
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Chrome, Apple, Facebook, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, Loader2, Smartphone } from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { User } from '../types.ts';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Artificial delay for premium feel
    setTimeout(() => {
      if (isLogin) {
        // We look for users in the local registry or the cloud-synced registry
        const users = storageService.getUsers();
        const found = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
        
        if (found) {
          storageService.updateUser(found);
          setIsLoading(false);
          navigate('/workspace');
        } else {
          // Special check for hardcoded guest login if needed for testing, 
          // though usually users should just register.
          if (formData.email === 'guest@trazot.com') {
             storageService.updateUser({
               id: 'user_guest',
               name: 'Guest Merchant',
               email: 'guest@trazot.com',
               isPremium: false,
               tier: 'Free',
               credits: 5,
               joinedAt: new Date().toISOString()
             });
             navigate('/workspace');
          } else {
            setError("Merchant credentials not recognized. Please register a verified account.");
            setIsLoading(false);
          }
        }
      } else {
        // Registration Flow
        if (!formData.phone || formData.phone.length < 10) {
          setError("A valid contact phone number is required for asset verification.");
          setIsLoading(false);
          return;
        }

        const check = storageService.isIdentifierUsed(formData.email);
        if (check.used) {
          setError(`This email is already associated with an active Trade Node.`);
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          id: `user_${Math.random().toString(36).substring(7)}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          isPremium: false,
          tier: 'Free',
          credits: 5,
          joinedAt: new Date().toISOString()
        };
        
        storageService.updateUser(newUser);
        setIsLoading(false);
        navigate('/workspace');
      }
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setError("SSO (Single Sign-On) currently requires manual profile completion for regional compliance. Please use the registration form.");
    // In a real app, this would redirect to Google OAuth. 
    // Here we disable the "merchant@gmail.com" placeholder to keep data clean.
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-emerald-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-white rounded-[40px] md:rounded-[64px] shadow-2xl overflow-hidden relative z-10 border border-white/10">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-emerald-900 text-white w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale" alt="Background" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-12">
               <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                 <Sparkles className="w-6 h-6" />
               </div>
               <span className="text-2xl font-black tracking-tight">Trazot</span>
            </Link>
            
            <h1 className="text-5xl font-serif-italic mb-6 leading-tight">
              Access the <br />
              <span className="text-emerald-400">Global Trade</span> <br />
              Network.
            </h1>
            <p className="text-emerald-100/60 text-lg font-light leading-relaxed max-w-sm">
              Register your legal identity to initiate asset transmission and trade with verified participants.
            </p>
          </div>
          
          <div className="relative z-10 space-y-6 pt-12 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-400" /></div>
              <p className="text-sm font-bold">Encrypted Communication Hub</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-16 bg-white flex flex-col">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950 mb-2">
              {isLogin ? 'Vault Entry' : 'Merchant Signup'}
            </h2>
            <p className="text-gray-400 font-medium">
              {isLogin ? 'Manage your assets with secure authorization.' : 'Provide verified contact details to receive 5 trade credits.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Full Legal Name" 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="email" 
                required
                placeholder="Verified Email Address" 
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="tel" 
                  required
                  placeholder="Active Phone Number (e.g. +92...)" 
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
                />
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Network Security Password" 
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-6 hover:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Authorize Access' : 'Create Merchant Identity'} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-auto pt-10 text-center">
            <p className="text-sm font-medium text-gray-500">
              {isLogin ? "New to the Network?" : "Already have a node key?"}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                className="text-emerald-600 font-black uppercase tracking-widest hover:underline ml-2 transition-all"
              >
                {isLogin ? 'Register Node' : 'Authorize Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
