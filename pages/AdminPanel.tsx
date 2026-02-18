import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock,
  LogOut,
  Loader2,
  ShieldAlert,
  Layers,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Newspaper,
  Eye,
  Terminal,
  Database,
  Server,
  Globe,
  Clock,
  Zap,
  Cpu,
  Key as KeyIcon,
  Search,
  ChevronRight,
  Settings as SettingsIcon,
  RefreshCw,
  Trash2,
  Coins,
  ArrowRight
} from 'lucide-react';
import { storageService, MASTER_EMERGENCY_KEY, OFFICIAL_DOMAIN } from '../services/storageService.ts';
import { NewsArticle, AdStatus, Listing, User } from '../types.ts';
import { Link } from 'react-router-dom';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';
type DashboardSubView = 'overview' | 'listings' | 'news' | 'users' | 'settings';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [subView, setSubView] = useState<DashboardSubView>('overview');
  const [passwordInput, setPasswordInput] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [dbHealth, setDbHealth] = useState<any>({ status: 'Standby...', latency: 0, db_status: 'Ready' });
  const [globalCreditAmount, setGlobalCreditAmount] = useState('50');

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    
    if (sessionStorage.getItem('tz_admin_session') === 'true') {
      initializeDashboard();
    }
  }, []);

  const initializeDashboard = async () => {
    const currentListings = storageService.getListings();
    const currentUsers = storageService.getUsers();
    const currentNews = storageService.getNews();
    setListings(currentListings);
    setUsers(currentUsers);
    setNews(currentNews);
    storageService.getBackendHealth().then(health => setDbHealth(health));
    setView('dashboard');
  };

  // Add handleSetup to process initial admin credential creation
  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.length < 6) return alert('Password must be at least 6 characters.');
    const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    storageService.setAdminAuth(passwordInput, generatedKey);
    setSetupKey(generatedKey);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 800));
    
    const input = passwordInput.trim();
    const creds = storageService.getAdminAuth();

    const isMasterBypass = (input === MASTER_EMERGENCY_KEY);
    const isUserMatch = creds && (input === creds.password);

    if (isMasterBypass || isUserMatch) {
      sessionStorage.setItem('tz_admin_session', 'true');
      sessionStorage.setItem('tz_admin_tier', isMasterBypass ? 'sovereign' : 'admin');
      initializeDashboard();
    } else {
      alert('SECURITY PROTOCOL VIOLATION: Unauthorized Key Signature.');
    }
    setIsAuthorizing(false);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const success = storageService.resetAdminPassword(recoveryInput, newPassInput);
    if (success) {
      alert('Credentials updated. Authorized for Login.');
      setView('login');
      setPasswordInput('');
      setRecoveryInput('');
      setNewPassInput('');
    } else {
      alert('Invalid Recovery Key.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    sessionStorage.removeItem('tz_admin_tier');
    setView('login');
    setPasswordInput('');
  };

  const handleApprove = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      const updated = { ...listing, status: AdStatus.ACTIVE };
      await storageService.saveListing(updated);
      setListings(storageService.getListings());
    }
  };

  const handleReject = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      const updated = { ...listing, status: AdStatus.REJECTED };
      await storageService.saveListing(updated);
      setListings(storageService.getListings());
    }
  };

  const handleAwardGlobal = async () => {
    const amount = parseInt(globalCreditAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid allocation quantity.');
    if (confirm(`Authorize global injection of ${amount} Trade Credits to ${users.length} verified nodes?`)) {
      await storageService.awardGlobalCredits(amount);
      setUsers(storageService.getUsers());
      alert('Global Pulse Complete: Credits Provisioned.');
    }
  };

  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8"><ShieldCheck className="w-10 h-10 text-emerald-500" /></div>
          <h1 className="text-3xl font-serif-italic mb-2">First Time Setup</h1>
          {setupKey ? (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-950/50 rounded-2xl border border-emerald-500/20"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Master Recovery Key</p><div className="text-2xl font-black tracking-[0.2em]">{setupKey}</div></div>
              <p className="text-xs text-emerald-100/40 leading-relaxed font-medium">Save this key immediately. It is the ONLY way to reset your login at any position.</p>
              <button onClick={() => setView('login')} className="w-full bg-emerald-500 text-[#064e3b] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Saved, Proceed to Node</button>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-6">
              <p className="text-emerald-100/60 text-sm mb-4">Establish your primary administrative signature.</p>
              <input type="password" required placeholder="New Secure Signature" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-500/10 rounded-2xl py-5 text-center font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
              <button className="w-full bg-emerald-500 text-[#064e3b] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Initialize Node</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
          <button onClick={() => setView('login')} className="text-[10px] font-black uppercase text-emerald-500 mb-8 flex items-center gap-2 hover:text-emerald-400 transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Back to Entry</button>
          <div className="text-center mb-8"><RefreshCw className="w-12 h-12 text-yellow-500 mx-auto mb-4" /><h1 className="text-2xl font-serif-italic">Reset Signature</h1></div>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 ml-2">Master Recovery Key</label><input required type="text" value={recoveryInput} onChange={e => setRecoveryInput(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" className="w-full bg-emerald-950/50 border border-emerald-500/10 rounded-2xl py-5 text-center font-black tracking-widest outline-none focus:ring-2 focus:ring-yellow-500" /></div>
            <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 ml-2">New Signature</label><input required type="password" value={newPassInput} onChange={e => setNewPassInput(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-500/10 rounded-2xl py-5 text-center font-bold outline-none focus:ring-2 focus:ring-yellow-500" /></div>
            <button className="w-full bg-yellow-500 text-yellow-950 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Authorize Reset</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
        <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative inline-block"><div className="w-20 h-20 bg-emerald-400/10 rounded-2xl flex items-center justify-center relative"><Terminal className="w-10 h-10 text-[#10b981]" /><div className="absolute inset-0 border border-emerald-400/20 rounded-2xl animate-pulse" /></div></div>
          <div className="space-y-4"><h1 className="text-4xl md:text-5xl font-serif-italic tracking-tight">Bureau Access Required</h1><p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/50">Node Integrity Protocol Active</p></div>
          <form onSubmit={handleLogin} className="w-full space-y-6">
             <div className="relative group"><input type="password" autoFocus required placeholder="Enter Secure Signature..." value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-[#043327] border-none rounded-none py-6 px-4 text-center font-mono text-xl tracking-[0.3em] outline-none focus:bg-[#054536] transition-all placeholder:text-emerald-900/30 text-white" /><div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400/10 group-focus-within:bg-emerald-400 transition-all" /></div>
             <button type="submit" disabled={isAuthorizing} className="w-full bg-[#10b981] text-[#064e3b] py-5 rounded-none font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
               {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Secure Node'}
             </button>
             <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900 hover:text-emerald-400 transition-colors">Forgot Signature?</button>
          </form>
          <div className="pt-12"><Link to="/" className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-900 hover:text-emerald-400 transition-colors">Terminate Session</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 pt-8 animate-in fade-in duration-700">
      <header className="bg-white p-6 md:p-10 rounded-[40px] md:rounded-[64px] border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#064e3b] rounded-3xl flex items-center justify-center text-[#10b981] shadow-2xl"><ShieldCheck className="w-10 h-10" /></div>
          <div>
            <div className="flex items-center gap-3"><h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">Bureau <span className="text-[#10b981]">Command</span></h1><span className="px-3 py-1 bg-emerald-950 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest">{sessionStorage.getItem('tz_admin_tier')} Mode</span></div>
            <p className="text-gray-400 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] mt-2">Authority Node • {OFFICIAL_DOMAIN}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-red-100 transition-all border border-red-100 shadow-sm shadow-red-100"><LogOut className="w-4 h-4" /> Log Out</button>
        </div>
      </header>

      <div className="flex gap-3 mb-10 overflow-x-auto scrollbar-hide pb-2 px-1">
        {[
          { id: 'overview', label: 'Infrastructure', icon: Database },
          { id: 'listings', label: 'Ledger Oversight', icon: Layers },
          { id: 'news', label: 'Editorial Office', icon: Newspaper },
          { id: 'users', label: 'Citizen Ledger', icon: UsersIcon },
          { id: 'settings', label: 'Node Settings', icon: SettingsIcon }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setSubView(tab.id as any)} className={`px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shrink-0 border ${subView === tab.id ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl scale-[1.02] z-10' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100'}`}>
            <tab.icon className={`w-4.5 h-4.5 ${subView === tab.id ? 'text-emerald-400' : ''}`} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[48px] p-6 md:p-16 border border-gray-100 shadow-sm min-h-[600px] animate-in fade-in duration-1000">
        {subView === 'overview' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4"><h2 className="text-4xl md:text-6xl font-serif-italic text-emerald-950">Relay <span className="text-emerald-600">Health Monitor</span></h2><div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="bg-emerald-950 p-10 rounded-[48px] border border-emerald-900 text-white relative overflow-hidden group">
                  <Server className="absolute -right-8 -bottom-8 w-40 h-40 text-emerald-900 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Database Core</span><h4 className="text-base font-bold mt-4 truncate">u550128434_trazot_db</h4><div className="mt-8 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /><span className="text-[10px] font-black uppercase text-emerald-100/60 tracking-widest">Active • {dbHealth.latency}ms Latency</span></div></div>
               </div>
               <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all"><Cpu className="w-12 h-12 text-emerald-600 mb-8" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Processing Node</span><h4 className="text-base font-bold mt-3">Protocol 9.5 Stable</h4></div>
               <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all"><Globe className="w-12 h-12 text-emerald-600 mb-8" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">API Endpoint</span><h4 className="text-base font-bold mt-3">trazot.com/api.php</h4></div>
               <div className="bg-emerald-50 p-10 rounded-[48px] border border-emerald-100 group"><Zap className="w-12 h-12 text-emerald-600 mb-8 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Sync Pipeline</span><h4 className="text-base font-bold mt-3">30s Auto-Handshake</h4></div>
            </div>
          </div>
        )}

        {subView === 'listings' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <h3 className="text-3xl font-serif-italic text-emerald-950 flex items-center gap-4"><Clock className="w-8 h-8 text-yellow-500" /> Awaiting Authorization</h3>
              <div className="grid grid-cols-1 gap-6">
                 {listings.filter(l => l.status === AdStatus.PENDING).map(l => (
                   <div key={l.id} className="flex flex-col lg:flex-row items-center justify-between p-8 bg-gray-50 rounded-[40px] hover:bg-gray-100 hover:shadow-xl transition-all duration-500 gap-8 group border border-transparent hover:border-emerald-100">
                      <div className="flex items-center gap-8 w-full lg:w-auto"><img src={l.images[0]} className="w-24 h-24 rounded-3xl object-cover shadow-2xl" /><div><h5 className="font-black text-emerald-950 text-lg mb-1">{l.title}</h5><p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">{l.category} • {l.location.city}</p><div className="text-emerald-950 font-black text-sm mt-2">{l.currency} {l.price.toLocaleString()}</div></div></div>
                      <div className="flex gap-3 w-full lg:w-auto justify-end"><Link to={`/listing/${l.id}`} className="p-4 bg-white text-gray-400 rounded-2xl hover:text-emerald-600 transition-all"><Eye className="w-6 h-6" /></Link><button onClick={() => handleApprove(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle className="w-5 h-5" /> Approve</button><button onClick={() => handleReject(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"><XCircle className="w-5 h-5" /> Reject</button></div>
                   </div>
                 ))}
                 {listings.filter(l => l.status === AdStatus.PENDING).length === 0 && (
                   <div className="text-center py-32 bg-emerald-50/20 rounded-[56px] border-2 border-dashed border-emerald-100"><ShieldCheck className="w-20 h-20 text-emerald-200 mx-auto mb-8 animate-pulse" /><h4 className="text-2xl font-bold text-emerald-950 mb-2">Global Ledger Clear</h4></div>
                 )}
              </div>
           </div>
        )}

        {subView === 'users' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div><h3 className="text-3xl font-serif-italic text-emerald-950">Citizen Ledger</h3><p className="text-gray-400 text-sm font-medium">Manage verified merchant nodes and regional participants.</p></div>
                <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-6">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Coins className="w-6 h-6" /></div>
                   <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Global Credit Injection</span>
                      <div className="flex gap-2">
                         <input type="number" value={globalCreditAmount} onChange={e => setGlobalCreditAmount(e.target.value)} className="w-20 bg-white rounded-lg px-3 py-2 text-xs font-black outline-none border border-emerald-200" />
                         <button onClick={handleAwardGlobal} className="bg-emerald-950 text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all">Award All</button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-gray-50 rounded-[40px] border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-white border-b border-gray-100">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Node Identity</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Regional Pulse</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Trade Balance</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black">{u.name.charAt(0)}</div>
                                 <div><p className="font-bold text-emerald-950 text-sm">{u.name}</p><p className="text-[10px] text-gray-400 font-medium">{u.email}</p></div>
                              </div>
                           </td>
                           <td className="px-8 py-6"><span className="px-3 py-1 bg-white rounded-lg text-[9px] font-black uppercase border border-gray-200 text-gray-600">{u.country || 'Global'}</span></td>
                           <td className="px-8 py-6 text-center"><span className="text-sm font-black text-emerald-600">{u.credits} <span className="text-[10px] opacity-40">CR</span></span></td>
                           <td className="px-8 py-6 text-right"><button onClick={() => { storageService.awardCredits(u.id, 10); setUsers(storageService.getUsers()); }} className="p-2 text-gray-300 hover:text-emerald-600 transition-colors"><Zap className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {subView === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-12"><SettingsIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" /><h3 className="text-3xl font-serif-italic text-emerald-950">Credential Management</h3><p className="text-gray-400 text-sm font-medium">Update your administrative access signatures.</p></div>
             <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-2">Change Admin Signature</label>
                   <div className="flex gap-4">
                      <input type="password" placeholder="New Personal Signature" id="new-sig-input" className="flex-1 bg-white rounded-2xl p-5 font-bold outline-none border border-gray-100 focus:border-emerald-500" />
                      <button onClick={() => {
                        const val = (document.getElementById('new-sig-input') as HTMLInputElement).value;
                        if(val.length >= 6) { storageService.updateAdminPassword(val); alert('Signature Updated.'); } else { alert('Too short.'); }
                      }} className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black">Update</button>
                   </div>
                </div>
                <div className="p-8 bg-emerald-950 rounded-[32px] text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                   <h5 className="text-emerald-400 font-black uppercase text-[10px] mb-4 flex items-center gap-2"><KeyIcon className="w-3.5 h-3.5" /> Emergency Master Node</h5>
                   <p className="text-[11px] text-emerald-100/40 leading-relaxed font-medium mb-6">The Master Recovery Key is unique to your local node instance. It bypasses all personal signatures.</p>
                   <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-sm tracking-widest text-emerald-500">{storageService.getAdminAuth()?.recoveryKey || 'UNINITIALIZED'}</div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;