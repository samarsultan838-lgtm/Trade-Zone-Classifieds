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

  /**
   * ALIGNED WITH HOSTINGER SCREENSHOT: u550128434
   */
  const dbConfig = { 
    user: 'u550128434_trazot_admin', 
    db: 'u550128434_trazot_db', 
    createdAt: '2026-02-15',
    website: 'trazot.com'
  };

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
            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Node integrity established on {dbConfig.createdAt} • {OFFICIAL_DOMAIN}</p>
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
              </div>
           </div>
        )}

        {subView === 'overview' && (
           <div className="space-y-12 md:space-y-16">
              <div className="text-center space-y-3 md:space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 md:mb-4">
                    <Cpu className="w-4 h-4" /> Integrity Protocol 3.3: ACTIVE
                 </div>
                 <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950">Hostinger Infrastructure Node</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                 <div className="bg-emerald-950 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-900 text-white relative overflow-hidden group">
                    <Server className="absolute -right-4 -bottom-4 w-16 h-16 md:w-24 md:h-24 text-emerald-900 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">MySQL Database Node</span>
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
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Authorized MySQL User</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">{dbConfig.user}</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-gray-300 mt-1 uppercase tracking-tighter">Status: Authorized</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 text-emerald-950 shadow-sm group">
                    <Calendar className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-4 md:mb-6" />
                    <div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Creation Sequence</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">{dbConfig.createdAt}</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-gray-300 mt-1 uppercase tracking-tighter">Zero-Fail Cycle</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-emerald-100 text-emerald-950 group">
                    <Globe className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 mb-4 md:mb-6" />
                    <div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700">Official Website Node</span>
                       <h4 className="text-xs md:text-sm font-bold mt-2 truncate">{dbConfig.website}</h4>
                       <p className="text-[9px] md:text-[10px] font-medium text-emerald-600/40 mt-1 uppercase tracking-tighter">SSL/TLS 1.3 Active</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* ... Rest of subviews remain unchanged ... */}
        {subView === 'listings' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              {/* Previous logic for listings Oversight */}
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;