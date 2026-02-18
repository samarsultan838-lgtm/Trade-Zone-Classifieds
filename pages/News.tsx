import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Clock, 
  User, 
  Share2, 
  Globe,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ShieldCheck,
  Bookmark,
  BellRing,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Gem,
  BookOpen,
  Tag as TagIcon
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { NewsArticle } from '../types';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState('All');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const fetchNews = () => {
      const data = storageService.getNews();
      setNews(data);
    };
    fetchNews();
    window.addEventListener('storage', fetchNews);
    return () => window.removeEventListener('storage', fetchNews);
  }, []);

  useEffect(() => {
    if (readingArticle) {
      document.title = `${readingArticle.title} | Trazot Intelligence`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', readingArticle.metaDescription);
    } else {
      document.title = 'Trazot | Global Trade Intelligence Hub';
    }
  }, [readingArticle]);

  const categories = ['All', 'Market Trend', 'Trade Zone News', 'Expert Advice', 'Tech Update'];
  
  const filteredNews = useMemo(() => {
    const base = filter === 'All' ? news : news.filter(n => n.category === filter);
    // Explicit sort to double-ensure latest is top
    return [...base].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [news, filter]);

  const featured = useMemo(() => filteredNews.length > 0 ? filteredNews[0] : null, [filteredNews]);
  const others = useMemo(() => filteredNews.length > 1 ? filteredNews.slice(1) : [], [filteredNews]);

  const marketStats = [
    { label: 'Riyadh Index', val: '+14.2%', trend: 'up', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'Dubai Luxury', val: 'Hyper-Liquid', trend: 'stable', icon: <Minus className="w-3 h-3" /> },
    { label: 'South Asia Node', val: '+5.8%', trend: 'up', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'GCC Logistics', val: '-2.1%', trend: 'down', icon: <TrendingDown className="w-3 h-3" /> }
  ];

  return (
    <div className="pb-32 bg-white min-h-screen selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-700">
      <header className="bg-[#01110a] pt-20 pb-48 px-6 relative overflow-hidden text-center rounded-b-[64px] md:rounded-b-[120px]">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=60&w=1600" className="w-full h-full object-cover grayscale" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#01110a] via-[#01110a]/70 to-[#01110a]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <Globe className="w-4 h-4" /> Global Intelligence Relay
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-6 tracking-tighter leading-none">
            Bureau <span className="text-emerald-500">Briefings</span>
          </h1>
          <p className="text-emerald-100/40 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed px-4">
            Authorized market signals and institutional analysis for GCC and South Asian trade corridors.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
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

        <div className="flex items-center justify-start md:justify-center gap-3 mb-20 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === cat 
                ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl scale-105' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100 hover:text-emerald-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {featured && (
          <section className="mb-32">
            <div 
              onClick={() => setReadingArticle(featured)}
              className="group bg-white rounded-[64px] overflow-hidden border border-gray-100 shadow-3xl flex flex-col lg:flex-row min-h-[650px] hover:border-emerald-600/30 transition-all duration-700 cursor-pointer"
            >
              <div className="lg:w-[55%] relative overflow-hidden h-96 lg:h-auto">
                <img src={featured.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt={featured.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
                <div className="absolute top-10 left-10">
                   <div className="bg-emerald-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                     <Zap className="w-4 h-4 fill-white" /> Latest Intel
                   </div>
                </div>
              </div>
              <div className="lg:w-[45%] p-10 lg:p-20 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em] border-b-2 border-emerald-500/20 pb-1">
                    {featured.category}
                  </span>
                  <div className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(featured.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-serif-italic text-emerald-950 mb-10 leading-[1.05] tracking-tight group-hover:text-emerald-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-lg lg:text-xl leading-relaxed mb-12 line-clamp-4 font-medium italic opacity-80">
                  {featured.metaDescription}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.3em] text-[11px] group-hover:gap-6 transition-all">
                    Expand Technical Brief <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {others.map((article) => (
              <article 
                key={article.id}
                onClick={() => setReadingArticle(article)}
                className="group cursor-pointer flex flex-col bg-white rounded-[48px] overflow-hidden border border-gray-50 shadow-sm hover:shadow-4xl hover:border-emerald-50/20 transition-all duration-500"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-gray-100">
                  <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={article.title} />
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-xl text-[9px] font-black uppercase text-emerald-900 tracking-widest shadow-xl">
                    {article.category}
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-emerald-950 mb-6 line-clamp-2 leading-[1.2] group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-10 font-medium">
                    {article.metaDescription}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {readingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#01110a]/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[64px] max-w-5xl w-full max-h-[94vh] overflow-y-auto scrollbar-hide relative shadow-4xl animate-in zoom-in-95 duration-700 border border-emerald-50">
            <div className="sticky top-0 z-[110] flex justify-end p-8 pointer-events-none">
              <button 
                onClick={() => setReadingArticle(null)}
                className="pointer-events-auto p-5 bg-gray-50 hover:bg-red-50 text-emerald-950 hover:text-red-500 rounded-[28px] transition-all shadow-xl active:scale-95"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <article className="px-8 lg:px-24 pb-32 -mt-16">
               <div className="max-w-4xl mx-auto space-y-12">
                  <header className="space-y-10">
                    <div className="flex items-center gap-6">
                      <span className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.3em] bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
                        {readingArticle.category}
                      </span>
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(readingArticle.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h1 className="text-5xl lg:text-8xl font-serif-italic text-emerald-950 leading-[0.95] tracking-tight">
                      {readingArticle.title}
                    </h1>
                  </header>
                  <div className="editorial-content max-w-none">
                     <p className="text-2xl lg:text-4xl text-emerald-950/90 leading-tight font-serif-italic mb-16 border-l-8 border-emerald-500 pl-10 py-4 bg-emerald-50/20 rounded-r-[32px]">
                        {readingArticle.metaDescription}
                     </p>
                     <div className="space-y-10">
                        {readingArticle.content.split('\n').filter(p => p.trim()).map((para, pi) => (
                           <p key={pi} className="text-xl lg:text-2xl text-gray-600 leading-[1.6] font-medium font-sans">
                              {para}
                           </p>
                        ))}
                     </div>
                  </div>
               </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;