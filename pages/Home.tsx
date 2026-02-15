
import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  Laptop, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Building2,
  Package,
  Search,
  Globe,
  Clock,
  Zap,
  TrendingUp,
  MapPin,
  Smartphone
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { locationService } from '../services/locationService.ts';
import { CategoryType, AdStatus, Listing } from '../types.ts';
import { MARKET_KEYWORDS } from '../constants.ts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userCountry = useMemo(() => locationService.detectUserCountry(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(userCountry);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleSync = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('storage', handleSync);
    storageService.syncWithCloud().then(() => setRefreshTrigger(p => p + 1));
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const allActiveListings = useMemo(() => {
    return storageService.getListings()
      .filter(l => l.status === AdStatus.ACTIVE)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [refreshTrigger]);

  const featuredListings = useMemo(() => {
    return allActiveListings.filter(l => l.featured).slice(0, 4);
  }, [allActiveListings]);

  const regionalIntel = useMemo(() => {
    return MARKET_KEYWORDS[selectedCountry] || MARKET_KEYWORDS['Pakistan'];
  }, [selectedCountry]);

  const categories = [
    { name: CategoryType.PROPERTIES, icon: <Building2 className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { name: CategoryType.VEHICLES, icon: <Car className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
    { name: CategoryType.ELECTRONICS, icon: <Laptop className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
    { name: CategoryType.GENERAL, icon: <Package className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
  ];

  const handleQuickSearch = (keyword: string) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}&country=${selectedCountry}`);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      {/* HERO SECTION */}
      <section className="relative rounded-[40px] md:rounded-[56px] overflow-hidden bg-emerald-950 px-4 py-16 md:py-24 text-center">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1582408921715-18e7806367c1?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover grayscale" 
            alt="" 
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Premium Marketplace Node
          </div>
          
          <h1 className="text-3xl md:text-6xl font-serif-italic text-white mb-5 leading-tight">
            The Elite Gateway to <br />
            <span className="text-emerald-500">Global Trade Assets.</span>
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); handleQuickSearch(searchQuery); }} className="bg-white/10 backdrop-blur-3xl border border-white/20 p-1.5 rounded-[24px] md:rounded-[30px] max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-1.5 shadow-2xl">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input 
                type="text" 
                placeholder="Search Property, Vehicles, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-[18px] md:rounded-[22px] py-4 pl-12 pr-4 outline-none text-emerald-950 font-bold"
              />
            </div>
            <button type="submit" className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-[18px] md:rounded-[22px] font-black uppercase tracking-widest text-[10px] shadow-xl">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* REGIONAL PULSE - KEYWORD CLUSTERS */}
      <section className="max-w-7xl mx-auto px-4 animate-in slide-in-from-bottom-4 duration-700">
         <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-600" /> {selectedCountry} <span className="text-emerald-500">Market Pulse</span>
                </h2>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Real-time regional intelligence nodes</p>
              </div>
              <div className="flex gap-2">
                {['Pakistan', 'United Arab Emirates', 'India', 'Saudi Arabia'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCountry === c ? 'bg-emerald-950 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-200 hover:bg-emerald-50'}`}
                  >
                    {c === 'United Arab Emirates' ? 'UAE' : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
                    <Car className="w-4 h-4" /> Motors Pipeline
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regionalIntel.motors.map(keyword => (
                      <button key={keyword} onClick={() => handleQuickSearch(keyword)} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[9px] font-bold text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
                        {keyword}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600">
                    <Building2 className="w-4 h-4" /> Property Ledger
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regionalIntel.property.map(keyword => (
                      <button key={keyword} onClick={() => handleQuickSearch(keyword)} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[9px] font-bold text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        {keyword}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-600">
                    <Smartphone className="w-4 h-4" /> Digital Assets
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regionalIntel.tech.map(keyword => (
                      <button key={keyword} onClick={() => handleQuickSearch(keyword)} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[9px] font-bold text-gray-500 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm">
                        {keyword}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link key={i} to={`/search?category=${cat.name}`} className="group bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-all">
              <div className={`${cat.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>{cat.icon}</div>
              <div className="text-left">
                <h2 className="text-emerald-950 font-bold text-sm group-hover:text-emerald-600">{cat.name}</h2>
                <p className="text-[9px] font-black uppercase text-gray-400">Inventory Sync</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED INVENTORY */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-serif-italic text-emerald-950">Elite <span className="text-emerald-600">Transmissions</span></h2>
            </div>
            <Link to="/search" className="text-[10px] font-black uppercase text-emerald-600 tracking-widest hover:underline flex items-center gap-2">Explore Ledger <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map(item => <ListingCard key={item.id} listing={item} />)}
          </div>
        </section>
      )}

      {/* RECENT ACTIVITY */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-serif-italic text-emerald-950">Recently <span className="text-emerald-600">Verified</span></h2>
          </div>
          <div className="h-px bg-gray-100 flex-1 mx-8 hidden md:block opacity-50"></div>
          <Link to="/search" className="text-[10px] font-black uppercase text-emerald-600 tracking-widest hover:underline">Full Registry</Link>
        </div>
        
        {allActiveListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allActiveListings.slice(0, 8).map(item => <ListingCard key={item.id} listing={item} />)}
          </div>
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Global Node Inventory...</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
