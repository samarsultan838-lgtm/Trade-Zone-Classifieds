import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  LogOut,
  Eye,
  Trash,
  Layers,
  Filter,
  Search,
  Download,
  Save
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { processImage } from '../services/imageService';
import { optimizeNewsArticle } from '../services/geminiService';
import { Listing, AdStatus, NewsArticle } from '../types';
import { Link } from 'react-router-dom';

// Constants
const MASTER_EMERGENCY_KEY = import.meta.env.TRAZOT-MASTER-2025-RECOVERY-NODE || 'Logic@123';
const OFFICIAL_DOMAIN = 'https://trazot.com';

type AdminViewState = 'login' | 'setup' | 'forgot' | 'dashboard';

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, isProcessing }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl font-bold text-emerald-950 mb-3">{title}</h3>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </button>
          <button 
            onClick={onCancel} 
            disabled={isProcessing}
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-black text-emerald-950">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const AdminPanel: React.FC = () => {
  // State Management
  const [view, setView] = useState<AdminViewState>('login');
  const [password, setPassword] = useState('');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [setupKey, setSetupKey] = useState('');
  
  const [activeTab, setActiveTab] = useState<'listings' | 'news'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal States
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'listing' | 'news'; id: string } | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Form States
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Market Trend' as NewsArticle['category'],
    image: '',
    content: ''
  });

  // Image optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    activeListings: 0,
    rejectedListings: 0,
    totalNews: 0,
    lastSync: null as string | null
  });

  // Initialize
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const creds = await storageService.getAdminAuth();
        if (!creds) {
          setView('setup');
        }
        
        // Check session
        if (sessionStorage.getItem('tz_admin_session')) {
          await initializeDashboard();
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize admin panel');
      }
    };

    initializeAdmin();

    // Setup storage event listener for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tz_listings_sync' || e.key === 'tz_news_sync') {
        console.log(`Data changed in another tab: ${e.key}`);
        if (e.key === 'tz_listings_sync') {
          loadListings();
        } else {
          loadNews();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Apply filters when listings or filter criteria change
  useEffect(() => {
    applyFilters();
    updateStats();
  }, [listings, searchTerm, statusFilter, categoryFilter]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadListings(),
        loadNews()
      ]);
      setView('dashboard');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const data = await storageService.getListings();
      setListings(data);
      setFilteredListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
      throw err;
    }
  };

  const loadNews = async () => {
    try {
      const data = await storageService.getNews();
      setNews(data);
    } catch (err) {
      console.error('Error loading news:', err);
      throw err;
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(l => l.category === categoryFilter);
    }

    setFilteredListings(filtered);
  };

  const updateStats = () => {
    setStats({
      totalListings: listings.length,
      pendingListings: listings.filter(l => l.status === AdStatus.PENDING).length,
      activeListings: listings.filter(l => l.status === AdStatus.ACTIVE).length,
      rejectedListings: listings.filter(l => l.status === AdStatus.REJECTED).length,
      totalNews: news.length,
      lastSync: new Date().toLocaleTimeString()
    });
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      const generatedKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      await storageService.setAdminAuth(password, generatedKey);
      setSetupKey(generatedKey);
      setSuccessMessage('Admin account created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const creds = await storageService.getAdminAuth();
      if (creds && creds.password === password) {
        sessionStorage.setItem('tz_admin_session', 'true');
        sessionStorage.setItem('tz_admin_login_time', Date.now().toString());
        await initializeDashboard();
        setSuccessMessage('Welcome back, Admin!');
      } else {
        throw new Error('Invalid credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (newPassInput.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }
      
      const success = await storageService.resetAdminPassword(recoveryInput, newPassInput);
      if (success) {
        setSuccessMessage('Password reset successful. Please login.');
        setView('login');
        setPassword('');
        setRecoveryInput('');
        setNewPassInput('');
      } else {
        throw new Error('Invalid Recovery Key.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tz_admin_session');
    sessionStorage.removeItem('tz_admin_login_time');
    setView('login');
    setPassword('');
    setSuccessMessage('Logged out successfully');
  };

  const handleApprove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) throw new Error('Listing not found');
      
      const updatedListing = { ...listing, status: AdStatus.ACTIVE };
      const success = await storageService.saveListing(updatedListing);
      
      if (success) {
        await loadListings();
        setSuccessMessage('Listing approved successfully');
      } else {
        throw new Error('Failed to approve listing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const listing = listings.find(l => l.id === id);
      if (!listing) throw new Error('Listing not found');
      
      const updatedListing = { ...listing, status: AdStatus.REJECTED };
      const success = await storageService.saveListing(updatedListing);
      
      if (success) {
        await loadListings();
        setSuccessMessage('Listing rejected');
      } else {
        throw new Error('Failed to reject listing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting listing');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (type: 'listing' | 'news', id: string) => {
    setItemToDelete({ type, id });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let success = false;
      
      if (itemToDelete.type === 'listing') {
        success = await storageService.deleteListing(itemToDelete.id);
        if (success) {
          await loadListings();
          setSuccessMessage('Listing deleted permanently');
        }
      } else {
        success = await storageService.deleteNews(itemToDelete.id);
        if (success) {
          await loadNews();
          setSuccessMessage('Article deleted');
        }
      }
      
      if (!success) {
        throw new Error(`Failed to delete ${itemToDelete.type}`);
      }
      
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageOptimize = async () => {
    if (!newsForm.image) return;
    
    setIsOptimizing(true);
    try {
      const optimizedUrl = await processImage(newsForm.image, {
        maxWidth: 1200,
        quality: 85,
        format: 'webp'
      });
      setNewsForm(p => ({ ...p, image: optimizedUrl }));
      setSuccessMessage('Image optimized successfully');
    } catch (err) {
      setError('Failed to optimize image');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (newsForm.title.length < 5) {
        throw new Error('Title must be at least 5 characters');
      }
      if (newsForm.content.length < 50) {
        throw new Error('Content must be at least 50 characters');
      }
      if (!isValidUrl(newsForm.image)) {
        throw new Error('Please enter a valid image URL');
      }
      
      // Optimize content with Gemini
      const optimizedContent = await optimizeNewsArticle(newsForm.content);
      
      const newArticle: NewsArticle = {
        id: Math.random().toString(36).substring(7),
        ...newsForm,
        content: optimizedContent,
        author: 'Admin',
        publishedAt: new Date().toISOString()
      };
      
      const success = await storageService.saveNews(newArticle);
      if (success) {
        await loadNews();
        setShowNewsModal(false);
        setNewsForm({ title: '', category: 'Market Trend', image: '', content: '' });
        setSuccessMessage('News article published successfully');
      } else {
        throw new Error('Failed to create news article');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating news article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadListings(),
        loadNews()
      ]);
      setSuccessMessage('Data refreshed successfully');
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear all cached data? This will force a fresh load from the server.')) {
      setIsLoading(true);
      try {
        localStorage.removeItem('tz_listings_fallback');
        localStorage.removeItem('tz_news_fallback');
        await handleRefresh();
        setSuccessMessage('Cache cleared successfully');
      } catch (err) {
        setError('Failed to clear cache');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const exportData = () => {
    try {
      const data = {
        listings: filteredListings,
        news: news,
        exportDate: new Date().toISOString(),
        stats: stats,
        domain: OFFICIAL_DOMAIN
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trazot-admin-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Data exported successfully');
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getUniqueCategories = () => {
    const categories = listings.map(l => l.category).filter(Boolean);
    return ['ALL', ...new Set(categories)];
  };

  // Loading State
  if (isLoading && view === 'dashboard' && listings.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-6" />
          <p className="text-emerald-950 font-bold text-lg">Loading Command Center...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching latest data from server</p>
        </div>
      </div>
    );
  }

  // Setup View
  if (view === 'setup') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif-italic text-emerald-950 mb-2">First Time Setup</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm">
              {successMessage}
            </div>
          )}
          
          {setupKey ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Master Recovery Key</p>
                <div className="text-3xl font-black text-emerald-950 tracking-[0.2em] font-mono">{setupKey}</div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed bg-yellow-50 p-4 rounded-xl">
                <strong className="text-yellow-700">⚠️ Save this key immediately!</strong> It is the <strong>only way</strong> to reset your password if forgotten.
              </p>
              <button 
                onClick={() => setView('login')} 
                className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
              >
                I've Saved It, Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">Establish the primary administrative password for Trazot.</p>
              <input 
                type="password" 
                required
                placeholder="New Admin Password (min. 6 characters)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-center transition-all"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account & Key'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (view === 'forgot') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95">
          <button 
            onClick={() => setView('login')} 
            className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-1 hover:text-emerald-600 transition-colors"
          >
            ← Back to Login
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl mx-auto flex items-center justify-center text-yellow-950 mb-4 shadow-xl shadow-yellow-400/20">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif-italic text-emerald-950">Reset Credentials</h1>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Master Recovery Key</label>
              <input 
                required
                type="text" 
                value={recoveryInput}
                onChange={e => setRecoveryInput(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500 text-center font-black tracking-widest transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password (min. 6 characters)</label>
              <input 
                required
                type="password" 
                value={newPassInput}
                onChange={e => setNewPassInput(e.target.value)}
                minLength={6}
                className="w-full bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-yellow-500 text-center transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Authorize Reset'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login View
  if (view === 'login') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 px-4">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-950 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-950/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif-italic text-emerald-950 mb-2">Vault Entry</h1>
          <p className="text-gray-500 text-sm mb-8">Administrative verification required.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-center transition-all"
              autoFocus
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                'Unlock Portal'
              )}
            </button>
            <button 
              type="button" 
              onClick={() => setView('forgot')} 
              className="text-[10px] text-gray-400 uppercase tracking-widest font-black hover:text-emerald-600 transition-colors pt-4"
            >
              Forgot Credentials?
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif-italic text-emerald-950 mb-3">Command Center</h1>
          <div className="flex flex-wrap items-center gap-4 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> 
              Admin Active
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" /> 
              Last Sync: {stats.lastSync}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {OFFICIAL_DOMAIN}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-100 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleClearCache}
            className="flex items-center gap-2 bg-white text-gray-600 border border-gray-100 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cache
          </button>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-100 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button 
            onClick={() => setShowNewsModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Newspaper className="w-3.5 h-3.5" /> 
            Write Article
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-red-600 border border-red-100 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> 
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatsCard 
          title="Total Listings" 
          value={stats.totalListings} 
          icon={<Layers className="w-5 h-5" />}
          color="bg-emerald-600"
        />
        <StatsCard 
          title="Pending" 
          value={stats.pendingListings} 
          icon={<Clock className="w-5 h-5" />}
          color="bg-yellow-500"
        />
        <StatsCard 
          title="Active" 
          value={stats.activeListings} 
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-green-500"
        />
        <StatsCard 
          title="Rejected" 
          value={stats.rejectedListings} 
          icon={<XCircle className="w-5 h-5" />}
          color="bg-red-500"
        />
        <StatsCard 
          title="News" 
          value={stats.totalNews} 
          icon={<Newspaper className="w-5 h-5" />}
          color="bg-blue-600"
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3 border border-emerald-100">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-3 mb-8 border-b border-gray-100 pb-4">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'listings' 
              ? 'bg-emerald-950 text-white shadow-lg' 
              : 'bg-white text-gray-400 hover:text-emerald-600'
          }`}
        >
          Listing Oversight ({stats.pendingListings} pending)
        </button>
        <button 
          onClick={() => setActiveTab('news')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'news' 
              ? 'bg-emerald-950 text-white shadow-lg' 
              : 'bg-white text-gray-400 hover:text-emerald-600'
          }`}
        >
          News Management ({stats.totalNews})
        </button>
      </div>

      {/* Filters - Only show for listings tab */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdStatus | 'ALL')}
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value={AdStatus.PENDING}>Pending</option>
              <option value={AdStatus.ACTIVE}>Active</option>
              <option value={AdStatus.REJECTED}>Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {getUniqueCategories().map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-xs text-gray-500">
            Showing {filteredListings.length} of {listings.length} listings
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'listings' ? (
        <div className="space-y-8">
          {/* Pending Reviews Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500" /> 
              Pending Approval ({filteredListings.filter(l => l.status === AdStatus.PENDING).length})
            </h2>
            
            <div className="space-y-4">
              {filteredListings.filter(l => l.status === AdStatus.PENDING).map(l => (
                <div key={l.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gray-50 rounded-2xl gap-4 hover:bg-gray-100 transition-all group">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img 
                      src={l.images[0] || 'https://via.placeholder.com/80'} 
                      alt={l.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-emerald-950 mb-1">{l.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{l.category}</span>
                        <span>•</span>
                        <span>{l.location.city}</span>
                        <span>•</span>
                        <span>{l.currency} {l.price.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400">
                        Seller: {l.sellerName} • Views: {l.views}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link 
                      to={`/listing/${l.id}`} 
                      target="_blank"
                      className="p-3 bg-white text-gray-400 rounded-xl hover:text-emerald-600 shadow-sm hover:shadow-md transition-all"
                      title="View Listing"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleApprove(l.id)} 
                      disabled={isLoading}
                      className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleReject(l.id)} 
                      disabled={isLoading}
                      className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-600 hover:text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => confirmDelete('listing', l.id)} 
                      disabled={isLoading}
                      className="p-3 bg-gray-200 text-gray-500 rounded-xl hover:bg-red-600 hover:text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                      title="Delete Permanently"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredListings.filter(l => l.status === AdStatus.PENDING).length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <ShieldCheck className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                    No listings awaiting review
                  </p>
                  <p className="text-gray-300 text-xs mt-2">
                    All caught up! New submissions will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All Listings Oversight Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-600" /> 
              Full Inventory ({filteredListings.length} of {listings.length} listings)
            </h2>
            
            {filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                  No listings match your filters
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="mt-4 text-emerald-600 text-xs font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img 
                        src={l.images[0] || 'https://via.placeholder.com/48'} 
                        alt={l.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-bold text-emerald-950 truncate">{l.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            l.status === AdStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                            l.status === AdStatus.REJECTED ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {l.status}
                          </span>
                          <span className="text-[8px] text-gray-400">
                            v{(l as any)._version || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Link 
                        to={`/listing/${l.id}`} 
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        onClick={() => confirmDelete('listing', l.id)} 
                        className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // News Tab
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {news.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                No news articles yet
              </p>
              <button 
                onClick={() => setShowNewsModal(true)}
                className="mt-4 text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1 mx-auto"
              >
                <Plus className="w-3 h-3" />
                Create your first article
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Article</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Published</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Author</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {news.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={article.image || 'https://via.placeholder.com/48'} 
                            alt={article.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                            }}
                          />
                          <div>
                            <div className="font-bold text-sm text-emerald-950 line-clamp-1">{article.title}</div>
                            <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{article.content.substring(0, 60)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {article.author}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => confirmDelete('news', article.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* News Creation Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] p-6 md:p-10 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif-italic text-emerald-950">Publish Insight</h2>
              <button 
                onClick={() => setShowNewsModal(false)} 
                className="p-3 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNews} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Article Title <span className="text-red-400">*</span>
                </label>
                <input 
                  required 
                  value={newsForm.title} 
                  onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} 
                  placeholder="e.g., Market Trends 2024: What to Expect"
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
                  maxLength={100}
                />
                <div className="text-right text-[10px] text-gray-400">
                  {newsForm.title.length}/100
                </div>
              </div>

              {/* Category and Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={newsForm.category} 
                    onChange={e => setNewsForm(p => ({ ...p, category: e.target.value as any }))} 
                    className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
                  >
                    <option>Market Trend</option>
                    <option>Trade Zone News</option>
                    <option>Expert Advice</option>
                    <option>Tech Update</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Banner Image URL <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      value={newsForm.image} 
                      onChange={e => setNewsForm(p => ({ ...p, image: e.target.value }))} 
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 bg-gray-50 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleImageOptimize}
                      disabled={isOptimizing || !newsForm.image}
                      className="px-4 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                      title="Optimize Image"
                    >
                      {isOptimizing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                  </div>
                  {newsForm.image && (
                    <div className="mt-2 relative h-20 rounded-xl overflow-hidden">
                      <img 
                        src={newsForm.image} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '0.5';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Content Body <span className="text-red-400">*</span>
                </label>
                <textarea 
                  required 
                  rows={8} 
                  value={newsForm.content} 
                  onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} 
                  placeholder="Write your article content here..."
                  className="w-full bg-gray-50 p-6 rounded-3xl font-medium outline-none border-2 border-transparent focus:border-emerald-500 leading-relaxed resize-none"
                  minLength={50}
                  maxLength={5000}
                />
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-400">Minimum 50 characters</span>
                  <span className="text-gray-400">{newsForm.content.length}/5000</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading || newsForm.content.length < 50}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Publish to Hub
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title={itemToDelete?.type === 'listing' ? 'Delete Listing' : 'Delete Article'}
        message={`Are you sure you want to delete this ${itemToDelete?.type} permanently? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        isProcessing={isLoading}
      />
    </div>
  );
};

export default AdminPanel;
