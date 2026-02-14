import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  Laptop, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  TrendingUp,
  Search,
  Globe,
  Smartphone,
  ChevronRight,
  Sparkles,
  Building2,
  Package,
  History,
  CheckCircle2
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { locationService } from '../services/locationService.ts';
import { CategoryType, AdStatus } from '../types.ts';
import { COUNTRIES } from '../constants.ts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userCountry = useMemo(() => locationService.detectUserCountry(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(userCountry);

  const featuredListings = useMemo(() => {
    return storageService.getListings()
      .filter(l => l.featured && l.status === AdStatus.ACTIVE)
      .slice(0, 8);
  }, []);

  const categories = [
    { name: CategoryType.PROPERTIES, icon: <Building2 className="w-5 h-5" />, count: '45k+', color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-200' },
    { name: CategoryType.VEHICLES, icon: <Car className="w-5 h-5" />, count: '12k+', color: 'bg-emerald-50 text-emerald-600', hover: 'hover:border-emerald-200' },
    { name: CategoryType.ELECTRONICS, icon: <Laptop className="w-5 h-5" />, count: '28k+', color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-200' },
    { name: CategoryType.GENERAL, icon: <Package className="w-5 h-5" />, count: '15k+', color: 'bg-orange-50 text-orange-600', hover: 'hover:border-orange-200' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}&country=${selectedCountry}`);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-1000">
      
      {/* 1. HERO SECTION */}
      <section className="relative rounded-[40px] md:rounded-[56px] overflow-hidden bg-emerald-950 px-4 py-16 md:py-24 text-center">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1582408921715-18e7806367c1?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover grayscale" 
            alt="Trazot Premium Classifieds Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Buy and Sale Premium Assets
          </div>
          
          <h1 className="text-3xl md:text-6xl font-serif-italic text-white mb-5 leading-tight">
            The Elite Gateway to <br />
            <span className="text-emerald-500">Buy Property & Vehicles.</span>
          </h1>

          <p className="text-emerald-100/60 text-sm md:text-base font-light max-w-2xl mx-auto mb-8">
            The most trusted marketplace to buy houses, sell luxury vehicles, and trade premium electronics in GCC and South Asia.
          </p>

          {/* Search Console */}
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-3xl border border-white/20 p-1.5 rounded-[24px] md:rounded-[30px] max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-1.5 shadow-2xl">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Property, Vehicles, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-[18px] md:rounded-[22px] py-3.5 md:py-4 pl-12 md:pl-14 pr-4 outline-none text-emerald-950 font-bold placeholder:text-gray-400 shadow-inner text-xs md:text-sm"
              />
            </div>
            <div className="w-full md:w-36 relative">
               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
               <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-white rounded-[18px] md:rounded-[22px] py-3.5 md:py-4 pl-10 pr-4 outline-none text-gray-600 font-bold appearance-none cursor-pointer text-xs"
               >
                 <option value="All">Global</option>
                 {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <button type="submit" className="w-full md:w-auto bg-emerald-600 text-white px-7 md:px-8 py-3.5 md:py-4 rounded-[18px] md:rounded-[22px] font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories Discovery */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="sr-only">Browse by Sale Categories: Property, Vehicles, and Electronics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              to={`/search?category=${cat.name}`}
              className={`group bg-white p-4 md:p-5 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-300 flex items-center gap-4 ${cat.hover} hover:shadow-md`}
            >
              <div className={`${cat.color} w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0`}>
                {cat.icon}
              </div>
              <div className="text-left">
                <h3 className="text-emerald-950 font-bold text-xs md:text-sm group-hover:text-emerald-600 transition-colors">{cat.name}</h3>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">Buy & Sale</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-emerald-400 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-serif-italic text-emerald-950">Buy <span className="text-emerald-600">Verified Assets</span></h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Top-rated property and vehicle listings</p>
          </div>
          <Link to="/search?featured=true" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {featuredListings.map(item => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;