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
  Smartphone,
  Activity,
  BadgeCheck,
  Rocket,
  ShieldCheck,
  Gem,
  ChevronDown,
  Newspaper,
  ArrowUpRight
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { locationService } from '../services/locationService.ts';
import { CategoryType, AdStatus, Listing, Dealer, ProjectPromotion, NewsArticle } from '../types.ts';
import { MARKET_KEYWORDS, COUNTRIES } from '../constants.ts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userCountry = useMemo(() => locationService.detectUserCountry(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(userCountry);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [allPromotions, setAllPromotions] = useState<ProjectPromotion[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const handleSync = () => {
      setRefreshTrigger(prev => prev + 1);
      setDealers(storageService.getDealers());
      setAllPromotions(storageService.getPromotions());
      setNews(storageService.getNews());
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    storageService.syncWithCloud().then(() => handleSync());
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const promotions = useMemo(() => {
    return allPromotions.filter(p => 
      p.isWeeklyFeatured && 
      (p.location.country === selectedCountry || selectedCountry === 'All')
    );
  }, [allPromotions, selectedCountry]);

  const allActiveListings = useMemo(() => {
    // getListings already implements Tiered Chronological Sort: (Featured -> Latest -> Standard -> Latest)
    return storageService.getListings().filter(l => l.status === AdStatus.ACTIVE);
  }, [refreshTrigger]);

  const handleQuickSearch = (keyword: string) => {
    navigate(`/search?q=${encodeURIComponent(keyword)}&country=${selectedCountry}`);
  };

  return (
    <div className="space-y-24 pb-24 animate-in fade-in duration-500">
      
      {/* HERO SECTION */}
      <section className="relative rounded-[40px] md:rounded-[64px] overflow-hidden bg-emerald-950 px-4 py-20 md:py-32 text-center">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1582408921715-18e7806367c1?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover grayscale" alt="" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex flex-col items-center mb-8">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">Select Regional Node First</span>
             <div className="relative group">
                <div className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-emerald-500/30 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-transparent border-none outline-none font-black text-white text-lg cursor-pointer appearance-none pr-8"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-emerald-950 text-white">{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 w-4 h-4 text-emerald-400 pointer-events-none" />
                </div>
             </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif-italic text-white mb-10 leading-[1.1] tracking-tighter">
            Trade High-Value Assets <br />
            <span className="text-emerald-500">Across the Hub.</span>
          </h1>
          <form onSubmit={(e) => { e.preventDefault(); handleQuickSearch(searchQuery); }} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[32px] md:rounded-[40px] max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2 shadow-2xl">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input type="text" placeholder="Search Property, Vehicles, or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white rounded-[26px] py-5 pl-14 pr-6 outline-none text-emerald-950 font-bold text-base placeholder:text-gray-400" />
            </div>
            <button type="submit" className="w-full md:w-auto bg-emerald-600 text-white px-10 py-5 rounded-[26px] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95">Search Node</button>
          </form>
        </div>
      </section>

      {/* MARKET INTEL PREVIEW */}
      {news.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h2 className="text-3xl font-serif-italic text-emerald-950">Market <span className="text-emerald-600">Intel</span></h2>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Administrative Briefings & Global Signals</p>
            </div>
            <Link to="/news" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-800 transition-all flex items-center gap-2 group">
              Explore All Intelligence <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((article) => (
              <Link 
                to="/news" 
                key={article.id} 
                className="group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                    {article.category}
                  </div>
                </div>
                <div className="p-8 flex-1">
                  <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-3">
                    {new Date(article.publishedAt).toLocaleDateString()} • Bureau Chief
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{article.title}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-4 line-clamp-2 leading-relaxed">{article.metaDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED INVENTORY */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-serif-italic text-emerald-950">Active <span className="text-emerald-600">Transmissions</span></h2>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Verified visibility protocol (Featured First)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allActiveListings.slice(0, 12).map(item => <ListingCard key={item.id} listing={item} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;