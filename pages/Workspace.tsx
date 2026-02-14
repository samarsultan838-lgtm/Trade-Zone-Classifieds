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
    { id: 'Saved', label: 'Saved' },
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
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">
            {activeTab === 'Saved' ? 'Saved Intelligence' : 'My Asset Ledger'}
          </h2>
          <div className="relative shrink-0">
            <button className="p-2 sm:p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:text-[#17933f] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
              {myListings.length}
            </span>
          </div>
        </div>

        {/* Responsive Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 overflow-x-auto scrollbar-hide border-b border-gray-50 bg-white sticky top-0 z-20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 py-4 sm:py-5 px-3 sm:px-4 text-[11px] sm:text-sm font-bold transition-all relative whitespace-nowrap ${
                  isActive 
                  ? 'text-[#17933f]' 
                  : tab.id === 'Downgraded' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label} <span className="opacity-50 text-[9px] sm:text-[11px]">({count})</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-[#17933f] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8 min-h-[350px]">
          {activeTab === 'Saved' ? (
            <div className="space-y-4">
              {savedSearches.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {savedSearches.map(search => (
                    <div key={search.id} className="bg-gray-50 rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 w-full">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-emerald-950 uppercase tracking-tight text-xs sm:text-sm mb-0.5 truncate">{search.name}</h4>
                            <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-black uppercase text-gray-400 tracking-widest truncate">
                              <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                              <div className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="text-emerald-600 truncate">{search.filters.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                          <button 
                            onClick={() => handleRunSearch(search)}
                            className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-[#17933f] text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95"
                            title="Run Search"
                          >
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSavedSearch(search.id)}
                            className="p-2.5 sm:p-3 bg-white text-gray-300 hover:text-red-500 rounded-xl transition-colors border border-gray-100"
                            title="Delete Saved Search"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-gray-100 mx-auto mb-6" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Saved Intelligence</h3>
                  <p className="text-gray-400 text-sm font-medium mb-10 max-w-xs mx-auto">Track specific assets by saving search filters on the inventory page.</p>
                  <Link 
                    to="/search" 
                    className="inline-flex items-center gap-3 bg-[#17933f] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/20"
                  >
                    Go to Inventory
                  </Link>
                </div>
              )}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="w-full space-y-3 sm:space-y-4">
              {filteredListings.map(l => (
                <div key={l.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-emerald-100">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <img src={l.images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{l.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] sm:text-xs text-emerald-600 font-black uppercase tracking-widest">{l.currency} {l.price.toLocaleString()}</p>
                        {l.featured && <span className="text-[7px] sm:text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">Hot</span>}
                      </div>
                    </div>
                  </div>
                  <Link to={`/listing/${l.id}`} className="p-1.5 sm:p-2 text-gray-400 hover:text-[#17933f] shrink-0">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                 <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No {activeTab} Records</h3>
              <p className="text-gray-400 text-sm font-medium mb-10 max-w-xs mx-auto">Your {activeTab.toLowerCase()} listing transmissions will appear here.</p>
              
              <Link 
                to="/post-ad" 
                className="inline-flex items-center gap-3 bg-[#17933f] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Transmit Asset
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Credit Status Card */}
      <div className="mt-8 bg-[#002b1b] text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] sm:text-sm font-bold opacity-80 uppercase tracking-widest">Available Trade Credits</span>
              <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-emerald-400">
                Network Protocol Active
              </div>
            </div>
            <div className="text-5xl sm:text-6xl font-black text-[#ffda00] mb-4">{user.credits}</div>
            <p className="text-[10px] sm:text-xs font-medium text-emerald-100/60 leading-relaxed max-w-sm">
              1 Credit per Standard Transmission. 2 Credits per Featured Upgrade. 
              <span className="block mt-1 font-bold text-emerald-400 uppercase tracking-tighter">Verified Global Rate: 1 Ad = 1 USDT.</span>
            </p>
          </div>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full sm:w-auto px-10 bg-white text-[#002b1b] py-4 rounded-2xl font-black text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-xl active:scale-95"
          >
            Settle Balance
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="text-center">
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-100 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Verified Merchant: BigBossTrader</span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Settlement Gateway</p>
              </div>

              {/* Payment Method Selector */}
              <div className="flex gap-2 sm:gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`flex-1 p-3 sm:p-4 rounded-2xl border transition-all ${paymentMethod === 'easypaisa' ? 'bg-[#eaf7ed] border-[#17933f] shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                >
                  <Smartphone className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${paymentMethod === 'easypaisa' ? 'text-[#17933f]' : 'text-gray-400'}`} />
                  <span className={`block text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${paymentMethod === 'easypaisa' ? 'text-[#17933f]' : 'text-gray-400'}`}>Pakistan Hub</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('usdt')}
                  className={`flex-1 p-3 sm:p-4 rounded-2xl border transition-all ${paymentMethod === 'usdt' ? 'bg-emerald-950 border-emerald-900 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                >
                  <Globe className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${paymentMethod === 'usdt' ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className={`block text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${paymentMethod === 'usdt' ? 'text-white' : 'text-gray-400'}`}>USDT / Global</span>
                </button>
              </div>

              {paymentMethod === 'easypaisa' ? (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-xl sm:text-2xl font-serif-italic text-emerald-950 mb-1">Local Settlement</h2>
                  <p className="text-gray-500 text-[11px] sm:text-xs mb-8 font-medium italic">Authorized Account: +92 300 1887808</p>
                  
                  <div className="bg-gray-50 rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 border border-gray-100 mb-8">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#17933f] mb-3">EasyPaisa Identifier</span>
                      <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-6 py-4 rounded-2xl border border-gray-100 shadow-sm w-full justify-between">
                        <span className="text-lg sm:text-xl font-black text-emerald-950 tracking-widest">+92 300 1887808</span>
                        <button 
                          onClick={() => handleCopy('+92 300 1887808')}
                          className={`p-2 rounded-xl transition-all ${copied ? 'bg-[#17933f] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#17933f]'}`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-xl sm:text-2xl font-serif-italic text-emerald-950 mb-1">International Node</h2>
                  <p className="text-gray-500 text-[11px] sm:text-xs mb-6 font-medium">BigBossTrader requires a minimum 10 USDT settlement.</p>
                  
                  <a 
                    href="https://s.binance.com/qMAvBjok" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 bg-emerald-600 rounded-[28px] sm:rounded-[32px] border border-emerald-50 text-white mb-6 group hover:bg-emerald-500 transition-all shadow-xl"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] mb-1">Binance Pay (Instant)</span>
                    <span className="text-[8px] sm:text-[9px] font-bold opacity-60">Verified Merchant Protocol</span>
                  </a>

                  <div className="bg-emerald-950 rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 border border-emerald-900 mb-4 text-white">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">TRC20 Wallet Address</span>
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-4 rounded-2xl border border-white/10 shadow-sm w-full justify-between overflow-hidden">
                        <span className="text-[9px] font-mono font-bold text-emerald-100 truncate pr-2">TXuY1p3q5RzW8Xv9M2K4L7N6P0B1V3M5A7</span>
                        <button 
                          onClick={() => handleCopy('TXuY1p3q5RzW8Xv9M2K4L7N6P0B1V3M5A7')}
                          className={`shrink-0 p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400 hover:bg-white/20'}`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[8px] sm:text-[9px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                  Credits are automatically provisioned following network confirmation. Maintain transaction screenshots for secondary verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;