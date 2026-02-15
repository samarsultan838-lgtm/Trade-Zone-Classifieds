
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
  ImageIcon,
  Loader2,
  Upload,
  CloudUpload,
  ClipboardCheck,
  History,
  Smartphone,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  DollarSign
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
  CartesianGrid,
  Legend
} from 'recharts';
import { storageService } from '../services/storageService.ts';
import { processImage } from '../services/imageService.ts';
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'news' | 'users'>('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Trend' as NewsArticle['category'],
    image: '',
    content: ''
  });

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
    setIsUploading(true);
    await storageService.syncWithCloud();
    initializeDashboard();
    notify('Ledger Synchronized', 'info', 'Regional data nodes refreshed');
    setIsUploading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 1000));
    const creds = storageService.getAdminAuth();
    if (creds && creds.password === password) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
      notify('Vault Authorized', 'success', 'Administrative session active');
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

  // --- ANALYTICS COMPUTATION ---
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

  const pendingListings = useMemo(() => listings.filter(l => l.status === AdStatus.PENDING), [listings]);
  
  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  , [users, searchQuery]);

  const activeInventory = useMemo(() => 
    listings.filter(l => l.status !== AdStatus.PENDING && l.title.toLowerCase().includes(searchQuery.toLowerCase()))
  , [listings, searchQuery]);

  const totalValue = useMemo(() => {
    return listings.reduce((acc, curr) => acc + (curr.price || 0), 0);
  }, [listings]);

  if (view === 'login' || view === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-4">
        <div className="bg-[#051c12] border border-emerald-900/50 p-12 rounded-[48px] shadow-4xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-950 border border-emerald-500/30 rounded-[32px] mx-auto flex items-center justify-center text-emerald-400 mb-8 shadow-2xl">
            {view === 'setup' ? <Key className="w-8 h-8" /> : <Fingerprint className="w-10 h-10" />}
          </div>
          <h1 className="text-3xl font-serif-italic text-white mb-8">{view === 'setup' ? 'Establish Master Node' : 'Vault Authorization'}</h1>
          <form onSubmit={view === 'setup' ? (e) => { e.preventDefault(); storageService.setAdminAuth(password, 'RECOVERY-KEY'); initializeDashboard(); } : handleLogin} className="space-y-6">
            <input type="password" placeholder="Administrative Key" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-5 text-center font-bold text-white placeholder:text-emerald-900 focus:border-emerald-500 outline-none transition-all shadow-inner" />
            <button disabled={isAuthorizing} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize Entry'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-12 min-h-screen">
      {/* Dynamic Notifications */}
      <div className="fixed top-8 right-8 z-[300] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`w-80 p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-4 animate-in slide-in-from-right-8 bg-white ${n.type === 'error' ? 'border-red-100 text-red-900' : 'border-emerald-100 text-emerald-900'}`}>
            <Zap className={`w-5 h-5 mt-1 ${n.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`} />
            <div>
              <p className="text-sm font-black uppercase tracking-tight">{n.message}</p>
              {n.subtext && <p className="text-[10px] font-bold opacity-60 uppercase mt-0.5">{n.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm mb-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif-italic text-emerald-950">Command <span className="text-emerald-600">Center</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2">Verified Institutional Workspace • Session Secure</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSync} className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100">
            <RefreshCw className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowNewsModal(true)} className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-500 transition-all">Broadcast Intel</button>
          <button onClick={handleLogout} className="p-5 bg-gray-50 text-red-600 rounded-2xl hover:bg-red-50 transition-all border border-gray-100"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {['overview', 'listings', 'users', 'news'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === tab ? 'bg-emerald-950 text-white border-emerald-950 shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Market Reach</p><h3 className="text-3xl font-black text-emerald-950">{listings.length} Ads</h3></div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Layers className="w-6 h-6" /></div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Merchant Ledger</p><h3 className="text-3xl font-black text-emerald-950">{users.length} Nodes</h3></div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Inventory Value</p><h3 className="text-2xl font-black text-emerald-950 truncate max-w-[150px]">{(totalValue/1000000).toFixed(1)}M</h3></div>
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600"><DollarSign className="w-6 h-6" /></div>
            </div>
            <div className={`p-8 rounded-[40px] border shadow-sm flex items-center justify-between transition-all ${pendingListings.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <div><p className={`text-[10px] font-black uppercase mb-1 ${pendingListings.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Pending Audits</p><h3 className={`text-3xl font-black ${pendingListings.length > 0 ? 'text-amber-700' : 'text-emerald-950'}`}>{pendingListings.length}</h3></div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pendingListings.length > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}><Clock className="w-6 h-6" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart 1: Status Distribution */}
            <div className="lg:col-span-2 bg-white rounded-[48px] p-8 md:p-12 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-3"><Activity className="w-5 h-5 text-emerald-500" /> Inventory Liquidity Signal</h3>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Status Mix</div>
               </div>
               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryHealth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9ca3af' }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[12, 12, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Chart 2: Category Velocity */}
            <div className="bg-emerald-950 rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
               <h3 className="text-xl font-bold mb-10 flex items-center gap-3"><PieChartIcon className="w-5 h-5 text-emerald-400" /> Category Velocity</h3>
               <div className="h-[250px] w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketMixData} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={8}>
                         {marketMixData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', color: '#000' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-8">
                  {marketMixData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                       <span className="text-[10px] font-black uppercase opacity-60 truncate">{item.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-950 uppercase tracking-tight">Merchant Registry</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Verified Trade Network Participants Ledger</p>
            </div>
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input type="text" placeholder="Search Merchant Identity..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-50 rounded-[20px] py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-80 shadow-inner" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Node</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Communication Nodes</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Tier Status</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg">{u.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-emerald-950 text-base">{u.name}</p>
                          <p className="text-[10px] font-black text-gray-300 uppercase mt-0.5">Joined {new Date(u.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {u.email}</div>
                          {u.phone && <div className="flex items-center gap-2 text-xs font-black text-emerald-950"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> {u.phone}</div>}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.tier === 'Elite' ? 'bg-emerald-950 text-white border-emerald-900' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {u.tier === 'Elite' && <Crown className="w-3 h-3 text-yellow-500" />} {u.tier || 'Free'} Participant
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <span className="text-lg font-black text-emerald-950">{u.credits}</span><span className="text-[9px] font-black text-gray-300 ml-1 uppercase">USDT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="bg-emerald-950 rounded-[48px] border border-emerald-900 shadow-2xl overflow-hidden">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-4"><ClipboardCheck className="text-emerald-500" /> Audit Queue</h2>
              <span className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingListings.length} Awaiting Verification</span>
            </div>
            <div className="divide-y divide-white/5">
              {pendingListings.map(l => (
                <div key={l.id} className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-8 w-full">
                    <img src={l.images[0]} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2"><span className="text-[10px] font-black text-emerald-500 uppercase">{l.id}</span><span className="text-[9px] font-bold text-white/30 uppercase">{new Date(l.createdAt).toLocaleDateString()}</span></div>
                      <h4 className="text-white font-bold text-xl truncate mb-3">{l.title}</h4>
                      <div className="flex gap-2"><span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black text-emerald-400 uppercase">{l.category}</span><span className="px-3 py-1 bg-emerald-600 rounded-lg text-[9px] font-black text-white uppercase">{l.currency} {l.price.toLocaleString()}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full lg:w-auto justify-end">
                    <Link to={`/listing/${l.id}`} className="p-4 bg-white/10 text-white/60 rounded-2xl hover:bg-white/20"><Eye className="w-5 h-5" /></Link>
                    <button className="flex-1 lg:flex-none px-10 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500">Approve</button>
                    <button className="flex-1 lg:flex-none px-10 bg-red-600/20 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white border border-red-900/50">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-emerald-950 uppercase tracking-tight">Regional Inventory Ledger</h2>
                <div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Filter Ledger..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none w-80 shadow-inner" /></div>
             </div>
             <table className="w-full text-left">
                <thead className="bg-gray-50/50"><tr><th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Asset</th><th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Merchant ID</th><th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Status</th><th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400">Market Value</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {activeInventory.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/50">
                      <td className="px-10 py-6"><div className="flex items-center gap-4"><img src={l.images[0]} className="w-12 h-12 rounded-xl object-cover grayscale" /><div><p className="font-bold text-emerald-950 text-sm">{l.title}</p><p className="text-[9px] font-black text-emerald-500 uppercase">{l.id}</p></div></div></td>
                      <td className="px-10 py-6 text-xs font-bold text-gray-500">{l.userId}</td>
                      <td className="px-10 py-6"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${l.status === AdStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{l.status}</span></td>
                      <td className="px-10 py-6 font-black text-emerald-950 text-sm">{l.currency} {l.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
