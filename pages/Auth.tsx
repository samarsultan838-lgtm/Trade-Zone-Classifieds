import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, Loader2, Smartphone, Globe, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { locationService } from '../services/locationService.ts';
import { User } from '../types.ts';
import { COUNTRIES } from '../constants.ts';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Pakistan',
    password: ''
  });
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy to initialize account selection.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Simulate Google Account Selection Dialog
      await new Promise(r => setTimeout(r, 1500));
      
      const detectedCountry = locationService.detectUserCountry();
      const initialCredits = detectedCountry === 'Pakistan' ? 30 : 5;
      
      const googleUser: User = {
        id: `node_google_${Date.now()}`,
        name: "Verified Merchant (Google)",
        email: "merchant.node@gmail.com",
        isPremium: false,
        tier: 'Free',
        credits: initialCredits, 
        joinedAt: new Date().toISOString(),
        country: detectedCountry
      };

      // SYNCHRONOUS REGISTRY ANCHORING
      await storageService.updateUser(googleUser);
      storageService.setCurrentUser(googleUser);
      await storageService.broadcastToCloud();
      
      navigate('/workspace');
    } catch (err: any) {
      setError("Google account handshake failed. Node unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed && !isLogin) {
      setError("Legal consent required for node registration.");
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
           const guest = {
             id: 'user_guest',
             name: 'Guest Merchant',
             email: 'guest@trazot.com',
             isPremium: false,
             tier: 'Free' as any,
             credits: 30,
             joinedAt: new Date().toISOString()
           };
           storageService.setCurrentUser(guest);
           navigate('/workspace');
        } else {
          throw new Error("Credentials not recognized in the global ledger.");
        }
      } else {
        if (!formData.phone || formData.phone.length < 10) {
          throw new Error("Valid mobile node required for security verification.");
        }

        const check = storageService.isIdentifierUsed(formData.email, formData.phone);
        if (check.emailUsed) throw new Error("Email already anchored to an active node.");
        if (check.phoneUsed) throw new Error("Phone number already registered.");

        // REGIONAL PROVISIONING PROTOCOL
        const initialCredits = formData.country === 'Pakistan' ? 30 : 5;

        const newUser: User = {
          id: `node_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: formData.name,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          country: formData.country,
          isPremium: false,
          tier: 'Free',
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-white rounded-[40px] md:rounded-[64px] shadow-2xl overflow-hidden relative z-10 border border-white/10">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-emerald-900 text-white w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale" alt="Background" />
          </div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-12">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-white shadow-xl">
                 <Sparkles className="w-6 h-6" />
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
              <p className="text-sm font-bold">Immutable Merchant Registry</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-16 bg-white flex flex-col">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950 mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Node'}
            </h2>
            <p className="text-gray-400 font-medium">
              Secure identity synchronization for high-value trades.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <button 
              onClick={handleGoogleAuth}
              disabled={isLoading || (!agreed && !isLogin)}
              className={`w-full flex items-center justify-center gap-4 py-4.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] ${(!agreed && !isLogin) ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
            
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative px-4 bg-white text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">OR SECURE FORM</span>
            </div>
          </div>

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
              <>
                <div className="relative group">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="tel" 
                    required
                    placeholder="Active Phone Number" 
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
                  />
                </div>

                <div className="relative group">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                  <select 
                    value={formData.country}
                    onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-10 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                </div>
              </>
            )}

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Security Password" 
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4.5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-950 transition-all" 
              />
            </div>

            <div className="pt-2">
               <button 
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-3 group text-left"
               >
                  <div className={`mt-0.5 shrink-0 transition-colors ${agreed ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {agreed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight group-hover:text-emerald-700">
                    I agree to the <Link to="/terms" className="text-emerald-600 underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-600 underline">Privacy Protocol</Link>.
                  </span>
               </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || (!agreed && !isLogin)}
              className="w-full bg-emerald-600 text-white py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4 hover:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Log In' : 'Authorize Node'} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-auto pt-10 text-center">
            <p className="text-sm font-medium text-gray-500">
              {isLogin ? "New Merchant?" : "Already anchored?"}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                className="text-emerald-600 font-black uppercase tracking-widest hover:underline ml-2 transition-all"
              >
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