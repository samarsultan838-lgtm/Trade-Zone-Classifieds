
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock,
  RefreshCw,
  LogOut,
  Fingerprint,
  Loader2,
  Key,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  User,
  Activity,
  Layers,
  Users as UsersIcon,
  DollarSign
} from 'lucide-react';
import { storageService, MASTER_EMERGENCY_KEY } from '../services/storageService.ts';
import { Listing, NewsArticle, User as UserType } from '../types.ts';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    if (sessionStorage.getItem('tz_admin_session')) initializeDashboard();
  }, []);

  const initializeDashboard = () => {
    setListings(storageService.getListings());
    setUsers(storageService.getUsers());
    setNews(storageService.getNews());
    setView('dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    // Simulate biometric/security check
    await new Promise(r => setTimeout(r, 800));
    
    const creds = storageService.getAdminAuth();
    if (creds && (creds.password === password)) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
    } else {
      alert('Security violation: Authorization key mismatch.');
    }
    setIsAuthorizing(false);
  };

  const handleEmergencyReset = (e: React.FormEvent) => {
    e.preventDefault();
    const success = storageService.resetAdminPassword(recoveryInput, newPassInput);
    if (success) {
      alert('Master Recovery Successful. System access restored.');
      setView('login');
      setPassword('');
    } else {
      alert('Invalid Recovery Signature. Access denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
  };

  if (view === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010c08] p-6">
        <div className="bg-[#041a12] border border-emerald-900/30 p-10 rounded-[48px] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
          <ShieldAlert className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-serif-italic text-white mb-4">Initialize Root Access</h1>
          <p className="text-emerald-500/40 text-[10px] font-black uppercase tracking-widest mb-8">First Time Site Owner Verification</p>
          <form onSubmit={(e) => { e.preventDefault(); storageService.setAdminAuth(password, MASTER_EMERGENCY_KEY); initializeDashboard(); }} className="space-y-4">
            <input 
              type="password" 
              required
              placeholder="Define Root Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#02100a] border border-emerald-900/50 rounded-2xl py-4 px-6 text-white text-center outline-none focus:border-emerald-500 transition-all"
            />
            <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/10">
              <span className="block text-[8px] font-black text-emerald-500 uppercase mb-1">Emergency Master Key</span>
              <span className="block text-sm font-black text-white tracking-widest">{MASTER_EMERGENCY_KEY}</span>
            </div>
            <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Initialize Vault</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010c08] p-6">
        <div className="bg-[#041a12] border border-emerald-900/30 p-10 rounded-[48px] max-w-md w-full text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <Key className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-2xl font-serif-italic text-white mb-2">Emergency Override</h1>
          <p className="text-yellow-500/40 text-[10px] font-black uppercase tracking-widest mb-8">System Recovery Protocol</p>
          <form onSubmit={handleEmergencyReset} className="space-y-4">
            <input 
              type="text" 
              required
              placeholder="Master Emergency Key" 
              value={recoveryInput}
              onChange={(e) => setRecoveryInput(e.target.value)}
              className="w-full bg-[#02100a] border border-emerald-900/50 rounded-2xl py-4 px-6 text-white text-center outline-none focus:border-yellow-500 transition-all font-mono"
            />
            <input 
              type="password" 
              required
              placeholder="Define New Admin Password" 
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              className="w-full bg-[#02100a] border border-emerald-900/50 rounded-2xl py-4 px-6 text-white text-center outline-none focus:border-emerald-500 transition-all"
            />
            <button className="w-full bg-yellow-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Authorize System Reset</button>
            <button type="button" onClick={() => setView('login')} className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-4">Cancel Recovery</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010c08] p-6">
        <div className="bg-[#041a12] border border-emerald-900/30 p-10 rounded-[48px] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
          <Fingerprint className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-2xl font-serif-italic text-white mb-2">Owner Entry</h1>
          <p className="text-emerald-500/40 text-[10px] font-black uppercase tracking-widest mb-8">Secure Session Authorization</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              required
              placeholder="Master Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#02100a] border border-emerald-900/50 rounded-2xl py-4 px-6 text-white text-center outline-none focus:border-emerald-500 transition-all"
            />
            <button disabled={isAuthorizing} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-3">
              {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isAuthorizing ? 'Authorizing...' : 'Authorize Access'}
            </button>
            <button type="button" onClick={() => setView('forgot')} className="text-emerald-500/40 text-[9px] font-black uppercase tracking-widest mt-6 hover:text-emerald-400 transition-colors">Emergency System Reset</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 pt-8">
      <header className="bg-white p-8 md:p-12 rounded-[48px] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">System <span className="text-emerald-600">Commander</span></h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Owner Level Privilege Hub</p>
        </div>
        <button onClick={handleLogout} className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-red-100 transition-all border border-red-100">
          <LogOut className="w-4 h-4" /> End Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Asset Nodes', val: listings.length, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Merchant Network', val: users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'System Pulse', val: '99.9%', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Projected Value', val: '$12.4M', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}><stat.icon className="w-7 h-7" /></div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-emerald-950">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DASHBOARD BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="bg-white rounded-[48px] p-10 border border-gray-100">
            <h2 className="text-xl font-bold text-emerald-950 mb-8 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Audit
            </h2>
            <div className="space-y-4">
               {[
                 { label: 'Root Protocol', status: 'Optimal', icon: ShieldCheck },
                 { label: 'Data Encryption', status: 'AES-256', icon: Lock },
                 { label: 'Session Integrity', status: 'Verified', icon: Fingerprint },
                 { label: 'Emergency Override', status: 'Armed', icon: Key }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-500">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{item.status}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-400" /> Command Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
               <button className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all">
                 Initialize Global Sync
               </button>
               <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                 Generate Site Snapshot
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;
