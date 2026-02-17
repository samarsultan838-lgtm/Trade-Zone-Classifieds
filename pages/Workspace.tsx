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
  ShieldAlert,
  LogOut
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

  const handleLogout = () => {
    localStorage.removeItem('tz_user');
    window.dispatchEvent(new Event('storage'));
    navigate('/auth');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 truncate">
              {activeTab === 'Saved' ? 'Saved Intelligence' : 'My Asset Ledger'}
            </h2>
            <div className="hidden sm:block h-6 w-px bg-gray-100" />
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Merchant: {user.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleLogout} className="p-2 sm:px-4 sm:py-2.5 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 overflow-x-auto scrollbar-hide border-b border-gray-50 bg-white sticky top-0 z-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 py-4 sm:py-5 px-3 sm:px-4 text-[11px] sm:text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[#17933f]' : 'text-gray-400 hover:text-gray-700'}`}
            >
              {tab.label} <span className="opacity-50 text-[9px] sm:text-[11px]">({getCount(tab.id)})</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-[#17933f] rounded-t-full" />}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-8 min-h-[350px]">
          {filteredListings.length > 0 ? (
            <div className="w-full space-y-3 sm:space-y-4">
              {filteredListings.map(l => (
                <div key={l.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-emerald-100">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <img src={l.images[0]} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover shrink-0" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{l.title}</h4>
                      <p className="text-[10px] sm:text-xs text-emerald-600 font-black uppercase tracking-widest">{l.currency} {l.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <Link to={`/listing/${l.id}`} className="p-1.5 sm:p-2 text-gray-400 hover:text-[#17933f] shrink-0">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20">
              <ShieldAlert className="w-16 h-16 text-gray-100 mb-6" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Records Found</h3>
              <Link to="/post-ad" className="inline-flex items-center gap-3 bg-[#17933f] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm shadow-xl">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Transmit Asset
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-[#002b1b] text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative z-10">
          <div>
            <span className="text-[11px] sm:text-sm font-bold opacity-80 uppercase tracking-widest">Available Trade Credits</span>
            <div className="text-5xl sm:text-6xl font-black text-[#ffda00] mb-4">{user.credits}</div>
            <div className="text-[10px] sm:text-xs font-medium text-emerald-100/60 leading-relaxed max-w-lg space-y-2">
              <p>Node Status: Active • Registration Node: {user.country}</p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                   <p className="text-emerald-400 font-black uppercase">Pakistan Hub</p>
                   <p>Quota: 30 Free • Standard: 5 Credits</p>
                </div>
                <div>
                   <p className="text-emerald-400 font-black uppercase">International Node</p>
                   <p>Quota: 5 Free • Standard: 1 Credit</p>
                </div>
              </div>
              <p className="text-emerald-400 font-black italic">Bonus: 10 Credits automatically awarded after full utilization of initial quota.</p>
            </div>
          </div>
          <button onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto px-10 bg-white text-[#002b1b] py-4 rounded-2xl font-black text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-xl">
            Settle Balance
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"><X className="w-6 h-6 text-gray-400" /></button>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-serif-italic text-emerald-950 mb-8">Settle Trade Balance</h2>
              <div className="flex gap-2 sm:gap-4 mb-8">
                <button onClick={() => setPaymentMethod('easypaisa')} className={`flex-1 p-3 sm:p-4 rounded-2xl border transition-all ${paymentMethod === 'easypaisa' ? 'bg-[#eaf7ed] border-[#17933f]' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <Smartphone className={`w-5 h-5 mx-auto mb-2 ${paymentMethod === 'easypaisa' ? 'text-[#17933f]' : 'text-gray-400'}`} />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">EasyPaisa (PK)</span>
                </button>
                <button onClick={() => setPaymentMethod('usdt')} className={`flex-1 p-3 sm:p-4 rounded-2xl border transition-all ${paymentMethod === 'usdt' ? 'bg-emerald-950 border-emerald-900' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <Globe className={`w-5 h-5 mx-auto mb-2 ${paymentMethod === 'usdt' ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">USDT / Global</span>
                </button>
              </div>

              {paymentMethod === 'easypaisa' ? (
                <div className="animate-in fade-in duration-500">
                  <div className="bg-gray-50 rounded-[24px] p-5 sm:p-6 border border-gray-100 mb-8">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#17933f] mb-3 block">Account Identifier</span>
                    <div className="flex items-center gap-2 bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm justify-between">
                      <span className="text-lg sm:text-xl font-black text-emerald-950 tracking-widest">0346290804</span>
                      <button onClick={() => handleCopy('0346290804')} className={`p-2 rounded-xl transition-all ${copied ? 'bg-[#17933f] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#17933f]'}`}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <div className="bg-emerald-950 rounded-[28px] p-5 sm:p-6 border border-emerald-900 mb-4 text-white">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 block">BEP-20 Wallet Address</span>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-4 rounded-2xl border border-white/10 shadow-sm justify-between overflow-hidden">
                      <span className="text-[9px] font-mono font-bold text-emerald-100 truncate pr-2">0xf4de42ff72ca0f6935ba802cb04706c402f402f4f9da</span>
                      <button onClick={() => handleCopy('0xf4de42ff72ca0f6935ba802cb04706c402f402f4f9da')} className={`shrink-0 p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400'}`}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[8px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                Settlement Rate: 5 Credits = 1 USDT. Provisioning occurs post-confirmation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;