import React, { useState, useMemo } from 'react';
import { 
  Plus,
  Search,
  MessageCircle,
  Filter,
  ArrowRight,
  ChevronRight,
  BarChart3,
  CreditCard,
  Settings,
  X,
  Smartphone,
  Check,
  Copy,
  ShieldCheck,
  PlusSquare,
  Globe,
  Coins,
  Bookmark,
  Trash2,
  ExternalLink,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService.ts';
import { AdStatus, Listing, SavedSearch } from '../types.ts';

const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const user = storageService.getCurrentUser();
  const allListings = storageService.getListings();
  const myListings = useMemo(() => allListings.filter(l => l.userId === user.id), [allListings, user.id]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(storageService.getSavedSearches());
  
  const [activeTab, setActiveTab] = useState<AdStatus | 'Rejected' | 'Expired' | 'Deleted' | 'Downgraded' | 'Inactive' | 'Saved'>(AdStatus.ACTIVE);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'usdt'>('easypaisa');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: AdStatus.ACTIVE, label: 'Active' },
    { id: AdStatus.PENDING, label: 'Pending' },
    { id: 'Saved', label: 'Saved Searches' },
    { id: 'Rejected', label: 'Rejected' },
    { id: 'Expired', label: 'Expired' },
    { id: 'Deleted', label: 'Deleted' },
    { id: 'Downgraded', label: 'Downgraded' },
    { id: 'Inactive', label: 'Inactive' },
  ];

  const getCount = (status: string) => {
    if (status === 'Saved') return savedSearches.length;
    return myListings.filter(l => {
      if (status === 'Rejected') return l.status === AdStatus.REJECTED;
      return l.status === status;
    }).length;
  };

  const filteredListings = useMemo(() => {
    if (activeTab === 'Saved') return [];
    return myListings.filter(l => {
      if (activeTab === 'Rejected') return l.status === AdStatus.REJECTED;
      return l.status === activeTab;
    });
  }, [myListings, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteSavedSearch = (id: string) => {
    storageService.deleteSavedSearch(id);
    setSavedSearches(storageService.getSavedSearches());
  };

  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.filters.category !== 'All') params.set('category', search.filters.category);
    if (search.filters.country !== 'All') params.set('country', search.filters.country);
    if (search.filters.searchQuery) params.set('q', search.filters.searchQuery);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-6 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === 'Saved' ? 'Saved Intelligence' : 'All Listings'}
          </h2>
          <div className="relative">
            <button className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:text-[#17933f] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
              1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 overflow-x-auto scrollbar-hide border-b border-gray-50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 py-5 px-4 text-sm font-bold transition-all relative ${
                  isActive 
                  ? 'text-[#17933f]' 
                  : tab.id === 'Downgraded' ? 'text-green-500' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label} ({count})
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#17933f] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8 min-h-[400px]">
          {activeTab === 'Saved' ? (
            <div className="space-y-6">
              {savedSearches.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {savedSearches.map(search => (
                    <div key={search.id} className="bg-gray-50 rounded-[28px] p-6 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Bookmark className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-emerald-950 uppercase tracking-tight mb-1">{search.name}</h4>
                            <div className="flex items-center gap-3 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                              <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                              <div className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="text-emerald-600">{search.filters.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleRunSearch(search)}
                            className="p-3 bg-[#17933f] text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95"
                            title="Run Search"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSavedSearch(search.id)}
                            className="p-3 bg-white text-gray-300 hover:text-red-500 rounded-xl transition-colors border border-gray-100"
                            title="Delete Saved Search"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Bookmark className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Intelligence</h3>
                  <p className="text-gray-400 font-medium mb-10">Save search filters on the inventory page to track specific assets.</p>
                  <Link 
                    to="/search" 
                    className="inline-flex items-center gap-3 bg-[#17933f] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-emerald-600/20"
                  >
                    Go to Search
                  </Link>
                </div>
              )}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="w-full space-y-4">
              {filteredListings.map(l => (
                <div key={l.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-emerald-100">
                  <div className="flex items-center gap-4">
                    <img src={l.images[0]} className="w-14 h-14 rounded-xl object-cover" alt="" />
                    <div>
                      <h4 className="font-bold text-gray-900">{l.title}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{l.currency} {l.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <Link to={`/listing/${l.id}`} className="p-2 text-gray-400 hover:text-[#17933f]">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95 duration-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No {activeTab} Listings</h3>
              <p className="text-gray-400 font-medium mb-10">Your {activeTab.toLowerCase()} listings will appear here</p>
              
              <Link 
                to="/post-ad" 
                className="inline-flex items-center gap-3 bg-[#17933f] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-6 h-6 flex items-center justify-center border-2 border-white/30 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                Post Listing
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-[#002b1b] text-white rounded-[32px] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold opacity-80">Available Ad Credits</span>
              <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[8px] font-black uppercase tracking-widest text-emerald-400">
                GCC Protocol Active
              </div>
            </div>
            <div className="text-5xl font-black text-[#ffda00] mb-4">{user.credits}</div>
            <p className="text-xs font-medium text-emerald-100/60 leading-relaxed max-w-[320px]">
              1 Credit per Standard Ad. 2 Credits per Featured Ad. 
              <span className="block mt-1 font-bold text-emerald-400">GCC & Global Rate: 1 Ad = 1 USDT.</span>
            </p>
          </div>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full md:w-auto px-12 bg-white text-[#002b1b] py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-xl"
          >
            Buy Credits
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="text-center">
              <div className="flex flex-col items-center mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Verified Merchant: BigBossTrader</span>
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Global & Local Settlement Partner</p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`flex-1 p-4 rounded-2xl border transition-all ${paymentMethod === 'easypaisa' ? 'bg-[#eaf7ed] border-[#17933f] shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                >
                  <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'easypaisa' ? 'text-[#17933f]' : 'text-gray-400'}`} />
                  <span className={`block text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'easypaisa' ? 'text-[#17933f]' : 'text-gray-400'}`}>Pakistan (EasyPaisa)</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('usdt')}
                  className={`flex-1 p-4 rounded-2xl border transition-all ${paymentMethod === 'usdt' ? 'bg-emerald-950 border-emerald-900 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                >
                  <Globe className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'usdt' ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className={`block text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'usdt' ? 'text-white' : 'text-gray-400'}`}>International (USDT)</span>
                </button>
              </div>

              {paymentMethod === 'easypaisa' ? (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-2xl font-serif-italic text-emerald-950 mb-2">Local Billing Node</h2>
                  <p className="text-gray-500 text-sm mb-8 font-medium italic">Verified EasyPaisa Account: +92 300 1887808</p>
                  
                  <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 mb-8">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#17933f] mb-3">EasyPaisa Account</span>
                      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm w-full justify-between">
                        <span className="text-xl font-black text-emerald-950 tracking-widest">+92 300 1887808</span>
                        <button 
                          onClick={() => handleCopy('+92 300 1887808')}
                          className={`p-2.5 rounded-xl transition-all ${copied ? 'bg-[#17933f] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#17933f]'}`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-2xl font-serif-italic text-emerald-950 mb-2">International Billing Node</h2>
                  <p className="text-gray-500 text-sm mb-6 font-medium">BigBossTrader has requested a 10 USDT payment for priority credits.</p>
                  
                  <a 
                    href="https://s.binance.com/qMAvBjok" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-8 bg-emerald-600 rounded-[32px] border border-emerald-50 text-white mb-8 group hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.2em] mb-1">Pay via Binance (Instant)</span>
                    <span className="text-[10px] font-bold opacity-60">Binance Pay Gateway Protocol</span>
                  </a>

                  <div className="bg-emerald-950 rounded-[32px] p-6 border border-emerald-900 mb-8 text-white">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">Manual USDT TRC20 Gateway</span>
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-4 rounded-2xl border border-white/10 shadow-sm w-full justify-between overflow-hidden">
                        <span className="text-[10px] font-mono font-bold text-emerald-100 truncate pr-2">TXuY1p3q5RzW8Xv9M2K4L7N6P0B1V3M5A7</span>
                        <button 
                          onClick={() => handleCopy('TXuY1p3q5RzW8Xv9M2K4L7N6P0B1V3M5A7')}
                          className={`shrink-0 p-2.5 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400 hover:bg-white/20'}`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;