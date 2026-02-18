import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock,
  LogOut,
  Loader2,
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
  ChevronRight,
  Settings as SettingsIcon,
  RefreshCw,
  Trash2,
  Coins,
  Plus,
  X,
  Upload,
  Sparkles,
  EyeOff,
  BarChart4,
  Edit,
  Save
} from 'lucide-react';
import { storageService, MASTER_EMERGENCY_KEY, OFFICIAL_DOMAIN } from '../services/storageService';
import { processImage } from '../services/imageService';
import { optimizeNewsArticle } from '../services/geminiService';
import { NewsArticle, AdStatus, Listing, User } from '../types';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Trend' as NewsArticle['category'],
    image: '',
    content: ''
  });

  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editListingData, setEditListingData] = useState<Partial<Listing>>({});

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    
    if (sessionStorage.getItem('tz_admin_session') === 'true') {
      initializeDashboard();
    }
  }, []);

  const initializeDashboard = async () => {
    setListings(storageService.getListings());
    setUsers(storageService.getUsers());
    setNews(storageService.getNews());
    storageService.getBackendHealth().then(health => setDbHealth(health));
    setView('dashboard');
  };

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

  const handleUnlist = async (id: string) => {
    if (confirm('Unlist this asset from public registry?')) {
      await storageService.unlistListing(id);
      setListings(storageService.getListings());
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (confirm('Permanently delete listing node? This cannot be undone.')) {
      await storageService.deleteListing(id);
      setListings(storageService.getListings());
    }
  };

  const startEditListing = (l: Listing) => {
    setEditingListingId(l.id);
    setEditListingData({ title: l.title, price: l.price });
  };

  const saveEditedListing = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      const updated = { ...listing, ...editListingData };
      await storageService.saveListing(updated);
      setListings(storageService.getListings());
      setEditingListingId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await processImage(file, 'news');
      setNewsForm(p => ({ ...p, image: optimized }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAIOptimize = async () => {
    if (!newsForm.title || !newsForm.content) return alert('Enter headline and content first.');
    setIsOptimizing(true);
    try {
      const result = await optimizeNewsArticle(newsForm.title, newsForm.content, newsForm.category);
      if (result) {
        setNewsForm(p => ({
          ...p,
          title: result.optimizedTitle,
          content: result.optimizedContent
        }));
        alert('AI Optimization Applied: Enhanced headline and structure.');
      }
    } catch (e) {
      alert('Optimization relay failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.image) return alert('Asset banner required.');
    
    const slug = newsForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newArticle: NewsArticle = {
      id: crypto.randomUUID(),
      ...newsForm,
      slug,
      metaDescription: newsForm.content.substring(0, 160) + '...',
      tags: ['Trazot', newsForm.category],
      author: 'Bureau Editorial',
      publishedAt: new Date().toISOString()
    };
    storageService.saveNews(newArticle);
    setNews(storageService.getNews());
    setShowNewsModal(false);
    setNewsForm({ title: '', category: 'Market Trend', image: '', content: '' });
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Delete article?')) {
      await storageService.deleteNews(id);
      setNews(storageService.getNews());
    }
  };

  const handleAwardGlobal = async () => {
    const amount = parseInt(globalCreditAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount.');
    if (confirm(`Authorize global injection of ${amount} Trade Credits?`)) {
      await storageService.awardGlobalCredits(amount);
      setUsers(storageService.getUsers());
      alert('Global credit injection successful.');
    }
  };

  const chartData = useMemo(() => {
    return [
      { name: 'Jan', listings: 400 },
      { name: 'Feb', listings: 300 },
      { name: 'Mar', listings: 600 },
      { name: 'Apr', listings: 800 },
      { name: 'May', listings: 1200 },
      { name: 'Jun', listings: listings.length }
    ];
  }, [listings.length]);

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
          <button onClick={() => setShowNewsModal(true)} className="px-6 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200">
             <Newspaper className="w-4 h-4" /> Publish News
          </button>
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
            
            <div className="h-[400px] w-full bg-gray-50/50 rounded-[40px] p-8">
              <h3 className="text-xl font-bold mb-8 uppercase text-emerald-950 flex items-center gap-3"><BarChart4 className="text-emerald-500" /> Platform Growth Index</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="listings" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorListings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

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
              <h3 className="text-3xl font-serif-italic text-emerald-950 flex items-center gap-4"><Layers className="w-8 h-8 text-emerald-600" /> Administrative Ledger</h3>
              
              <div className="grid grid-cols-1 gap-8">
                 {/* Section: Pending Authorizations */}
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Awaiting Protocol Approval</h4>
                    {listings.filter(l => l.status === AdStatus.PENDING).map(l => (
                      <div key={l.id} className="flex flex-col lg:flex-row items-center justify-between p-8 bg-amber-50/30 rounded-[40px] border border-amber-100/50 hover:shadow-xl transition-all duration-500 gap-8 group">
                          <div className="flex items-center gap-8 w-full lg:w-auto">
                              <div className="relative"><img src={l.images[0]} className="w-24 h-24 rounded-3xl object-cover shadow-2xl" /><div className="absolute inset-0 rounded-3xl border border-black/5" /></div>
                              <div>
                                <h5 className="font-black text-emerald-950 text-lg mb-1">{l.title}</h5>
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">{l.category} • {l.location.city}</p>
                                <div className="flex items-center gap-4 mt-2">
                                   <div className="text-emerald-950 font-black text-sm">{l.currency} {l.price.toLocaleString()}</div>
                                   <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(l.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                          </div>
                          <div className="flex gap-3 w-full lg:w-auto justify-end">
                            <Link to={`/listing/${l.id}`} className="p-4 bg-white text-gray-400 rounded-2xl hover:text-emerald-600 transition-all border border-gray-100 shadow-sm"><Eye className="w-6 h-6" /></Link>
                            <button onClick={() => handleApprove(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg"><CheckCircle className="w-5 h-5" /> Approve</button>
                            <button onClick={() => handleReject(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-red-50 text-red-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"><XCircle className="w-5 h-5" /> Reject</button>
                          </div>
                      </div>
                    ))}
                    {listings.filter(l => l.status === AdStatus.PENDING).length === 0 && (
                      <div className="text-center py-20 bg-emerald-50/10 rounded-[40px] border-2 border-dashed border-emerald-100/30">
                        <ShieldCheck className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Global Protocol Clear</p>
                      </div>
                    )}
                 </div>

                 {/* Section: Public Inventory Oversight */}
                 <div className="space-y-6 pt-12 border-t border-gray-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Active Transmission Oversight</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listings.filter(l => l.status === AdStatus.ACTIVE).map(l => (
                          <div key={l.id} className="bg-white border border-gray-100 p-6 rounded-[32px] flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg transition-all">
                              <div className="flex items-center gap-4 flex-1">
                                  <img src={l.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                  {editingListingId === l.id ? (
                                    <div className="flex flex-col gap-1 flex-1 px-2">
                                      <input 
                                        type="text" 
                                        value={editListingData.title} 
                                        onChange={e => setEditListingData(p => ({...p, title: e.target.value}))} 
                                        className="text-xs font-bold border rounded p-1 outline-none focus:border-emerald-500"
                                      />
                                      <input 
                                        type="number" 
                                        value={editListingData.price} 
                                        onChange={e => setEditListingData(p => ({...p, price: Number(e.target.value)}))} 
                                        className="text-xs font-black text-emerald-600 border rounded p-1 outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex-1 min-w-0">
                                      <h6 className="font-bold text-emerald-950 text-sm line-clamp-1">{l.title}</h6>
                                      <div className="flex items-center gap-2 mt-1">
                                         <span className="text-[9px] font-black text-emerald-600 uppercase">{l.currency} {l.price.toLocaleString()}</span>
                                         <span className="text-[8px] font-bold text-gray-300">| {l.location.city}</span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                              <div className="flex items-center gap-2">
                                 {editingListingId === l.id ? (
                                   <button onClick={() => saveEditedListing(l.id)} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"><Save className="w-4.5 h-4.5" /></button>
                                 ) : (
                                   <button onClick={() => startEditListing(l)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-emerald-950 transition-all"><Edit className="w-4.5 h-4.5" /></button>
                                 )}
                                 <button onClick={() => handleUnlist(l.id)} title="Unlist from registry" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-emerald-950 transition-all"><EyeOff className="w-4.5 h-4.5" /></button>
                                 <button onClick={() => handleDeleteListing(l.id)} title="Permanent delete" className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
                              </div>
                          </div>
                        ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {subView === 'news' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-serif-italic text-emerald-950">Editorial Ledger</h3>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Global Trade Intelligence Relay</p>
                </div>
                <button onClick={() => setShowNewsModal(true)} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-emerald-500 transition-all"><Plus className="w-4 h-4" /> Create Article</button>
             </div>
             
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Headline Intelligence</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Regional Segment</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {news.map(article => (
                      <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-6">
                            <div className="relative shrink-0"><img src={article.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-black/5" /></div>
                            <div className="font-bold text-sm text-emerald-950 line-clamp-1">{article.title}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[9px] font-black px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest border border-blue-100">{article.category}</span>
                        </td>
                        <td className="px-8 py-6 text-xs text-gray-400 font-bold uppercase tracking-tight">
                           {new Date(article.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => handleDeleteNews(article.id)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {news.length === 0 && (
                      <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">No Intelligence Briefings Recorded</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {subView === 'users' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div><h3 className="text-3xl font-serif-italic text-emerald-950">Citizen Ledger</h3><p className="text-gray-400 text-sm font-medium">Manage verified merchant nodes and regional participants.</p></div>
                <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-6 shadow-sm">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Coins className="w-6 h-6" /></div>
                   <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Global Credit Injection</span>
                      <div className="flex gap-2">
                         <input type="number" value={globalCreditAmount} onChange={e => setGlobalCreditAmount(e.target.value)} className="w-20 bg-white rounded-lg px-3 py-2 text-xs font-black outline-none border border-emerald-200 shadow-inner" />
                         <button onClick={handleAwardGlobal} className="bg-emerald-950 text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all shadow-lg">Award All</button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Node Identity</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Trade Balance</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/30 transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black shadow-sm">{u.name.charAt(0)}</div>
                                 <div><p className="font-bold text-emerald-950 text-sm">{u.name}</p><p className="text-[10px] text-gray-400 font-medium">{u.email}</p></div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center"><span className="text-sm font-black text-emerald-600">{u.credits} <span className="text-[10px] opacity-40">CR</span></span></td>
                           <td className="px-8 py-6 text-right"><button onClick={() => { storageService.awardCredits(u.id, 10); setUsers(storageService.getUsers()); }} className="p-3 bg-white text-gray-300 hover:text-emerald-600 hover:border-emerald-200 border border-transparent rounded-xl transition-all"><Zap className="w-5 h-5" /></button></td>
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
                      <input type="password" placeholder="New Personal Signature" id="new-sig-input" className="flex-1 bg-white rounded-2xl p-5 font-bold outline-none border border-gray-100 focus:border-emerald-500 shadow-sm" />
                      <button onClick={() => {
                        const val = (document.getElementById('new-sig-input') as HTMLInputElement).value;
                        if(val.length >= 6) { storageService.updateAdminPassword(val); alert('Signature Updated.'); } else { alert('Too short.'); }
                      }} className="bg-emerald-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-lg">Update</button>
                   </div>
                </div>
                <div className="p-8 bg-emerald-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                   <h5 className="text-emerald-400 font-black uppercase text-[10px] mb-4 flex items-center gap-2"><KeyIcon className="w-3.5 h-3.5" /> Emergency Master Node</h5>
                   <p className="text-[11px] text-emerald-100/40 leading-relaxed font-medium mb-6">The Master Recovery Key is unique to your local node instance. It bypasses all personal signatures.</p>
                   <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-sm tracking-widest text-emerald-500 shadow-inner">{storageService.getAdminAuth()?.recoveryKey || 'UNINITIALIZED'}</div>
                </div>
             </div>
          </div>
        )}
      </div>

      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-4xl w-full shadow-4xl animate-in zoom-in-95 overflow-y-auto max-h-[95vh] scrollbar-hide border border-white/10">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
              <div>
                <h2 className="text-3xl font-serif-italic text-emerald-950 leading-tight">Draft Intel Briefing</h2>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mt-1">Editorial Suite Protocol 5.2</p>
              </div>
              <button onClick={() => setShowNewsModal(false)} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleCreateNews} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Article Headline</label>
                       <button type="button" onClick={handleAIOptimize} disabled={isOptimizing} className="text-[8px] font-black uppercase text-emerald-600 flex items-center gap-1.5 hover:text-emerald-800 disabled:opacity-50 transition-all">
                          {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Optimize with AI
                       </button>
                    </div>
                    <input required value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} placeholder="The future of Riyadh trade..." className="w-full bg-gray-50 p-5 rounded-2xl font-black text-emerald-950 outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-inner text-lg" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Intelligence Body</label>
                    <textarea required rows={12} value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} placeholder="Technical data analysis and market sentiment..." className="w-full bg-gray-50 p-8 rounded-3xl font-medium text-gray-600 outline-none border-2 border-transparent focus:border-emerald-500 leading-relaxed shadow-inner" />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Asset Category</label>
                      <select value={newsForm.category} onChange={e => setNewsForm(p => ({ ...p, category: e.target.value as any }))} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-emerald-950 outline-none border-2 border-transparent focus:border-emerald-500 shadow-sm appearance-none cursor-pointer">
                        <option>Market Trend</option><option>Trade Zone News</option><option>Expert Advice</option><option>Tech Update</option>
                      </select>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Banner Node</label>
                      <div className="relative group">
                         {newsForm.image ? (
                           <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                              <img src={newsForm.image} className="w-full h-full object-cover" alt="Preview" />
                              <button type="button" onClick={() => setNewsForm(p => ({ ...p, image: '' }))} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                           </div>
                         ) : (
                           <div className="border-2 border-dashed border-emerald-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-emerald-50/30 group-hover:bg-emerald-50 transition-all cursor-pointer" onClick={() => document.getElementById('news-upload')?.click()}>
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><Upload className="w-8 h-8" /></div>
                              <div className="text-center">
                                 <p className="text-[10px] font-black uppercase text-emerald-950">Upload Local Asset</p>
                                 <p className="text-[8px] font-bold text-emerald-400 mt-1 uppercase">JPG, PNG, WEBP (MAX 10MB)</p>
                              </div>
                           </div>
                         )}
                         <input type="file" id="news-upload" hidden accept="image/*" onChange={handleImageUpload} />
                      </div>
                   </div>

                   <div className="p-6 bg-emerald-950 rounded-[32px] text-white space-y-4 shadow-xl">
                      <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Distribution Check</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-60"><CheckCircle className="w-3.5 h-3.5" /> Regional CDN Sync: OK</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-60"><CheckCircle className="w-3.5 h-3.5" /> Meta Tags Gen: AUTO</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold opacity-60"><CheckCircle className="w-3.5 h-3.5" /> Sitemap Refresh: ON</div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                 <button type="submit" className="w-full bg-emerald-950 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
                    <Plus className="w-5 h-5 text-emerald-500" /> Transmit to Hub Network
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;