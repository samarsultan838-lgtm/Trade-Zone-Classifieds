import React, { useEffect, useState } from 'react';
import { 
  Newspaper, 
  ArrowRight, 
  Clock, 
  User, 
  Share2, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  X, 
  BellRing, 
  Bookmark, 
  TrendingUp, 
  Info, 
  ShieldCheck, 
  Globe,
  ChevronRight,
  BookOpen,
  Calendar
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
  
  const filteredNews = filter === 'All' ? news : news.filter(n => n.category === filter);
  const featured = filteredNews.length > 0 ? filteredNews[0] : null;
  const others = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div className="pb-32 bg-white min-h-screen">
      {/* Cinematic Header */}
      <header className="bg-emerald-950 pt-16 md:pt-24 pb-40 md:pb-56 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover grayscale" 
            alt="Market data visualization" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/60 to-emerald-950" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6 md:mb-8 animate-in slide-in-from-top-4 duration-1000">
            <Globe className="w-3.5 h-3.5" /> Regional Intelligence Network
          </div>
          <h1 className="text-4xl md:text-8xl font-serif-italic text-white mb-6 md:mb-8 tracking-tight leading-none">
            Trade <span className="text-emerald-500">Intelligence</span>
          </h1>
          <p className="text-emerald-100/60 max-w-2xl mx-auto text-base md:text-xl font-light leading-relaxed px-4">
            Technical analysis, valuation benchmarks, and regional expansion briefs curated for the Trazot elite participant network.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-20">
        {/* Market Stats Bar */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl border border-emerald-50 mb-12 md:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
           {[
             { label: 'Riyadh Index', val: '+14.2%', trend: 'up' },
             { label: 'Dubai Luxury SUV', val: 'Hyper-Liquid', trend: 'stable' },
             { label: 'South Asia PropTech', val: 'Active Nodes', trend: 'up' },
             { label: 'Elite Merchants', val: '50k+ Verified', trend: 'up' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center justify-center border-b last:border-b-0 lg:border-b-0 lg:border-r border-gray-100 last:border-none pb-4 lg:pb-0">
                <span className="text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</span>
                <span className={`text-sm md:text-lg font-black uppercase tracking-tight ${stat.trend === 'up' ? 'text-emerald-600' : 'text-emerald-950'}`}>{stat.val}</span>
             </div>
           ))}
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center justify-start md:justify-center gap-2 mb-12 md:mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-6 md:px-8 py-3 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                filter === cat 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
              }`}
            >
              {cat === 'All' ? 'Full Spectrum' : cat}
            </button>
          ))}
        </div>

        {/* Featured Article Section */}
        {featured && (
          <section className="mb-16 md:mb-24">
            <div 
              onClick={() => setReadingArticle(featured)}
              className="group bg-white rounded-[40px] md:rounded-[56px] overflow-hidden border border-emerald-50 shadow-3xl flex flex-col lg:flex-row min-h-[500px] md:min-h-[600px] hover:border-emerald-600/30 transition-all duration-700 cursor-pointer"
            >
              <div className="lg:w-3/5 relative overflow-hidden h-64 md:h-auto">
                <img src={featured.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt={featured.title} />
                <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                  Featured Intel
                </div>
              </div>
              <div className="lg:w-2/5 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                    {featured.category}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {new Date(featured.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif-italic text-emerald-950 mb-6 md:mb-8 leading-tight group-hover:text-emerald-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm md:text-lg leading-relaxed mb-8 md:mb-12 line-clamp-3 font-medium">
                  {featured.content}
                </p>
                <div className="mt-auto">
                  <span className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                    Access intelligence <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-3 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest Intel Grid */}
        {others.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <h3 className="text-xl md:text-2xl font-serif-italic text-emerald-950">Latest <span className="text-emerald-600">Briefings</span></h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{others.length} Articles Found</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => setReadingArticle(article)}
                  className="group cursor-pointer flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={article.title} />
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-emerald-900 tracking-widest border border-white/50">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                       <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                       <div className="w-1 h-1 bg-gray-200 rounded-full" />
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 4 min read</span>
                    </div>
                    <h4 className="text-xl font-bold text-emerald-950 mb-4 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">
                      {article.content}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-emerald-950 tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                         Read More <ChevronRight className="w-3 h-3 text-emerald-500" />
                       </span>
                       <button className="p-2 text-gray-300 hover:text-emerald-600 transition-colors">
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
          <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
             <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-6" />
             <h3 className="text-2xl font-serif-italic text-emerald-950 mb-2">No briefings in this sector</h3>
             <p className="text-gray-400 font-medium">Our intelligence desk is currently compiling data for {filter}.</p>
             <button onClick={() => setFilter('All')} className="mt-8 text-emerald-600 font-black uppercase text-[10px] tracking-widest border-b-2 border-emerald-600/20 pb-1">Reset Filters</button>
          </div>
        )}
      </div>

      {/* Newsletter Anchor */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24">
        <div className="bg-emerald-950 rounded-[48px] md:rounded-[64px] p-8 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <BellRing className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-8 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-serif-italic text-white mb-6">Immediate <span className="text-emerald-500">Market Alerts</span></h2>
            <p className="text-emerald-100/60 text-lg font-light mb-12">
              Receive high-priority briefings directly from the Trazot Intelligence Network before public release.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Institutional Email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm"
              />
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-500 active:scale-95 transition-all">
                Authorize
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] md:rounded-[48px] max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setReadingArticle(null)}
              className="sticky top-6 right-6 ml-auto z-[110] p-3 md:p-4 bg-black/10 hover:bg-black/20 text-emerald-950 rounded-2xl backdrop-blur-md transition-all mr-6"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <div className="px-6 md:px-16 pb-16 md:pb-24">
               <div className="max-w-2xl mx-auto space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                      {readingArticle.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(readingArticle.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-6xl font-serif-italic text-emerald-950 leading-tight">
                    {readingArticle.title}
                  </h2>

                  <div className="flex items-center gap-4 py-6 border-y border-gray-100">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <User className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase text-emerald-950 tracking-widest">Trazot Intelligence Node</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Publication Bureau</p>
                     </div>
                  </div>

                  <img src={readingArticle.image} className="w-full rounded-[32px] shadow-lg mb-12" alt="" />

                  <div className="prose prose-emerald max-w-none">
                     <p className="text-lg md:text-xl text-emerald-950/80 leading-relaxed font-medium">
                        {readingArticle.content}
                     </p>
                     {/* Placeholder for more content to simulate a long read */}
                     <p className="text-lg md:text-xl text-emerald-950/80 leading-relaxed font-medium mt-6">
                        Further analysis indicates that the regional nodes are responding positively to these shifts. Participants are advised to maintain liquidity and monitor official Trazot channels for real-time asset valuation adjustments. Our engineering team is currently deploying secondary auditing protocols to ensure data fidelity across all listed high-value inventories.
                     </p>
                  </div>

                  <div className="pt-12 mt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Verified Intelligence Brief</span>
                     </div>
                     <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all">
                           <Share2 className="w-4 h-4" /> Share Intel
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-950 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all">
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