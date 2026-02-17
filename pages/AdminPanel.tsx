import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock,
  LogOut,
  Fingerprint,
  Loader2,
  Key,
  ShieldAlert,
  Activity,
  Layers,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Trash2,
  Newspaper,
  Plus,
  Eye,
  X,
  FileText,
  ImageIcon,
  Send,
  Sparkles,
  RefreshCw,
  Search,
  Receipt,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Filter,
  CheckCircle2,
  MoreVertical,
  Mail,
  Zap,
  Globe,
  Bell,
  Coins,
  BadgeCheck,
  Rocket,
  Wand2,
  Tag as TagIcon,
  Layout,
  MessageCircle,
  MapPin,
  TrendingUp,
  Smartphone,
  ExternalLink,
  Database,
  Server,
  Calendar,
  Wifi,
  Cpu,
  History,
  Terminal,
  Bug,
  RotateCcw,
  Ghost,
  UserCheck,
  Gift,
  MailSearch
} from 'lucide-react';
import { storageService, MASTER_EMERGENCY_KEY, OFFICIAL_DOMAIN } from '../services/storageService.ts';
import { Listing, NewsArticle, User as UserType, AdStatus, Dealer, ProjectPromotion } from '../types.ts';
import { Link } from 'react-router-dom';
import { COUNTRIES, CITIES } from '../constants.ts';
import { optimizeNewsArticle } from '../services/geminiService.ts';
import { processImage } from '../services/imageService.ts';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';
type DashboardSubView = 'overview' | 'listings' | 'news' | 'users' | 'security' | 'trash' | 'subscribers';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [subView, setSubView] = useState<DashboardSubView>('overview');
  const [password, setPassword] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<{status: string, latency: number}>({ status: 'Testing...', latency: 0 });

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [awardAmount, setAwardAmount] = useState<number>(5);
  const [isAwarding, setIsAwarding] = useState<string | null>(null);

  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Trend' as NewsArticle['category'],
    image: '',
    content: '',
    metaDescription: '',
    tags: '',
    author: 'Bureau Chief'
  });

  const dbConfig = { user: 'u550128434_trazot_admin', db: 'u550128434_trazot_db', createdAt: '2026-02-15' };

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) setView('setup');
    if (sessionStorage.getItem('tz_admin_session')) initializeDashboard();

    const healthPoll = setInterval(async () => {
      if (sessionStorage.getItem('tz_admin_session')) {
        const health = await storageService.getBackendHealth();
        setDbHealth(health);
        setSecurityLogs(storageService.security.getLogs());
        setUsers(storageService.getUsers());
        setSubscribers(storageService.getSubscribers());
      }
    }, 10000);
    return () => clearInterval(healthPoll);
  }, []);

  const initializeDashboard = async () => {
    setListings(storageService.getListings());
    setUsers(storageService.getUsers());
    setNews(storageService.getNews());
    setSubscribers(storageService.getSubscribers());
    setSecurityLogs(storageService.security.getLogs());
    const health = await storageService.getBackendHealth();
    setDbHealth(health);
    setView('dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    await new Promise(r => setTimeout(r, 600));
    const creds = storageService.getAdminAuth();
    if (creds && (creds.password === password)) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
    } else {
      storageService.security.logThreat('Failed Admin Login', `IP: 0.0.0.0 (Unauthorized Signature)`);
      alert('Security Protocol Violation. Attempt Logged.');
    }
    setIsAuthorizing(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
  };

  const handleAward = async (userId: string) => {
    setIsAwarding(userId);
    try {
      await storageService.awardCredits(userId, awardAmount);
      setUsers(storageService.getUsers());
      alert(`Successfully provisioned ${awardAmount} credits.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAwarding(null);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: NewsArticle = {
      id: `INTEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: newsForm.title,
      slug: newsForm.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      content: newsForm.content,
      metaDescription: newsForm.metaDescription || newsForm.content.substring(0, 150),
      tags: newsForm.tags.split(',').map(t => t.trim()).filter(t => t),
      image: newsForm.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      category: newsForm.category,
      author: newsForm.author,
      publishedAt: new Date().toISOString()
    };
    
    await storageService.saveNews(newArticle);
    setNews(storageService.getNews());
    setShowNewsModal(false);
    setNewsForm({ title: '', category: 'Market Trend', image: '', content: '', metaDescription: '', tags: '', author: 'Bureau Chief' });
  };

  const handleAIEnhanceNews = async () => {
    if (!newsForm.title || !newsForm.content) {
      alert("Please provide a title and content for the AI to analyze.");
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await optimizeNewsArticle(newsForm.title, newsForm.content, newsForm.category);
      if (result) {
        setNewsForm(prev => ({
          ...prev,
          title: result.optimizedTitle,
          content: result.optimizedContent,
          metaDescription: result.metaDescription,
          tags: result.tags.join(', ')
        }));
      }
    } catch (error) {
      console.error("AI news optimization failed", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Permanently redact this briefing?')) {
      await storageService.deleteNews(id);
      setNews(storageService.getNews());
    }
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

  const handleTrashListing = async (id: string) => {
    if (confirm('Move this transmission to Trash Ledger? It will be hidden from all users.')) {
      await storageService.deleteListing(id);
      setListings(storageService.getListings());
    }
  };

  const handleRestoreListing = async (id: string) => {
    await storageService.restoreListing(id);
    setListings(storageService.getListings());
  };

  const handlePurgeListing = async (id: string) => {
    if (confirm('CRYSTAL PURGE: Permanently erase this asset from the global node and cloud database? This cannot be undone.')) {
      await storageService.purgeListing(id);
      setListings(storageService.getListings());
    }
  };

  if (view !== 'dashboard') {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6 text-white text-center flex-col gap-6">
        <Terminal className="w-16 h-16 text-emerald-500 mb-2 opacity-50" />
        <h1 className="text-3xl font-serif-italic">Bureau Access Required</h1>
        <form onSubmit={handleLogin} className="max-w-md w-full space-y-4">
           <input type="password" placeholder="Authorization Signature" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-emerald-900 border-none rounded-2xl p-5 text-center font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-white" />
           <button type="submit" disabled={isAuthorizing} className="w-full bg-emerald-500 text-emerald-950 py-5 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
             {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Enter Secure Node'}
           </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 px-4 md:px-8 pt-8 animate-in fade-in duration-500">
      <header className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shrink-0">
             <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-5xl font-serif-italic text-emerald-950 leading-tight">Bureau <span className="text-emerald-600">Command</span></h1>
            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Operational Integrity: 99.9% • {OFFICIAL_DOMAIN}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          <button onClick={() => setSubView('trash')} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 hover:bg-red-50 transition-all">
             <Trash2 className="w-4 h-4 text-gray-400" />
             <div className="text-left">
                <p className="text-[7px] font-black uppercase text-gray-400">Trash Bin</p>
                <p className="text-[9px] font-black text-gray-600">{listings.filter(l => l.status === AdStatus.TRASHED).length} Items</p>
             </div>
          </button>
          <button onClick={() => setShowNewsModal(true)} className="px-4 py-3 md:px-6 md:py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-2 md:gap-3 hover:bg-emerald-500 shadow-lg active:scale-95 transition-all">
             <Newspaper className="w-4 h-4" /> Publish Briefing
          </button>
          <button onClick={handleLogout} className="px-4 py-3 md:px-6 md:py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-2 md:gap-3 hover:bg-red-100 transition-all">
             <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </header>

      <div className="flex gap-2 md:gap-3 mb-8 md:mb-10 overflow-x-auto scrollbar-hide pb-2 px-1">
        {[
          { id: 'overview', label: 'Summary', icon: Activity },
          { id: 'listings', label: 'Ledger Oversight', icon: Layers },
          { id: 'news', label: 'Editorial Office', icon: Newspaper },
          { id: 'security', label: 'Threat Center', icon: ShieldAlert },
          { id: 'users', label: 'Network Citizens', icon: UsersIcon },
          { id: 'subscribers', label: 'Subscribers', icon: MailSearch }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setSubView(tab.id as any)}
            className={`px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all shrink-0 border ${subView === tab.id ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100'}`}
          >
            <tab.icon className="w-4 h-4 md:w-4.5 md:h-4.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] md:rounded-[56px] p-6 md:p-16 border border-gray-100 shadow-sm min-h-[500px]">
        
        {subView === 'subscribers' && (
           <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
              <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Newsletter <span className="text-emerald-600">Protocol</span></h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Automatic intelligence relay endpoints</p>
                </div>
                <div className="px-5 py-2.5 bg-emerald-50 rounded-xl text-emerald-700 font-black text-[11px] uppercase tracking-widest border border-emerald-100">
                  Subscribers: {subscribers.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {subscribers.map((email, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex items-center gap-4 hover:bg-white hover:shadow-lg transition-all group">
                       <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                          <Mail className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                          <p className="font-bold text-emerald-950 text-sm truncate">{email}</p>
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Relay</p>
                       </div>
                    </div>
                 ))}
                 {subscribers.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                       <MailSearch className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                       <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No subscribers registered for automatic briefings</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        {subView === 'users' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Citizen <span className="text-emerald-600">Ledger</span></h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage network participants and provision trade credits</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-50 px-4 py-2 rounded-xl flex flex-col items-center">
                      <span className="text-[8px] font-black text-emerald-600 uppercase">Award Amount</span>
                      <select 
                        value={awardAmount} 
                        onChange={e => setAwardAmount(Number(e.target.value))}
                        className="bg-transparent font-black text-emerald-950 outline-none cursor-pointer"
                      >
                         {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Credits</option>)}
                      </select>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6">
                 {users.map(user => (
                    <div key={user.id} className="bg-gray-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center gap-4 md:gap-6 min-w-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                             <UserCheck className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-bold text-emerald-950 text-base truncate">{user.name}</h4>
                             <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate">{user.email} • {user.phone || 'No Phone'}</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white rounded shadow-sm">{user.credits} Credits</span>
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-white border border-gray-100 rounded text-gray-400">{user.country}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleAward(user.id)}
                        disabled={isAwarding === user.id}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                       >
                          {isAwarding === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4 text-emerald-400" />}
                          Award {awardAmount}
                       </button>
                    </div>
                 ))}
                 {users.length === 0 && (
                   <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                      <UsersIcon className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No citizens registered in node registry</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {subView === 'trash' && (
           <div className="space-y-12 animate-in fade-in duration-500">
             <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Trash <span className="text-red-600">Ledger</span></h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Soft-deleted transmissions awaiting restoration or final purge</p>
                </div>
                <div className="px-5 py-2.5 bg-red-50 rounded-xl text-red-700 font-black text-[11px] uppercase tracking-widest border border-red-100">
                  Capacity: {listings.filter(l => l.status === AdStatus.TRASHED).length} Items
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {listings.filter(l => l.status === AdStatus.TRASHED).map(l => (
                  <div key={l.id} className="bg-gray-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex flex-col justify-between gap-6 hover:bg-white hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-4">
                       <img src={l.images[0]} className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover grayscale opacity-50 shadow-sm shrink-0" />
                       <div className="min-w-0">
                          <h4 className="font-bold text-emerald-950 text-xs md:text-sm truncate">{l.title}</h4>
                          <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{l.id}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleRestoreListing(l.id)} className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all">
                          <RotateCcw className="w-3 h-3 md:w-3.5 md:h-3.5" /> Restore
                       </button>
                       <button onClick={() => handlePurgeListing(l.id)} className="flex-1 py-3 bg-red-50 text-red-700 rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                          <Ghost className="w-3 h-3 md:w-3.5 md:h-3.5" /> Purge
                       </button>
                    </div>
                  </div>
                ))}
                {listings.filter(l => l.status === AdStatus.TRASHED).length === 0 && (
                  <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                     <Trash2 className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                     <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Trash Ledger Empty</p>
                  </div>
                )}
             </div>
           </div>
        )}

        {subView === 'news' && (
          <div className="space-y-12">
            <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Editorial Registry</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Manage global briefings and market updates</p>
              </div>
              <div className="px-5 py-2.5 bg-emerald-50 rounded-xl text-emerald-700 font-black text-[11px] uppercase tracking-widest border border-emerald-100">
                Active Briefings: {news.length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
               {news.map(article => (
                 <div key={article.id} className="bg-gray-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                       <img src={article.image} className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-sm shrink-0" />
                       <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">{article.category}</span>
                             <span className="text-[8px] font-black text-gray-400 uppercase">{new Date(article.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-emerald-950 text-sm md:text-base truncate">{article.title}</h4>
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-medium line-clamp-1 mt-1">{article.metaDescription}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-end w-full md:w-auto">
                       <button onClick={() => handleDeleteNews(article.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                       </button>
                    </div>
                 </div>
               ))}
               {news.length === 0 && (
                 <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                    <Newspaper className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No briefings published to the node</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {subView === 'security' && (
           <div className="space-y-12">
              <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Security <span className="text-red-600">Firewall</span></h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time threat detection and bot mitigation</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-red-50 rounded-xl text-red-600 font-black text-[9px] md:text-[11px] uppercase tracking-widest border border-red-100">
                    Spam Intercepted: {securityLogs.filter(l => l.type.includes('Bot')).length}
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-black text-[9px] md:text-[11px] uppercase tracking-widest border border-emerald-100">
                    Clean Requests: 1.4k
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {securityLogs.length > 0 ? securityLogs.map((log, i) => (
                   <div key={i} className="bg-gray-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex items-center justify-between gap-4 md:gap-6 hover:border-red-200 transition-all">
                      <div className="flex items-center gap-4 md:gap-5">
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${log.type.includes('Threat') || log.type.includes('Login') ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            {log.type.includes('Bot') ? <Bug className="w-5 h-5 md:w-6 md:h-6" /> : <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] md:text-xs font-black text-emerald-950 uppercase truncate">{log.type}</p>
                            <p className="text-[9px] md:text-[11px] font-medium text-gray-500 mt-1 line-clamp-1">{log.details}</p>
                         </div>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                         <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
                      </div>
                   </div>
                 )) : (
                   <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                      <ShieldCheck className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No threat signatures detected in current cycle</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {subView === 'listings' && (
          <div className="space-y-12">
            <div className="pb-8 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Asset Ledger Clearance</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Review and authorize new transmission nodes</p>
              </div>
              <div className="px-5 py-2.5 bg-emerald-50 rounded-xl text-emerald-700 font-black text-[11px] uppercase tracking-widest border border-emerald-100">
                Queue: {listings.filter(l => l.status === AdStatus.PENDING).length}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {listings.filter(l => l.status === AdStatus.PENDING).map(l => (
                <div key={l.id} className="bg-gray-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 flex items-center justify-between gap-4 md:gap-6 hover:bg-white hover:shadow-2xl transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                       <img src={l.images[0]} className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-sm" />
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[9px] font-black shadow-lg">ID</div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-emerald-950 text-xs md:text-sm truncate">{l.title}</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{l.location.city} • {l.currency} {l.price.toLocaleString()}</p>
                      <div className="flex gap-2 mt-2">
                         <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-white border border-gray-100 rounded text-gray-400">{l.category}</span>
                         {l.featured && <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-amber-50 text-amber-600 rounded">Featured</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button onClick={() => handleApprove(l.id)} className="p-2.5 md:p-3.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"><CheckCircle className="w-5 h-5 md:w-5.5 md:h-5.5" /></button>
                    <button onClick={() => handleReject(l.id)} className="p-2.5 md:p-3.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"><XCircle className="w-5 h-5 md:w-5.5 md:h-5.5" /></button>
                  </div>
                </div>
              ))}
              {listings.filter(l => l.status === AdStatus.PENDING).length === 0 && (
                <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                  <ShieldCheck className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                  <p className="text-gray-400 text-sm font-black uppercase tracking-widest">No assets awaiting authorization.</p>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">Responsive Node: Standby Mode</p>
                </div>
              )}
            </div>

            <div className="pt-12 md:pt-16 border-t border-gray-100">
               <h3 className="text-xl md:text-2xl font-serif-italic text-emerald-950 mb-8 flex items-center gap-3">
                 <Database className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                 Global Registry Oversight
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.filter(l => l.status !== AdStatus.TRASHED).map(l => (
                    <div key={l.id} className="p-4 md:p-5 bg-white border border-gray-100 rounded-[20px] md:rounded-[28px] flex items-center justify-between group hover:shadow-lg transition-all">
                       <div className="flex items-center gap-3 md:gap-4 min-w-0">
                         <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 ${l.status === AdStatus.ACTIVE ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : l.status === AdStatus.PENDING ? 'bg-amber-500' : 'bg-red-500'}`} title={l.status} />
                         <div className="min-w-0">
                            <span className="text-[10px] md:text-xs font-black text-emerald-950 truncate block">{l.title}</span>
                            <span className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase tracking-tight">{l.id}</span>
                         </div>
                       </div>
                       <button onClick={() => handleTrashListing(l.id)} className="p-2 md:p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {subView === 'overview' && (
           <div className="space-y-12 md:space-y-16">
              <div className="text-center space-y-3 md:space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 md:mb-4">
                    <Cpu className="w-4 h-4" /> Integrity Protocol 3.3: ACTIVE
                 </div>
                 <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950">System Infrastructure Node</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                 <div className="bg-emerald-950 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-900 text-white relative overflow-hidden group">
                    <Server className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 text-emerald-900 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">MySQL Primary Node</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">{dbConfig.db}</h4>
                       <div className="mt-4 md:mt-6 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-100/60">Lat: {dbHealth.latency}ms</span>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 text-emerald-950 shadow-sm group">
                    <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-4 md:mb-6 group-hover:animate-pulse" />
                    <div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Authorized Admin</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">{dbConfig.user}</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-gray-300 mt-1 uppercase tracking-tighter">Status: Synchronized</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 text-emerald-950 shadow-sm group">
                    <History className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-4 md:mb-6" />
                    <div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Ledger Uptime</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">14 Days, 8 Hours</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-gray-300 mt-1 uppercase tracking-tighter">Zero-Fail Cycle</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-100 text-emerald-950 group">
                    <Globe className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-4 md:mb-6" />
                    <div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700">Official Gateway</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">www.trazot.com</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-emerald-600/40 mt-1 uppercase tracking-tighter">SSL/TLS 1.3 Active</p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* PUBLISH NEWS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#01110a]/98 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] md:rounded-[48px] max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-4xl p-6 md:p-16 border border-emerald-50 animate-in zoom-in-95 duration-500">
              <button onClick={() => setShowNewsModal(false)} className="absolute top-6 right-6 md:top-8 md:right-8 p-2 md:p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl md:rounded-2xl transition-all">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
                 <div>
                    <h3 className="text-2xl md:text-3xl font-serif-italic text-emerald-950">Draft Briefing</h3>
                    <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Authorized Intelligence Publication</p>
                 </div>
                 <button 
                  onClick={handleAIEnhanceNews}
                  disabled={isOptimizing}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[9px] tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                 >
                   {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                   AI Enhance
                 </button>
              </div>

              <form onSubmit={handleCreateNews} className="space-y-6 md:space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Headline</label>
                    <input 
                      type="text" 
                      required 
                      value={newsForm.title}
                      onChange={e => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-950" 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Category</label>
                       <select 
                         value={newsForm.category}
                         onChange={e => setNewsForm(prev => ({ ...prev, category: e.target.value as any }))}
                         className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none appearance-none cursor-pointer"
                       >
                          <option>Market Trend</option>
                          <option>Trade Zone News</option>
                          <option>Expert Advice</option>
                          <option>Tech Update</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Featured Image URL</label>
                       <input 
                         type="text" 
                         required 
                         value={newsForm.image}
                         onChange={e => setNewsForm(prev => ({ ...prev, image: e.target.value }))}
                         className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-4 md:p-5 font-bold outline-none" 
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Executive Summary (Meta Description)</label>
                    <textarea 
                      required 
                      rows={2}
                      value={newsForm.metaDescription}
                      onChange={e => setNewsForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-4 md:p-5 font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Briefing Content</label>
                    <textarea 
                      required 
                      rows={10}
                      value={newsForm.content}
                      onChange={e => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full bg-gray-50 border-none rounded-[24px] md:rounded-[32px] p-6 md:p-8 font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">SEO Tags (Comma Separated)</label>
                    <div className="relative">
                       <TagIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 md:w-4.5 h-4 md:h-4.5 text-emerald-600" />
                       <input 
                         type="text" 
                         placeholder="Dubai, Real Estate, Riyadh, Trade, 2025"
                         value={newsForm.tags}
                         onChange={e => setNewsForm(prev => ({ ...prev, tags: e.target.value }))}
                         className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl py-4 md:py-4.5 pl-12 md:pl-14 pr-6 font-bold outline-none" 
                       />
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-3xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    Authorize Global Transmission <Send className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
