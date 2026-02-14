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
  Fingerprint
} from 'lucide-react';
import { storageService } from '../services/storageService.ts';
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
    const listing = listings.find(l => l.id === id);
    if (confirm(`PURGE DATA: Confirm permanent deletion of ${id}?`)) {
      storageService.deleteListing(id);
      setListings(storageService.getListings());
      notify('Data Purged', 'error', `Record ${id} removed from system.`);
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: NewsArticle = {
      id: Math.random().toString(36).substring(7),
      ...newsForm,
      author: 'Intelligence HQ',
      publishedAt: new Date().toISOString()
    };
    storageService.saveNews(newArticle);
    setNews(storageService.getNews());
    setShowNewsModal(false);
    notify('Intelligence Broadcasted', 'success', 'All nodes updated.');
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listings, searchQuery]);

  if (view === 'login' || view === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01110a] px-4 py-12 relative overflow-hidden">
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8 bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-serif-italic text-emerald-950">Command <span className="text-emerald-600">Console</span></h1>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button onClick={() => setShowNewsModal(true)} className="flex-1 lg:flex-none bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Global Broadcast</button>
          <button onClick={handleLogout} className="p-5 bg-gray-50 text-red-600 rounded-2xl hover:bg-red-50 transition-all border border-gray-100"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {['overview', 'listings', 'news'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === tab ? 'bg-emerald-950 text-white border-emerald-950 shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'listings' && (
        <div className="space-y-12">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-950">Asset Ledger</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredListings.map(l => (
                <div key={l.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <img src={l.images[0]} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-emerald-950 truncate max-w-xs">{l.title}</h4>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${l.status === AdStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {l.status !== AdStatus.ACTIVE && <button onClick={() => handleApprove(l.id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm"><CheckCircle className="w-5 h-5" /></button>}
                    {l.status !== AdStatus.REJECTED && <button onClick={() => handleReject(l.id)} className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-sm"><XCircle className="w-5 h-5" /></button>}
                    <button onClick={() => handleDeleteListing(l.id)} className="p-3 bg-white text-gray-300 hover:text-red-600 border border-gray-100 rounded-xl transition-all shadow-sm"><Trash className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showNewsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif-italic text-emerald-950">Broadcast Intel</h2>
              <button onClick={() => setShowNewsModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateNews} className="space-y-6">
              <input required placeholder="Headline" value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-emerald-500" />
              <textarea required rows={6} placeholder="Detailed Briefing" value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} className="w-full bg-gray-50 p-6 rounded-[32px] font-medium outline-none border border-transparent focus:border-emerald-500" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Authorize Broadcast</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;