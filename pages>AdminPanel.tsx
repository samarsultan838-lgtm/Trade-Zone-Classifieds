
import React, { useState, useEffect } from 'react';
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
  Key,
  RefreshCw,
  AlertTriangle,
  LogOut,
  Eye,
  Trash,
  // Fix: Added missing Layers icon import
  Layers
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Listing, AdStatus, NewsArticle } from '../types';
import { Link } from 'react-router-dom';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';

const AdminPanel: React.FC = () => {
  const [view, setView] = useState<AdminViewState>('login');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [setupKey, setSetupKey] = useState('');
  
  const [activeTab, setActiveTab] = useState<'listings' | 'news'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Trend' as NewsArticle['category'],
    image: '',
    content: ''
  });

  useEffect(() => {
    const creds = storageService.getAdminAuth();
    if (!creds) {
      setView('setup');
    }
    
    // Check session
    if (sessionStorage.getItem('tz_admin_session')) {
      initializeDashboard();
    }
  }, []);

  const initializeDashboard = () => {
    setListings(storageService.getListings());
    setNews(storageService.getNews());
    setView('dashboard');
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return alert('Password must be at least 6 characters.');
    const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    storageService.setAdminAuth(password, generatedKey);
    setSetupKey(generatedKey);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = storageService.getAdminAuth();
    if (creds && creds.password === password) {
      sessionStorage.setItem('tz_admin_session', 'true');
      initializeDashboard();
    } else {
      alert('Invalid credentials.');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const success = storageService.resetAdminPassword(recoveryInput, newPassInput);
    if (success) {
      alert('Password reset successful. Please login.');
      setView('login');
      setPassword('');
      setRecoveryInput('');
      setNewPassInput('');
    } else {
      alert('Invalid Recovery Key.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    setView('login');
    setPassword('');
  };

  const handleApprove = (id: string) => {
    const updated = listings.map(l => l.id === id ? { ...l, status: AdStatus.ACTIVE } : l);
    setListings(updated);
    const listingToUpdate = updated.find(l => l.id === id);
    if (listingToUpdate) storageService.saveListing(listingToUpdate);
  };

  const handleReject = (id: string) => {
    const updated = listings.map(l => l.id === id ? { ...l, status: AdStatus.REJECTED } : l);
    setListings(updated);
    const listingToUpdate = updated.find(l => l.id === id);
    if (listingToUpdate) storageService.saveListing(listingToUpdate);
  };

  const handleDeleteListing = (id: string) => {
    if (confirm('Permanently delete this listing from Trazot?')) {
      storageService.deleteListing(id);
      setListings(storageService.getListings());
    }
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: NewsArticle = {
      id: Math.random().toString(36).substring(7),
      ...newsForm,
      author: 'Admin',
      publishedAt: new Date().toISOString()
    };
    storageService.saveNews(newArticle);
    setNews(storageService.getNews());
    setShowNewsModal(false);
    setNewsForm({ title: '', category: 'Market Trend', image: '', content: '' });
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Delete article?')) {
      storageService.deleteNews(id);
      setNews(storageService.getNews());
    }
  };

  // --- RENDERING ---

  if (view === 'setup') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif-italic text-emerald-950 mb-2">First Time Setup</h1>
          {setupKey ? (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Master Recovery Key</p>
                <div className="text-2xl font-black text-emerald-950 tracking-[0.2em]">{setupKey}</div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Save this key immediately! It is the <strong>only way</strong> to reset your password if forgotten.
              </p>
              <button onClick={() => setView('login')} className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold">
                I've Saved It, Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">Establish the primary administrative password for Trazot.</p>
              <input 
                type="password" 
                required
                placeholder="New Admin Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-center"
              />
              <button className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all">
                Create Account & Key
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (view === 'forgot') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full">
          <button onClick={() => setView('login')} className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-1 hover:text-emerald-600 transition-colors">
            Back to Login
          </button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center text-yellow-950 mb-4 shadow-xl shadow-yellow-400/20">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif-italic text-emerald-950">Reset Credentials</h1>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Recovery Key</label>
              <input 
                required
                type="text" 
                value={recoveryInput}
                onChange={e => setRecoveryInput(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500 text-center font-black tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password</label>
              <input 
                required
                type="password" 
                value={newPassInput}
                onChange={e => setNewPassInput(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500 text-center"
              />
            </div>
            <button className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all mt-4">
              Authorize Reset
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-950 rounded-2xl mx-auto flex items-center justify-center text-white mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif-italic text-emerald-950 mb-2">Vault Entry</h1>
          <p className="text-gray-500 text-sm mb-8">Administrative verification required.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-gray-100 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-center"
            />
            <button className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all">
              Unlock Portal
            </button>
            <button type="button" onClick={() => setView('forgot')} className="text-[10px] text-gray-400 uppercase tracking-widest font-black hover:text-emerald-600 transition-colors pt-4">
              Forgot Credentials?
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif-italic text-emerald-950 mb-2">Command Center</h1>
          <div className="flex items-center gap-6 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Global Admin Status</div>
             <div className="flex items-center gap-1.5 text-gray-400"><Clock className="w-3.5 h-3.5" /> Session active</div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowNewsModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Newspaper className="w-4 h-4" /> Write Article
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-red-600 border border-red-100 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'listings' ? 'bg-emerald-950 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}
        >
          Listing Oversight
        </button>
        <button 
          onClick={() => setActiveTab('news')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'news' ? 'bg-emerald-950 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}
        >
          News Management
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="space-y-12">
          {/* Pending Reviews Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500" /> 
              Pending Approval ({listings.filter(l => l.status === AdStatus.PENDING).length})
            </h2>
            <div className="space-y-4">
              {listings.filter(l => l.status === AdStatus.PENDING).map(l => (
                <div key={l.id} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50 rounded-3xl gap-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={l.images[0]} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950">{l.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{l.category} • {l.location.city}</p>
                      <div className="text-emerald-600 font-black text-xs mt-1">{l.currency} {l.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link to={`/listing/${l.id}`} className="p-3 bg-white text-gray-400 rounded-2xl hover:text-emerald-600 shadow-sm transition-all"><Eye className="w-5 h-5" /></Link>
                    <button onClick={() => handleApprove(l.id)} className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-600 hover:text-white shadow-sm transition-all"><CheckCircle className="w-5 h-5" /></button>
                    <button onClick={() => handleReject(l.id)} className="p-3 bg-red-100 text-red-700 rounded-2xl hover:bg-red-600 hover:text-white shadow-sm transition-all"><XCircle className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {listings.filter(l => l.status === AdStatus.PENDING).length === 0 && (
                <div className="text-center py-10">
                   <ShieldCheck className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No listings awaiting review.</p>
                </div>
              )}
            </div>
          </div>

          {/* All Listings Oversight Section */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" /> 
              Full Inventory Oversight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {listings.map(l => (
                 <div key={l.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <img src={l.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                       <div>
                          <h5 className="text-xs font-bold text-emerald-950 line-clamp-1">{l.title}</h5>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${
                            l.status === AdStatus.ACTIVE ? 'text-emerald-600' :
                            l.status === AdStatus.REJECTED ? 'text-red-500' :
                            'text-yellow-600'
                          }`}>
                            {l.status}
                          </span>
                       </div>
                    </div>
                    <button onClick={() => handleDeleteListing(l.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors">
                       <Trash className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Headline</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.map(article => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={article.image} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="font-bold text-sm text-emerald-950">{article.title}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">{article.category}</span>
                  </td>
                  <td className="px-8 py-5 text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleDeleteNews(article.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif-italic text-emerald-950">Publish Insight</h2>
              <button onClick={() => setShowNewsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateNews} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Article Title</label>
                <input required value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                  <select value={newsForm.category} onChange={e => setNewsForm(p => ({ ...p, category: e.target.value as any }))} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-emerald-500">
                    <option>Market Trend</option><option>Trade Zone News</option><option>Expert Advice</option><option>Tech Update</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Banner Image URL</label>
                  <input required value={newsForm.image} onChange={e => setNewsForm(p => ({ ...p, image: e.target.value }))} className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Content Body</label>
                <textarea required rows={8} value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} className="w-full bg-gray-50 p-6 rounded-3xl font-medium outline-none border border-transparent focus:border-emerald-500 leading-relaxed" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
                <Plus className="w-4 h-4" /> Publish to Hub
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
