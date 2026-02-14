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
  CloudUpload
} from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { processImage } from '../services/imageService.ts';
import { Listing, AdStatus, NewsArticle, User } from '../types.ts';
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'news'>('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
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
    setView('dashboard');
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

  const filteredListings = useMemo(() => {
    return listings.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listings, searchQuery]);

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
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/30" />
              <input type="password" placeholder="Keyphrase Protocol" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-900/50 rounded-2xl py-5 pl-14 pr-6 outline-none text-center font-bold text-white placeholder:text-emerald-900 focus:border-emerald-500 transition-all shadow-inner" />
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
        <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">Command <span className="text-emerald-600">Console</span></h1>
        <div className="flex items-center gap-3 w-full lg:w-auto">
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
        {['overview', 'listings', 'news'].map(tab => (
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

      {activeTab === 'news' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-950">Intelligence Ledger</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{news.length} Broadcasts Active</p>
          </div>
          <div className="divide-y divide-gray-50">
            {news.map(n => (
              <div key={n.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                 <div className="flex items-center gap-6 w-full sm:w-auto">
                    <img src={n.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="" />
                    <div className="min-w-0">
                       <h4 className="font-bold text-emerald-950 text-lg truncate max-w-md">{n.title}</h4>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{n.category}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.publishedAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button onClick={() => handleDeleteNews(n.id)} className="p-4 bg-white text-gray-300 hover:text-red-600 border border-gray-100 rounded-2xl transition-all shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="text-center py-24">
                <Radio className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Network Silent</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No intelligence broadcasts active in system history.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-950">Asset Ledger</h2>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                type="text" 
                placeholder="ID or Title..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 w-64"
               />
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredListings.map(l => (
              <div key={l.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <img src={l.images[0]} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-emerald-950 truncate max-w-xs">{l.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black uppercase text-emerald-600">{l.id}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${l.status === AdStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {l.status !== AdStatus.ACTIVE && <button onClick={() => handleApprove(l.id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle className="w-5 h-5" /></button>}
                  {l.status !== AdStatus.REJECTED && <button onClick={() => handleReject(l.id)} className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm hover:bg-amber-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>}
                  <button onClick={() => handleDeleteListing(l.id)} className="p-3 bg-white text-gray-300 hover:text-red-600 border border-gray-100 rounded-xl transition-all shadow-sm"><Trash className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
           {[
             { label: 'Active Inventory', val: listings.filter(l => l.status === AdStatus.ACTIVE).length, icon: Layers, color: 'text-emerald-600' },
             { label: 'Pending Audits', val: listings.filter(l => l.status === AdStatus.PENDING).length, icon: Clock, color: 'text-amber-500' },
             { label: 'Total Node Usage', val: '4.2k+', icon: Users, color: 'text-blue-600' },
             { label: 'Intelligence Depth', val: news.length, icon: Newspaper, color: 'text-purple-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                   <p className="text-3xl font-black text-emerald-950">{stat.val}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
           ))}
        </div>
      )}

      {/* OVERHAULED BROADCAST INTEL MODAL */}
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
              
              {/* Category Spectrum Selector */}
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
                      {cat === 'Expert Advice' ? 'Expert News' : cat === 'Tech Update' ? 'Tech Update Spectrum' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Node (Image Upload) Section */}
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
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Recommended: 21:9 Ultra-Wide</p>
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

              {/* Headline and Briefing Content */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <input 
                    required 
                    placeholder="Intelligence Headline" 
                    value={newsForm.title} 
                    onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} 
                    className="w-full bg-gray-50 p-6 rounded-2xl font-bold text-lg outline-none border-2 border-transparent focus:border-emerald-500 placeholder:text-gray-300 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <textarea 
                    required 
                    rows={6} 
                    placeholder="Detailed Briefing Content..." 
                    value={newsForm.content} 
                    onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} 
                    className="w-full bg-gray-50 p-8 rounded-[32px] font-medium text-base outline-none border-2 border-transparent focus:border-emerald-500 leading-relaxed placeholder:text-gray-300 transition-all" 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isUploading || !newsForm.image || !newsForm.title || !newsForm.content}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-3xl shadow-emerald-600/30 flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
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