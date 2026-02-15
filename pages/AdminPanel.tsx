
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
  Activity
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

  const handleSync = () => {
    initializeDashboard();
    notify('Ledger Synchronized', 'info', 'All regional data nodes refreshed');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 1200));
    const creds = storageService.getAdminAuth();
    if (creds && creds.password === password) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
      notify('Access Granted', 'success', 'Administrative Node: Authorized');
    } else {
      notify('Authorization Denied', 'error', 'Invalid security keyphrase');
    }
    setIsAuthorizing(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
    setPassword('');
    notify('Vault Locked', 'info', 'Session terminated successfully');
  };

  const handleApprove = (id: string) => {
    const updated = listings.map(l => l.id === id ? { ...l, status: AdStatus.ACTIVE } : l);
    setListings(updated);
    const item = updated.find(l => l.id === id);
    if (item) storageService.saveListing(item);
    notify('Asset Published', 'success', `ID: ${id} is now live.`);
  };

  const handleReject = (id: string) => {
    const updated = listings.map(l => l.id === id ? { ...l, status: AdStatus.REJECTED } : l);
    setListings(updated);
    const item = updated.find(l => l.id === id);
    if (item) storageService.saveListing(item);
    notify('Asset Restricted', 'warning', `Client informed of protocol rejection for ${id}`);
  };

  const handleDeleteListing = (id: string) => {
    if (confirm(`PURGE DATA: Confirm permanent deletion of ${id}?`)) {
      storageService.deleteListing(id);
      setListings(storageService.getListings());
      notify('Data Purged', 'error', `Record ${id} removed from system.`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await processImage(file);
      setNewsForm(prev => ({ ...prev, image: base64 }));
      notify('Intelligence Media Processed', 'success', 'High-fidelity asset ready for broadcast');
    } catch (err) {
      notify('Upload Failed', 'error', 'Could not process media node');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.image) {
      notify('Incomplete Protocol', 'error', 'Broadcasting requires a visual intelligence node');
      return;
    }
    const newArticle: NewsArticle = {
      id: Math.random().toString(36).substring(7),
      ...newsForm,
      author: 'Trazot Admin Node',
      publishedAt: new Date().toISOString()
    };
    storageService.saveNews(newArticle);
    setNews(storageService.getNews());
    setShowNewsModal(false);
    setNewsForm({
      title: '',
      category: 'Market Trend',
      image: '',
      content: ''
    });
    notify('Intelligence Broadcasted', 'success', 'All regional nodes updated.');
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('PURGE INTEL: Permanently remove this broadcast from history?')) {
      storageService.deleteNews(id);
      setNews(storageService.getNews());
      notify('Intel Purged', 'info', 'Broadcast removed from network');
    }
  };

  // --- ANALYTICS COMPUTATION ---
  const marketMixData = useMemo(() => {
    const counts = listings.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    return Object.keys(counts).map((key, i) => ({
      name: key,
      value: counts[key],
      color: colors[i % colors.length]
    }));
  }, [listings]);

  const activeVsSoldData = useMemo(() => [
    { name: 'Active', count: listings.filter(l => l.status === AdStatus.ACTIVE).length },
    { name: 'Pending', count: listings.filter(l => l.status === AdStatus.PENDING).length },
    { name: 'Sold', count: listings.filter(l => l.status === AdStatus.SOLD).length },
    { name: 'Rejected', count: listings.filter(l => l.status === AdStatus.REJECTED).length },
  ], [listings]);

  const pendingListings = useMemo(() => {
    return listings.filter(l => l.status === AdStatus.PENDING);
  }, [listings]);

  const activeInventory = useMemo(() => {
    return listings.filter(l => 
      l.status !== AdStatus.PENDING && 
      (l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [listings, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const notificationOverlay = (
    <div className="fixed top-8 right-8 z-[300] space-y-3 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className={`w-80 p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-4 animate-in slide-in-from-right-8 ${
          n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          n.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
          n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className={`mt-1 ${n.type === 'success' ? 'text-emerald-500' : n.type === 'error' ? 'text-red-500' : n.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
             <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">{n.message}</p>
            {n.subtext && <p className="text-[10px] font-bold opacity-60 uppercase mt-0.5">{n.subtext}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  if (view === 'login' || view === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-4 py-12 relative overflow-hidden">
        {notificationOverlay}
        <div className="bg-[#051c12] border border-emerald-900/50 p-8 md:p-16 rounded-[48px] shadow-4xl max-w-md w-full text-center relative z-10 backdrop-blur-xl">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-emerald-950 border border-emerald-500/30 rounded-[32px] mx-auto flex items-center justify-center text-emerald-400 relative z-10 shadow-2xl">
              {view === 'setup' ? <Key className="w-8 h-8" /> : <Fingerprint className="w-10 h-10" />}
            </div>
          </div>
          <h1 className="text-3xl font-serif-italic text-white mb-3">{view === 'setup' ? 'Establish Master Node' : 'Vault Authorization'}</h1>
          <form onSubmit={view === 'setup' ? (e) => { e.preventDefault(); storageService.setAdminAuth(password, 'MASTER-RECOVERY'); initializeDashboard(); } : handleLogin} className="space-y-6">
            <div className="relative group">
              <input type="password" placeholder="Keyphrase Protocol" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-5 pl-6 pr-6 outline-none text-center font-bold text-white placeholder:text-emerald-900 focus:border-emerald-500 transition-all shadow-inner" />
            </div>
            <button disabled={isAuthorizing} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3">
              {isAuthorizing ? 'Handshake...' : view === 'setup' ? 'Initialize Node' : 'Authorize Entry'}
              {!isAuthorizing && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12 min-h-screen">
      {notificationOverlay}
      
      {/* Dashboard Top Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8 bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">Command <span className="text-emerald-600">Console</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-2">Intelligence Node • Verified Secure Session</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={handleSync}
            className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100"
            title="Sync Regional Nodes"
          >
            <RefreshCw className={`w-5 h-5 ${isUploading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => {
              setNewsForm({ title: '', category: 'Market Trend', image: '', content: '' });
              setShowNewsModal(true);
            }} 
            className="flex-1 lg:flex-none bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-500 transition-all active:scale-95"
          >
            Broadcast Intel
          </button>
          <button onClick={handleLogout} className="p-5 bg-gray-50 text-red-600 rounded-2xl hover:bg-red-50 transition-all border border-gray-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {['overview', 'listings', 'users', 'news'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)} 
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
              activeTab === tab ? 'bg-emerald-950 text-white border-emerald-950 shadow-xl' : 'bg-white text-gray-400 border-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Global Inventory</p>
                <h3 className="text-3xl font-black text-emerald-950">{listings.length}</h3>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Layers className="w-6 h-6" /></div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Verified Merchants</p>
                <h3 className="text-3xl font-black text-emerald-950">{users.length}</h3>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Network Intel</p>
                <h3 className="text-3xl font-black text-emerald-950">{news.length}</h3>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Radio className="w-6 h-6" /></div>
            </div>
            <div className={`p-8 rounded-[40px] border shadow-sm flex items-center justify-between transition-all ${pendingListings.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
              <div>
                <p className={`text-[10px] font-black uppercase mb-1 ${pendingListings.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Pending Audits</p>
                <h3 className={`text-3xl font-black ${pendingListings.length > 0 ? 'text-amber-700' : 'text-emerald-950'}`}>{pendingListings.length}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pendingListings.length > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}><Clock className="w-6 h-6" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[48px] p-8 md:p-12 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-3"><Activity className="w-5 h-5 text-emerald-500" /> Inventory Status Mix</h3>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-widest">Real-time Node Signals</div>
               </div>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeVsSoldData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9ca3af' }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-emerald-950 rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
               <h3 className="text-xl font-bold mb-10 flex items-center gap-3"><PieChartIcon className="w-5 h-5 text-emerald-400" /> Category Velocity</h3>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketMixData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={8}>
                         {marketMixData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', color: '#000' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-6">
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
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-emerald-950 uppercase tracking-tight">Merchant Registry</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Verified Trade Network Participants</p>
            </div>
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                type="text" 
                placeholder="Search by Name or Email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-50 rounded-[20px] py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-80 shadow-inner"
               />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Communication Node</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tier Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-emerald-950 text-sm">{u.name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Joined: {new Date(u.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                             <Mail className="w-3 h-3 text-emerald-500" /> {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                               <Smartphone className="w-3 h-3 text-emerald-500" /> {u.phone}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.tier === 'Elite' ? 'bg-emerald-950 text-white border-emerald-900' :
                        u.tier === 'Professional' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {u.tier === 'Elite' && <Crown className="w-3 h-3 text-yellow-500" />}
                        {u.tier || 'Free'} Participant
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-sm font-black text-emerald-950">{u.credits}</span>
                       <span className="text-[9px] font-black text-gray-300 ml-1 uppercase">USDT</span>
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
          
          {/* Audit Queue */}
          <div className="bg-emerald-950 rounded-[40px] border border-emerald-900 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                   <ClipboardCheck className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-bold text-white uppercase tracking-tight">Audit Queue</h2>
              </div>
              <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                {pendingListings.length} Awaiting Verification
              </span>
            </div>
            
            <div className="divide-y divide-white/5 bg-white/5">
              {pendingListings.map(l => (
                <div key={l.id} className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-8 w-full">
                    <div className="relative group">
                      <img src={l.images[0]} className="w-24 h-24 rounded-3xl object-cover shadow-2xl" alt="" />
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">{l.id}</span>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{new Date(l.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-white text-xl truncate mb-2">{l.title}</h4>
                      <div className="flex flex-wrap gap-2">
                         <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/10 text-emerald-400 border border-white/5">{l.category}</span>
                         <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/10 text-emerald-400 border border-white/5">{l.location.city}</span>
                         <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-600 text-white">{l.currency} {l.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    <Link to={`/listing/${l.id}`} target="_blank" className="p-4 bg-white/5 text-white/60 rounded-2xl hover:bg-white/20 transition-all">
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleApprove(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(l.id)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-amber-600/20 text-amber-500 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-600/30">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingListings.length === 0 && (
                <div className="text-center py-20">
                  <ShieldCheck className="w-16 h-16 text-emerald-900/40 mx-auto mb-6" />
                  <p className="text-emerald-100/20 text-sm font-black uppercase tracking-[0.4em]">Audit Queue Clear</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Inventory Ledger */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-emerald-950 uppercase tracking-tight">Regional Inventory Ledger</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Full Visibility Node Monitoring</p>
              </div>
              <div className="relative">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                  type="text" 
                  placeholder="Filter by ID, Title, or Merchant..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-gray-50 rounded-[20px] py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-80 shadow-inner"
                 />
              </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Asset Node</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Merchant</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Market Value</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeInventory.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <img src={l.images[0]} className="w-12 h-12 rounded-xl object-cover grayscale" />
                             <div>
                                <p className="font-bold text-emerald-950 text-sm truncate max-w-[200px]">{l.title}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase">{l.id}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <p className="text-xs font-bold text-gray-500 truncate max-w-[120px]">{l.userId}</p>
                           <p className="text-[9px] font-black text-gray-300 uppercase">{l.location.city}</p>
                        </td>
                        <td className="px-8 py-5">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border ${
                              l.status === AdStatus.ACTIVE ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                              l.status === AdStatus.SOLD ? 'bg-gray-100 border-gray-200 text-gray-600' :
                              'bg-amber-50 border-amber-100 text-amber-700'
                           }`}>
                              {l.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 font-black text-emerald-950 text-xs">
                           {l.currency} {l.price.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                             <Link to={`/listing/${l.id}`} className="p-2 text-gray-400 hover:text-emerald-600"><Eye className="w-4 h-4" /></Link>
                             <button onClick={() => handleDeleteListing(l.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Intel Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-xl">
          <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-2xl w-full shadow-4xl animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-serif-italic text-emerald-950">Broadcast <span className="text-emerald-600">Intel</span></h2>
              <button 
                onClick={() => setShowNewsModal(false)} 
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNews} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Intelligence Spectrum</label>
                <div className="flex flex-wrap gap-2">
                  {['Market Trend', 'Trade Zone News', 'Expert Advice', 'Tech Update'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewsForm(p => ({ ...p, category: cat as any }))}
                      className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        newsForm.category === cat 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' 
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-emerald-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2">Visual Intelligence Node</label>
                <div 
                  onClick={() => document.getElementById('broadcast-image-upload')?.click()}
                  className={`w-full aspect-[21/9] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden ${
                    newsForm.image ? 'border-emerald-200' : 'border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  {newsForm.image ? (
                    <>
                      <img src={newsForm.image} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-emerald-950/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                         <CloudUpload className="w-8 h-8 mb-2" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Replace Visual Node</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                         {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black uppercase text-emerald-950 tracking-widest">{isUploading ? 'Node Handshaking...' : 'Upload Asset Media'}</p>
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="broadcast-image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <input 
                  required 
                  placeholder="Intelligence Headline" 
                  value={newsForm.title} 
                  onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} 
                  className="w-full bg-gray-50 p-6 rounded-2xl font-bold text-lg outline-none border-2 border-transparent focus:border-emerald-500 placeholder:text-gray-300 transition-all" 
                />
                <textarea 
                  required 
                  rows={6} 
                  placeholder="Detailed Briefing Content..." 
                  value={newsForm.content} 
                  onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} 
                  className="w-full bg-gray-50 p-8 rounded-[32px] font-medium text-base outline-none border-2 border-transparent focus:border-emerald-500 leading-relaxed placeholder:text-gray-300 transition-all" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isUploading || !newsForm.image || !newsForm.title || !newsForm.content}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-3xl shadow-emerald-600/30 flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}
                Authorize Global Broadcast
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
