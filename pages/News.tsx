import React, { useEffect, useState } from 'react';
import { Newspaper, ArrowRight, Clock, User, Share2, Search, CheckCircle2, Sparkles, Loader2, X, BellRing, Bookmark, TrendingUp, Info, ShieldCheck, Globe } from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { NewsArticle } from '../types.ts';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState('All');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['All']);
  const [submitting, setSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    setNews(storageService.getNews());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    storageService.subscribeEmail(email, selectedInterests);
    setSubmitting(false);
    setIsSubscribed(true);
    setEmail('');
  };

  const toggleInterest = (interest: string) => {
    if (interest === 'All') {
      setSelectedInterests(['All']);
    } else {
      setSelectedInterests(prev => {
        const withoutAll = prev.filter(p => p !== 'All');
        if (withoutAll.includes(interest)) {
          const res = withoutAll.filter(p => p !== interest);
          return res.length === 0 ? ['All'] : res;
        }
        return [...withoutAll, interest];
      });
    }
  };

  const categories = ['All', 'Market Trend', 'Trade Zone News', 'Expert Advice', 'Tech Update'];
  const interestOptions = ['Properties', 'Vehicles', 'Electronics', 'Valuation Reports'];
  
  const filteredNews = filter === 'All' ? news : news.filter(n => n.category === filter);
  const featured = news[0];
  const others = filteredNews.slice(featured && filter === 'All' ? 1 : 0);

  return (
    <div className="pb-32 bg-[#ffffff]">
      <header className="bg-emerald-950 pt-20 pb-48 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
          <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="Market data" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/40 to-emerald-950" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 animate-in slide-in-from-top-4 duration-1000">
            <Globe className="w-3.5 h-3.5" /> Regional Intelligence Network
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 tracking-tight">Trade <span className="text-emerald-500">Intelligence</span></h1>
          <p className="text-emerald-100/60 max-w-2xl mx-auto text-xl font-light leading-relaxed">
            Technical analysis, valuation benchmarks, and regional expansion briefs curated for the Trazot elite participant network.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        <div className="bg-white rounded-[32px] p-6 shadow-3xl border border-emerald-50 mb-16 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Riyadh Index', val: '+14.2%', trend: 'up' },
             { label: 'Dubai Luxury SUV', val: 'Hyper-Liquid', trend: 'stable' },
             { label: 'South Asia PropTech', val: 'Active Nodes', trend: 'up' },
             { label: 'Elite Merchants', val: '50k+ Verified', trend: 'up' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center justify-center border-r border-gray-100 last:border-none">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</span>
                <span className={`text-sm font-black uppercase tracking-tight ${stat.trend === 'up' ? 'text-emerald-600' : 'text-emerald-950'}`}>{stat.val}</span>
             </div>
           ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-16 overflow-x-auto pb-6 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                filter === cat ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xl' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
              }`}
            >
              {cat === 'All' ? 'Full Spectrum' : cat}
            </button>
          ))}
        </div>

        {featured && filter === 'All' && (
          <section className="mb-20">
            <div 
              onClick={() => setReadingArticle(featured)}
              className="group bg-white rounded-[56px] overflow-hidden border border-emerald-50 shadow-3xl flex flex-col lg:flex-row min-h-[600px] hover:border-emerald-600/30 transition-all duration-700 cursor-pointer"
            >
              <div className="lg:w-3/5 relative overflow-hidden">
                <img src={featured.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt={featured.title} />
              </div>
              <div className="lg:w-2/5 p-12 md:p-16 flex flex-col justify-center bg-white relative">
                <h2 className="text-4xl md:text-5xl font-serif-italic text-emerald-950 mb-8 leading-tight group-hover:text-emerald-600 transition-colors relative z-10">{featured.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-12 line-clamp-4 font-light relative z-10">
                  {featured.content}
                </p>
                <div className="flex items-center justify-between mt-auto relative z-10">
                  <span className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">
                    Access intelligence <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default News;