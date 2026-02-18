import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, Loader2, Smartphone, Globe, ChevronDown, CheckSquare, Square, X, LogIn } from 'lucide-react';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';
import { User } from '../types';
import { COUNTRIES } from '../constants';

const GoogleAccountPicker = ({ onSelect, onCancel }: { onSelect: (email: string, name: string) => void, onCancel: () => void }) => {
  const accounts = [
    { name: "Merchant Node (Primary)", email: "merchant.node@gmail.com", avatar: "M" },
    { name: "Trade Delegate", email: "delegate.alpha@gmail.com", avatar: "T" }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="p-8 text-center border-b border-gray-50">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-10 h-10 mx-auto mb-4" alt="Google" />
          <h3 className="text-xl font-bold text-gray-900">Choose an account</h3>
          <p className="text-gray-400 text-sm mt-1">to continue to <span className="text-emerald-600 font-bold">Trazot</span></p>
        </div>
        <div className="py-2">
          {accounts.map((acc, i) => (
            <button 
              key={i}
              onClick={() => onSelect(acc.email, acc.name)}
              className="w-full px-8 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black">{acc.avatar}</div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{acc.name}</p>
                <p className="text-xs text-gray-400">{acc.email}</p>
              </div>
            </button>
          ))}
          <button 
            onClick={() => onSelect("new.merchant@gmail.com", "New Merchant")}
            className="w-full px-8 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><UserIcon className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-gray-600">Use another account</p>
          </button>
        </div>
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <button onClick={onCancel} className="text-xs font-black uppercase text-gray-400 hover:text-emerald-600 tracking-widest">Cancel</button>
          <div className="flex gap-4 text-[10px] font-bold text-gray-300">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    password: ''
  });
  const navigate = useNavigate();

  const handleGoogleSelect = async (email: string, name: string) => {
    setShowGooglePicker(false);
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const detectedCountry = locationService.detectUserCountry();
      const initialCredits = detectedCountry === 'Pakistan' ? 30 : 5;
      
      const googleUser: User = {
        id: `node_google_${Date.now()}`,
        name: name,
        email: email,
        isPremium: false,
        tier: 'Free',
        credits: initialCredits, 
        joinedAt: new Date().toISOString(),
        country: detectedCountry
      };

      await storageService.updateUser(googleUser);
      storageService.setCurrentUser(googleUser);
      await storageService.broadcastToCloud();
      
      navigate('/workspace');
    } catch (err: any) {
      setError("Authorization failed. Please try the secure form.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed && !isLogin) {
      setError("Legal consent required for transmission node creation.");
      return;
    }

    setIsLoading(true);
    try {
      await storageService.syncWithCloud();

      if (isLogin) {
        const users = storageService.getUsers();
        const found = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
        
        if (found) {
          storageService.setCurrentUser(found);
          navigate('/workspace');
        } else if (formData.email === 'guest@trazot.com') {
           storageService.setCurrentUser({
             id: 'user_guest',
             name: 'Guest Merchant',
             email: 'guest@trazot.com',
             isPremium: false,
             credits: 30,
             joinedAt: new Date().toISOString()
           });
           navigate('/workspace');
        } else {
          throw new Error("Credentials not found in the Global Registry.");
        }
      } else {
        if (!formData.phone || formData.phone.length < 10) throw new Error("Valid mobile node required.");
        
        const check = storageService.isIdentifierUsed(formData.email, formData.phone);
        if (check.emailUsed) throw new Error("Email already anchored.");
        if (check.phoneUsed) throw new Error("Phone number already registered.");

        const initialCredits = formData.country === 'Pakistan' ? 30 : 5;
        const newUser: User = {
          id: `node_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: formData.name,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          country: formData.country,
          isPremium: false,
          credits: initialCredits,
          joinedAt: new Date().toISOString()
        };
        
        await storageService.updateUser(newUser);
        storageService.setCurrentUser(newUser);
        await storageService.broadcastToCloud();
        navigate('/workspace');
      }
    } catch (err: any) {
      setError(err.message || "Network authorization failure.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-emerald-950 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      {showGooglePicker && <GoogleAccountPicker onSelect={handleGoogleSelect} onCancel={() => setShowGooglePicker(false)} />}

      <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-white rounded-[40px] md:rounded-[64px] shadow-2xl overflow-hidden relative z-10 border border-white/10">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-emerald-900 text-white w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale" alt="Background" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-12">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-xl">
                 <Sparkles className="w-6 h-6 text-emerald-600" />
               </div>
               <span className="text-2xl font-black tracking-tight">Trazot</span>
            </Link>
            
            <h1 className="text-5xl font-serif-italic mb-6 leading-tight">
              Access the <br />
              <span className="text-emerald-400">Global Trade</span> <br />
              Network.
            </h1>
          </div>
          
          <div className="relative z-10 space-y-6 pt-12 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-400" /></div>
              <p className="text-sm font-bold">Institutional Registry Node</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-16 bg-white flex flex-col">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950 mb-2">
              {isLogin ? 'Welcome Back' : 'Initialize Node'}
            </h2>
            <p className="text-gray-400 font-medium">High-fidelity asset synchronization.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <button 
              onClick={() => {
                if (!agreed && !isLogin) {
                   setError("Accept terms to initialize Google handshake.");
                   return;
                }
                setShowGooglePicker(true);
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 py-4.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
            
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative px-4 bg-white text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">OR SECURE KEY</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500" />
                <input type="text" required placeholder="Legal Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-50 border-none rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950" />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500" />
              <input type="email" required placeholder="Verified Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-50 border-none rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950" />
            </div>

            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500" />
                  <input type="tel" required placeholder="Mobile Node" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-50 border-none rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950" />
                </div>
                <div className="relative group">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500" />
                  <select value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} className="w-full bg-gray-50 border-none rounded-[20px] py-4.5 pl-14 pr-10 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 appearance-none cursor-pointer">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500" />
              <input type="password" required placeholder="Security Key" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} className="w-full bg-gray-50 border-none rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950" />
            </div>

            {!isLogin && (
              <div className="pt-2">
                 <button type="button" onClick={() => setAgreed(!agreed)} className="flex items-start gap-3 group text-left">
                    <div className={`mt-0.5 shrink-0 transition-colors ${agreed ? 'text-emerald-600' : 'text-gray-300'}`}>
                      {agreed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">
                      I accept the <Link to="/terms" className="text-emerald-600 underline">Terms of Trade</Link> and <Link to="/privacy" className="text-emerald-600 underline">Privacy Protocol</Link>.
                    </span>
                 </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || (!agreed && !isLogin)}
              className="w-full bg-emerald-600 text-white py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4 hover:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Authorize' : 'Initialize'} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-auto pt-10 text-center">
            <p className="text-sm font-medium text-gray-500">
              {isLogin ? "New Merchant?" : "Already anchored?"}{' '}
              <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-emerald-600 font-black uppercase tracking-widest hover:underline ml-2 transition-all">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;