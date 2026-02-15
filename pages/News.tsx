import React, { useEffect, useState, useMemo } from 'react';
import { 
  Newspaper, 
  ArrowRight, 
  Clock, 
  User, 
  Share2, 
  Globe,
  ChevronRight,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ShieldCheck,
  Bookmark,
  BellRing,
  ArrowUpRight,
  // Added missing CheckCircle2 import
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { NewsArticle } from '../types.ts';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState('All');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    setNews(storageService.getNews());
  }, []);

  const categories = ['All', 'Market Trend', 'Trade Zone News', 'Expert Advice', 'Tech Update'];
  
  const filteredNews = useMemo(() => 
    filter === 'All' ? news : news.filter(n => n.category === filter)
  , [news, filter]);

  const featured = filteredNews.length > 0 ? filteredNews[0] : null;
  const others = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  const marketStats = [
    { label: 'Riyadh Index', val: '+14.2%', trend: 'up', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'Dubai Luxury', val: 'Hyper-Liquid', trend: 'stable', icon: <Minus className="w-3 h-3" /> },
    { label: 'South Asia Node', val: '+5.8%', trend: 'up', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'GCC Logistics', val: '-2.1%', trend: 'down', icon: <TrendingDown className="w-3 h-3" /> }
  ];

  return (
    <div className="pb-32 bg-white min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Cinematic Editorial Header */}
      <header className="bg-[#01110a] pt-20 pb-48 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=60&w=1600" 
            className="w-full h-full object-cover grayscale" 
            alt="" 
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#01110a] via-[#01110a]/70 to-[#01110a]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 animate-in slide-in-from-top-4 duration-1000">
            <Globe className="w-4 h-4" /> Global Trade Intelligence Node
          </div>
          <h1 className="text-4xl md:text-8xl font-serif-italic text-white mb-6 tracking-tighter leading-none">
            The <span className="text-emerald-500">Trazot</span> Briefing
          </h1>
          <p className="text-emerald-100/40 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed px-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards duration-1000 delay-300">
            Verified institutional analysis and high-fidelity market signals for regional trade participants.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        
        {/* Command Strip: Market Stats */}
        <div className="bg-white rounded-[32px] p-2 shadow-4xl border border-gray-100 mb-16 flex flex-wrap lg:flex-nowrap divide-y lg:divide-y-0 lg:divide-x divide-gray-50 overflow-hidden">
          {marketStats.map((stat, i) => (
            <div key={i} className="flex-1 min-w-[50%] lg:min-w-0 p-6 flex flex-col items-center justify-center group hover:bg-emerald-50 transition-colors">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1.5">{stat.label}</span>
              <div className={`flex items-center gap-2 text-sm font-black uppercase tracking-tight ${
                stat.trend === 'up' ? 'text-emerald-600' : 
                stat.trend === 'down' ? 'text-red-500' : 'text-emerald-950'
              }`}>
                {stat.icon}
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence Filters */}
        <div className="flex items-center justify-start md:justify-center gap-3 mb-16 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === cat 
                ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl scale-105' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-500/30 hover:text-emerald-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Intellectual Asset */}
        {featured && (
          <section className="mb-24">
            <div 
              onClick={() => setReadingArticle(featured)}
              className="group bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-3xl flex flex-col lg:flex-row min-h-[600px] hover:border-emerald-600/20 transition-all duration-700 cursor-pointer relative"
            >
              <div className="lg:w-[60%] relative overflow-hidden h-80 lg:h-auto">
                <img 
                  src={featured.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" 
                  alt="" 
                  loading="eager"
                  fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
                <div className="absolute top-8 left-8 flex gap-2">
                  <div className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">
                    Lead Intelligence
                  </div>
                </div>
              </div>
              <div className="lg:w-[40%] p-8 lg:p-16 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b-2 border-emerald-500/20 pb-1">
                    {featured.category}
                  </span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(featured.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-serif-italic text-emerald-950 mb-8 leading-[1.1] group-hover:text-emerald-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-12 line-clamp-4 font-medium opacity-80">
                  {featured.content}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.3em] text-[11px] group-hover:gap-5 transition-all">
                    Expand Analysis <ArrowRight className="w-5 h-5" />
                  </span>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Secondary Intel Grid */}
        {others.length > 0 && (
          <section className="space-y-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <h3 className="text-xl md:text-2xl font-serif-italic text-emerald-950 px-4">Latest <span className="text-emerald-600">Briefings</span></h3>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {others.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => setReadingArticle(article)}
                  className="group cursor-pointer flex flex-col bg-white rounded-[40px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-4xl hover:border-emerald-500/20 transition-all duration-500"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img 
                      src={article.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt="" 
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-xl text-[9px] font-black uppercase text-emerald-900 tracking-widest border border-white/50 shadow-xl">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                       <div className="w-1 h-1 bg-gray-200 rounded-full" />
                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 5m read</span>
                    </div>
                    <h4 className="text-2xl font-bold text-emerald-950 mb-5 line-clamp-2 leading-[1.2] group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium">
                      {article.content}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-emerald-950 tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all">
                         Read Insight <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                       </span>
                       <button className="p-3 bg-gray-50 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                         <Share2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center py-32 bg-gray-50 rounded-[48px] border border-gray-200">
             <Newspaper className="w-20 h-20 text-gray-200 mx-auto mb-6" />
             <h3 className="text-2xl font-serif-italic text-emerald-950 mb-3">No signals in this sector</h3>
             <p className="text-gray-400 font-medium max-w-sm mx-auto">Our research node is currently processing new data for the {filter} segment.</p>
             <button onClick={() => setFilter('All')} className="mt-10 px-8 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">Reset Network Filter</button>
          </div>
        )}
      </div>

      {/* Intelligence Dispatch Sign-up */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="bg-[#01110a] rounded-[64px] p-8 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-400 mx-auto mb-10 border border-emerald-500/20">
              <BellRing className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-serif-italic text-white mb-8">Authorize <span className="text-emerald-500">Market Alerts</span></h2>
            <p className="text-emerald-100/40 text-lg lg:text-xl font-medium mb-12 leading-relaxed">
              Secure priority access to regional trade intelligence before public synchronization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto p-2 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-md">
              <input 
                type="email" 
                placeholder="Institutional Email Address" 
                className="flex-1 bg-transparent px-6 py-4 text-white outline-none placeholder:text-white/20 font-bold text-sm"
              />
              <button className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all">
                Sync Node
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Reading Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#01110a]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] max-w-4xl w-full max-h-[92vh] overflow-y-auto scrollbar-hide relative shadow-4xl animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setReadingArticle(null)}
              className="sticky top-8 right-8 ml-auto z-[110] p-4 bg-gray-50 hover:bg-gray-100 text-emerald-950 rounded-2xl transition-all shadow-sm mr-8"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="px-8 lg:px-24 pb-24 -mt-10">
               <div className="max-w-3xl mx-auto space-y-10">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100">
                      {readingArticle.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(readingArticle.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-4xl lg:text-7xl font-serif-italic text-emerald-950 leading-[1] tracking-tight">
                    {readingArticle.title}
                  </h2>

                  <div className="flex items-center gap-5 py-8 border-y border-gray-50">
                     <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <User className="w-7 h-7" />
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase text-emerald-950 tracking-widest mb-0.5">Bureau Intelligence Node</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trazot Network Certified Publisher</p>
                     </div>
                  </div>

                  <div className="aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                    <img src={readingArticle.image} className="w-full h-full object-cover" alt="" />
                  </div>

                  <div className="prose prose-emerald max-w-none">
                     <p className="text-xl lg:text-2xl text-emerald-950/90 leading-relaxed font-medium">
                        {readingArticle.content}
                     </p>
                     <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 my-10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Verified Data Node
                        </h4>
                        <p className="text-base text-emerald-900 leading-relaxed font-bold italic">
                           "Our regional intelligence nodes indicate high-priority liquidity in the {readingArticle.category.toLowerCase()} segment. Strategic participants are advised to synchronize their asset portfolios accordingly."
                        </p>
                     </div>
                     <p className="text-lg text-gray-600 leading-relaxed font-medium">
                        Regional volatility benchmarks suggest a 4.5% uptick in institutional inquiries within the coming trade cycle. Trazot participants with "Elite" status will receive detailed valuation heatmaps via their secure workspace dashboard within the next 24 hours. Maintain node connectivity for real-time asset tracking.
                     </p>
                  </div>

                  <div className="pt-16 mt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-950">Node Intelligence Verified</span>
                     </div>
                     <div className="flex gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-gray-100">
                           <Share2 className="w-4 h-4" /> Dispatch
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl">
                           <Bookmark className="w-4 h-4" /> Save Packet
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;