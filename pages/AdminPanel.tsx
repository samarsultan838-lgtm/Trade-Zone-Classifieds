
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Lock,
  Newspaper,
  Plus,
  Trash2,
  X,
  RefreshCw,
  LogOut,
  Eye,
  Layers,
  Users,
  BarChart3,
  Fingerprint,
  Loader2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  ChevronRight,
  Zap,
  Key
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { storageService, MASTER_EMERGENCY_KEY } from '../services/storageService.ts';
import { Listing, AdStatus, NewsArticle, User } from '../types.ts';
import { Link } from 'react-router-dom';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [password, setPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'news'>('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    if (sessionStorage.getItem('tz_admin_session')) initializeDashboard();
  }, []);

  const initializeDashboard = () => {
    setListings(storageService.getListings());
    setNews(storageService.getNews());
    setUsers(storageService.getUsers());
    setView('dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 600));
    const creds = storageService.getAdminAuth();
    if (creds && creds.password === password) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
    } else {
      alert('Invalid security credentials.');
    }
    setIsAuthorizing(false);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const success = storageService.resetAdminPassword(recoveryKey, newPassword);
    if (success) {
      alert('Credentials reset successful. Please login.');
      setView('login');
      setPassword('');
    } else {
      alert('Invalid Recovery Key.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
    setPassword('');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await storageService.syncWithCloud();
    initializeDashboard();
    setIsSyncing(false);
  };

  const marketMixData = useMemo(() => {
    const counts = listings.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    return Object.keys(counts).map((key, i) => ({
      name: key, value: counts[key], color: colors[i % colors.length]
    }));
  }, [listings]);

  if (view === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-6">
        <div className="bg-[#051c12] border border-emerald-900/50 p-10 rounded-[48px] max-w-md w-full text-center animate-in zoom-in-95">
          <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-2xl font-serif-italic text-white mb-6">Master Setup</h1>
          <form onSubmit={(e) => { e.preventDefault(); storageService.setAdminAuth(password, MASTER_EMERGENCY_KEY); initializeDashboard(); }} className="space-y-4">
            <input type="password" placeholder="Define Admin Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-4 text-center text-white outline-none" />
            <div className="p-4 bg-emerald-950/50 rounded-2xl border border-emerald-500/10 mb-4">
              <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Global Recovery Key</p>
              <p className="text-sm font-black text-white tracking-widest">{MASTER_EMERGENCY_KEY}</p>
            </div>
            <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Initialize Vault</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-6">
        <div className="bg-[#051c12] border border-emerald-900/50 p-10 rounded-[48px] max-w-md w-full text-center animate-in zoom-in-95">
          <RefreshCw className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-2xl font-serif-italic text-white mb-6">Emergency Reset</h1>
          <form onSubmit={handleReset} className="space-y-4">
            <input type="text" placeholder="Recovery Key" required value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-4 text-center text-white outline-none" />
            <input type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-4 text-center text-white outline-none" />
            <button className="w-full bg-yellow-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Authorize Reset</button>
            <button type="button" onClick={() => setView('login')} className="text-emerald-500/40 text-[9px] font-black uppercase tracking-widest mt-4">Back to Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-6">
        <div className="bg-[#051c12] border border-emerald-900/50 p-10 rounded-[48px] max-w-md w-full text-center animate-in zoom-in-95">
          <Fingerprint className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-serif-italic text-white mb-2">Vault Entry</h1>
          <p className="text-emerald-500/40 text-[9px] font-black uppercase tracking-widest mb-8">Admin Auth Required</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Authorization Key" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-4 text-center text-white outline-none focus:border-emerald-500 transition-all" />
            <button disabled={isAuthorizing} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
              {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Authorize Access
            </button>
            <button type="button" onClick={() => setView('forgot')} className="text-emerald-500/40 text-[9px] font-black uppercase tracking-widest mt-4 hover:text-emerald-400">Emergency Reset</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 pt-8">
      <header className="bg-white p-8 md:p-12 rounded-[48px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">Command <span className="text-emerald-600">Center</span></h1>
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-2">Institutional Admin Ledger</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSync} className={`p-4 bg-gray-50 rounded-2xl text-emerald-600 border border-gray-100 ${isSyncing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-4 bg-red-50 rounded-2xl text-red-600 border border-red-100 hover:bg-red-100 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Inventory', val: listings.length, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Merchant Nodes', val: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cloud Latency', val: '24ms', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Asset Valuation', val: '4.8M', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}><stat.icon className="w-6 h-6" /></div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase text-gray-400">{stat.label}</p>
                   <p className="text-2xl font-black text-emerald-950">{stat.val}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-emerald-950 rounded-[48px] p-10 text-white min-h-[400px]">
           <h2 className="text-xl font-bold flex items-center gap-2 mb-8"><Activity className="w-5 h-5 text-emerald-400" /> Market Intelligence</h2>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={marketMixData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fill: '#fff', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white rounded-[48px] border border-gray-100 p-10">
           <h3 className="text-xl font-bold mb-8">Asset Liquidity</h3>
           <div className="h-[200px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={marketMixData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={10}>
                       {marketMixData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-4">
              {marketMixData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background: item.color}} /> {item.name}</span>
                  <span className="text-emerald-950">{item.value} Units</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
