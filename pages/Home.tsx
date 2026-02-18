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
  ArrowUpRight,
  LineChart,
  BarChart4,
  Server
} from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';
import { CategoryType, AdStatus, Listing, Dealer, ProjectPromotion, NewsArticle } from '../types';
import { MARKET_KEYWORDS, COUNTRIES } from '../constants';

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

  const allActiveListings = useMemo(() => {
    const data = storageService.getListings();
    return data.filter(l => l.status === AdStatus.ACTIVE);
  }, [refreshTrigger]);

  // SEO STRATEGY: Automated JSON-LD Generation
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Trazot",
      "url": "https://www.trazot.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.trazot.com/#/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4">Select Regional Node</span>
             <div className="relative group">
                <div className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-emerald-500/30 rounded-2xl hover:bg-white/10 transition-all cursor-pointer shadow-2xl">
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
            <span className="text-emerald-500">With Absolute Trust.</span>
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

      {/* AUTHORITY PULSE (Competitive Advantage vs OLX/Zameen) */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="bg-white rounded-[48px] p-8 md:p-16 border border-gray-100 shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-12 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-200 to-emerald-500" />
           
           <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <BarChart4 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-italic text-emerald-950">Market Intelligence</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Unlike generalist platforms, Trazot provides real-time regional indices for property and industrial machinery across GCC corridors.
              </p>
              <div className="flex items-center gap-4 text-emerald-600">
                <div className="text-2xl font-black">+14.2%</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Riyadh Demand Index</span>
              </div>
           </div>

           <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-italic text-emerald-950">Institutional Verification</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Every merchant node is anchored to a verified legal identity. We eliminate the information asymmetry found in unmoderated marketplaces.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase">
                <BadgeCheck className="w-4 h-4" /> Zero-Scam Protocol Active
              </div>
           </div>

           <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-italic text-emerald-950">Cross-Border Relay</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Seamlessly trade assets between South Asia and the Middle East through our unified logistics and representative services.
              </p>
              <Link to="/services" className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] group">
                Explore Services <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>
        </div>
      </section>

      {/* FEATURED INVENTORY */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-serif-italic text-emerald-950">Active <span className="text-emerald-600">Transmissions</span></h2>
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Institutional Verified Inventory (Featured First)</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['Properties', 'Vehicles', 'Electronics'].map(cat => (
              <button key={cat} onClick={() => navigate(`/search?category=${cat}`)} className="px-5 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-gray-100">
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {allActiveListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allActiveListings.slice(0, 12).map(item => <ListingCard key={item.id} listing={item} />)}
          </div>
        ) : (
          <div className="py-24 text-center bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No active transmissions in current regional node.</p>
          </div>
        )}
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
                <h2 className="text-3xl font-serif-italic text-emerald-950">Market <span className="text-emerald-600">Intelligence</span></h2>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Expert Briefings & Regional Signals</p>
            </div>
            <Link to="/news" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-800 transition-all flex items-center gap-2 group">
              Global Briefings <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                    {new Date(article.publishedAt).toLocaleDateString()} • Bureau Authorized
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">{article.title}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-4 line-clamp-2 leading-relaxed">{article.metaDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;