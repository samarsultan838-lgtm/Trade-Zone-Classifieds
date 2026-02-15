
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
  Trash,
  Layers,
  Users,
  BarChart3,
  Search,
  User as UserIcon,
  Crown,
  Mail,
  Zap,
  Globe,
  Radio,
  AlertTriangle,
  Bell,
  ChevronRight,
  MessageSquare,
  Key,
  Fingerprint,
  Loader2,
  Upload,
  CloudUpload,
  ClipboardCheck,
  History,
  Smartphone,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  DollarSign,
  MoreVertical,
  ArrowUpRight,
  ExternalLink
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
import { storageService } from '../services/storageService.ts';
import { Listing, AdStatus, NewsArticle, User, CategoryType } from '../types.ts';
import { Link } from 'react-router-dom';

type AdminViewState = 'login' | 'setup' | 'dashboard';

interface AdminNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  subtext?: string;
}

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [password, setPassword] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'news'>('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    if (sessionStorage.getItem('tz_admin_session')) initializeDashboard();
  }, []);

  const notify = (message: string, type: AdminNotification['type'] = 'success', subtext?: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type, subtext }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const initializeDashboard = () => {
    setListings(storageService.getListings());
    setNews(storageService.getNews());
    setUsers(storageService.getUsers());
    setView('dashboard');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await storageService.syncWithCloud();
    initializeDashboard();
    if (res === 'synced') {
      notify('Ledger Synchronized', 'success', 'Global nodes updated successfully');
    } else {
      notify('Offline Sync', 'info', 'Operating on local persistent data');
    }
    setIsSyncing(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 800));
    const creds = storageService.getAdminAuth();
    if (creds && creds.password === password) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
      notify('Vault Authorized', 'success', 'Secure session initiated');
    } else {
      notify('Access Denied', 'error', 'Invalid security token');
    }
    setIsAuthorizing(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
    setPassword('');
  };

  const handleListingAction = async (id: string, status: AdStatus) => {
    const updated = listings.map(l => l.id === id ? { ...l, status } : l);
    setListings(updated);
    const listingToUpdate = updated.find(l => l.id === id);
    if (listingToUpdate) {
      storageService.saveListing(listingToUpdate);
      notify(`Listing ${status}`, 'info', `ID: ${id.toUpperCase()}`);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this user node permanently? All associated listings may be orphaned.')) {
      // GAP CLOSED: Use centralized service method with cloud broadcast
      storageService.deleteUser(id);
      setUsers(storageService.getUsers());
      notify('User Node Deleted', 'error', `ID: ${id}`);
    }
  };

  const handleDeleteListing = (id: string) => {
    if (confirm('Permanently delete this asset? This cannot be undone.')) {
      storageService.deleteListing(id);
      setListings(storageService.getListings());
      notify('Asset Expunged', 'error', `ID: ${id}`);
    }
  };

  // --- ANALYTICS ---
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

  const inventoryHealth = useMemo(() => [
    { status: 'Active', count: listings.filter(l => l.status === AdStatus.ACTIVE).length },
    { status: 'Pending', count: listings.filter(l => l.status === AdStatus.PENDING).length },
    { status: 'Rejected', count: listings.filter(l => l.status === AdStatus.REJECTED).length },
    { status: 'Sold', count: listings.filter(l => l.status === AdStatus.SOLD).length },
  ], [listings]);

  const pendingListings = useMemo(() => 
    listings.filter(l => l.status === AdStatus.PENDING && l.title.toLowerCase().includes(searchQuery.toLowerCase()))
  , [listings, searchQuery]);

  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  , [users, searchQuery]);

  const activeInventory = useMemo(() => 
    listings.filter(l => l.status !== AdStatus.PENDING && (l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.id.toLowerCase().includes(searchQuery.toLowerCase())))
  , [listings, searchQuery]);

  if (view !== 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-6">
        <div className="bg-[#051c12] border border-emerald-900/50 p-8 md:p-14 rounded-[40px] md:rounded-[48px] shadow-4xl max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-950 border border-emerald-500/30 rounded-[30px] md:rounded-[36px] mx-auto flex items-center justify-center text-emerald-400 mb-8 md:mb-10 shadow-2xl animate-pulse">
            <Fingerprint className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif-italic text-white mb-2">Vault Entry</h1>
          <p className="text-emerald-500/40 text-[9px] font-black uppercase tracking-[0.3em] mb-8 md:mb-10">Administrative Authentication Protocol</p>
          <form onSubmit={view === 'setup' ? (e) => { e.preventDefault(); storageService.setAdminAuth(password, 'TZ-RECOVERY-KEY'); initializeDashboard(); } : handleLogin} className="space-y-4 md:space-y-5">
            <input 
              type="password" 
              placeholder="Authorization Key" 
              required 
              autoFocus
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-4 md:py-5 text-center font-bold text-white placeholder:text-emerald-900 focus:border-emerald-500 outline-none transition-all shadow-inner" 
            />
            <button disabled={isAuthorizing} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decrypt & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-700 px-4 md:px-0">
      
      {/* GLOBAL NOTIFICATIONS LAYER */}
      <div className="fixed top-8 right-8 z-[300] space-y-3 pointer-events-none hidden md:block">
        {notifications.map(n => (
          <div key={n.id} className={`w-80 p-5 rounded-[24px] border shadow-4xl backdrop-blur-xl flex items-start gap-4 animate-in slide-in-from-right-8 bg-white/95 ${n.type === 'error' ? 'border-red-100 text-red-900' : 'border-emerald-100 text-emerald-900'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
               <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight leading-tight">{n.message}</p>
              {n.subtext && <p className="text-[9px] font-bold opacity-50 uppercase mt-1 leading-tight">{n.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* COMMAND HEADER */}
      <header className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950 mb-2">Command <span className="text-emerald-600">Center</span></h1>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" /> Institutional Access Verified
             </div>
             <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-300">
                <Globe className="w-3.5 h-3.5" /> Node Cluster: Global
             </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="p-3 md:p-4 bg-gray-50 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all border border-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-emerald-600 text-white px-6 md:px-8 py-3.5 md:py-4.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-2 md:gap-3">
            <Newspaper className="w-4 h-4" /> Dispatch News
          </button>
          <button onClick={handleLogout} className="p-3 md:p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD TABS - SCROLLABLE ON MOBILE */}
      <nav className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-4 scrollbar-hide px-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'listings', label: 'Inventory Audit', icon: Layers },
          { id: 'users', label: 'Merchant Registry', icon: Users },
          { id: 'news', label: 'Broadcast Hub', icon: Newspaper }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex items-center gap-3 whitespace-nowrap px-6 md:px-8 py-3 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.id 
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl scale-105' 
              : 'bg-white text-gray-400 border-gray-100 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* SEARCH BAR (Visible in Data Tabs) */}
      {activeTab !== 'overview' && (
        <div className="relative mb-6">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text"
            placeholder={`Search ${activeTab === 'listings' ? 'Inventory ID or Title' : 'Merchant Identity'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-3xl py-5 pl-16 pr-6 font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>
      )}

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Market Inventory', val: listings.length, sub: 'Live Asset Packets', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Merchant Nodes', val: users.length, sub: 'Verified Entities', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Market Valuation', val: `${(listings.reduce((a,c)=>a+(c.price||0),0)/1000000).toFixed(1)}M`, sub: 'Relay Capitalization', icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Pending Audits', val: pendingListings.length, sub: 'Awaiting Authorization', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', alert: pendingListings.length > 0 }
            ].map((kpi, i) => (
              <div key={i} className={`bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-all ${kpi.alert ? 'ring-2 ring-amber-500/20' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 block">{kpi.label}</span>
                    <h3 className={`text-2xl md:text-3xl font-black ${kpi.color}`}>{kpi.val}</h3>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{kpi.sub}</span>
                   <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-emerald-950 rounded-[40px] md:rounded-[48px] p-6 md:p-12 text-white relative overflow-hidden shadow-4xl min-h-[350px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="relative z-10">
                 <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 mb-8 md:mb-10"><Activity className="w-6 h-6 text-emerald-500" /> Regional Node Velocity</h2>
                 <div className="h-[250px] md:h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryHealth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#10b981' }} />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#051c12', color: '#fff' }} />
                        <Bar dataKey="count" fill="#10b981" radius={[12, 12, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[40px] md:rounded-[48px] p-6 md:p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
               <h3 className="text-lg font-bold text-emerald-950 mb-6 md:mb-8 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-emerald-600" /> Sector Liquidity</h3>
               <div className="h-40 md:h-48 w-full mb-6 md:mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketMixData} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={8}>
                         {marketMixData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2 md:space-y-3 w-full">
                  {marketMixData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-xl">
                       <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-emerald-950">{item.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-gray-400">{item.value} Assets</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY AUDIT VIEW - RESPONSIVE ACTION QUEUE */}
      {activeTab === 'listings' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* PENDING AUDITS */}
          <div className="bg-emerald-950 rounded-[32px] md:rounded-[48px] border border-emerald-900 shadow-4xl overflow-hidden">
            <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                    <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6" />
                 </div>
                 <div className="text-center md:text-left">
                    <h2 className="text-lg md:text-2xl font-bold text-white uppercase tracking-tight">Audit Queue</h2>
                    <p className="text-[8px] md:text-[9px] font-black uppercase text-emerald-500/60 tracking-widest mt-1">Verification Packets Pending</p>
                 </div>
              </div>
              <div className="px-5 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                {pendingListings.length} Signals
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {pendingListings.length > 0 ? pendingListings.map(l => (
                <div key={l.id} className="p-6 md:p-10 hover:bg-white/[0.03] transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
                  <div className="flex items-center gap-4 md:gap-6 w-full">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl shrink-0 border border-white/10 relative">
                       <img src={l.images[0]} className="w-full h-full object-cover grayscale" alt="" />
                    </div>
                    <div className="min-w-0 flex-1">
                       <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-1.5 md:mb-2">
                          <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">{l.id}</span>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{new Date(l.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-white font-bold text-lg md:text-2xl truncate mb-2 md:mb-3">{l.title}</h4>
                       <div className="flex flex-wrap gap-1.5 md:gap-2">
                          <div className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 rounded-lg text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest border border-white/5">{l.category}</div>
                          <div className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-600 rounded-lg text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest shadow-xl">{l.currency} {l.price.toLocaleString()}</div>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                    <Link to={`/listing/${l.id}`} className="flex-1 lg:flex-none p-3.5 md:p-4.5 bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/5">
                       <Eye className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleListingAction(l.id, AdStatus.ACTIVE)}
                      className="flex-[2] lg:flex-none px-6 md:px-10 py-3.5 md:py-4.5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 shadow-2xl transition-all"
                    >
                      Authorize
                    </button>
                    <button 
                      onClick={() => handleListingAction(l.id, AdStatus.REJECTED)}
                      className="flex-1 lg:flex-none p-3.5 md:p-4.5 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-900/20"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                   <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-emerald-500/10 mx-auto mb-6" />
                   <p className="text-emerald-500/30 text-[10px] md:text-xs font-black uppercase tracking-widest">Queue Clear • Node Integrity Optimized</p>
                </div>
              )}
            </div>
          </div>

          {/* MASTER ASSET LEDGER (CARDS ON MOBILE, TABLE ON DESKTOP) */}
          <div className="bg-white rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 md:p-12 border-b border-gray-50 flex items-center justify-between">
                <div>
                   <h2 className="text-xl md:text-2xl font-bold text-emerald-950 uppercase tracking-tight">Asset Registry</h2>
                   <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-300 mt-1">Global Node Inventory Audit</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400">
                     {activeInventory.length} Assets
                   </div>
                </div>
             </div>

             {/* MOBILE VIEW */}
             <div className="block lg:hidden divide-y divide-gray-50">
                {activeInventory.map(l => (
                  <div key={l.id} className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                          <img src={l.images[0]} className="w-16 h-16 rounded-xl object-cover grayscale opacity-60" alt="" />
                          <div className="min-w-0">
                             <h4 className="font-bold text-emerald-950 text-sm truncate mb-0.5">{l.title}</h4>
                             <p className="text-[8px] font-black text-emerald-500 uppercase mb-2">{l.id}</p>
                             <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${l.status === AdStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400'}`}>
                                   {l.status}
                                </span>
                                <span className="text-[9px] font-black text-emerald-900">{l.currency} {l.price.toLocaleString()}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDeleteListing(l.id)}
                        className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>

             {/* DESKTOP VIEW */}
             <div className="hidden lg:block overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Asset Identity</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Integrity Status</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Market Valuation</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeInventory.map(l => (
                      <tr key={l.id} className="hover:bg-emerald-50/30 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                               <img src={l.images[0]} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt="" />
                             </div>
                             <div>
                               <p className="font-bold text-emerald-950 text-sm group-hover:text-emerald-600 transition-colors">{l.title}</p>
                               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{l.id}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            l.status === AdStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            l.status === AdStatus.SOLD ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-red-50 text-red-700 border-red-100'
                           }`}>
                              {l.status === AdStatus.ACTIVE && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              {l.status}
                           </span>
                        </td>
                        <td className="px-10 py-8 font-black text-emerald-950 text-sm">
                          {l.currency} {l.price.toLocaleString()}
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <Link to={`/listing/${l.id}`} className="p-2.5 text-gray-300 hover:text-emerald-600 transition-colors"><Eye className="w-4 h-4" /></Link>
                             <button 
                               onClick={() => handleDeleteListing(l.id)}
                               className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>

             {activeInventory.length === 0 && (
               <div className="py-24 text-center">
                  <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">No matching assets in the global ledger</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* 3. MERCHANT REGISTRY VIEW */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
           <div className="p-6 md:p-12 border-b border-gray-50 flex items-center justify-between">
              <div>
                 <h2 className="text-xl md:text-2xl font-bold text-emerald-950 uppercase tracking-tight">Merchant Registry</h2>
                 <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-300 mt-1">Verified Node Participant Audit</p>
              </div>
              <div className="bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-emerald-600">
                 {filteredUsers.length} Merchants
              </div>
           </div>

           {/* MOBILE VIEW */}
           <div className="block lg:hidden divide-y divide-gray-50">
              {filteredUsers.map(u => (
                <div key={u.id} className="p-5 flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                           {u.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="font-bold text-emerald-950 text-sm">{u.name}</h4>
                           <p className="text-[9px] font-black text-emerald-500 uppercase">{u.tier || 'Free'} Node</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-gray-200 hover:text-red-500"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                         <span className="text-[8px] font-black uppercase text-gray-400 block">Node Channel</span>
                         <span className="text-[10px] font-bold text-gray-600 truncate block">{u.email}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[8px] font-black uppercase text-gray-400 block">Balance</span>
                         <span className="text-xs font-black text-emerald-950">{u.credits} <span className="opacity-40">USDT</span></span>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* DESKTOP VIEW */}
           <div className="hidden lg:block overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Merchant Identity</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Node Channels</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Participant Tier</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredUsers.map(u => (
                     <tr key={u.id} className="hover:bg-emerald-50/20 transition-all group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl group-hover:scale-110 transition-transform">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-emerald-950 text-base">{u.name}</p>
                                <p className="text-[9px] font-black text-gray-300 uppercase mt-1 tracking-widest">Joined {new Date(u.joinedAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><Mail className="w-4 h-4 text-emerald-400 opacity-50" /> {u.email}</div>
                              {u.phone && <div className="flex items-center gap-2 text-[10px] font-black text-emerald-950 uppercase tracking-tight"><Smartphone className="w-4 h-4 text-emerald-400 opacity-50" /> {u.phone}</div>}
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.tier === 'Elite' ? 'bg-emerald-950 text-emerald-400 border-emerald-900 shadow-xl' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                              {u.tier === 'Elite' && <Crown className="w-3.5 h-3.5 text-yellow-500" />} {u.tier || 'Free'} Participant
                           </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex items-center justify-end gap-4">
                              <div className="text-right">
                                <div className="text-sm font-black text-emerald-950">{u.credits} <span className="text-[8px] font-black text-gray-300 uppercase">USDT</span></div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase">Credits</div>
                              </div>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-3 text-gray-200 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                              >
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>

           {filteredUsers.length === 0 && (
             <div className="py-24 text-center">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-100 mx-auto mb-6" />
                <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest">No matching merchants in the network</p>
             </div>
           )}
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
