import React, { useState, useEffect, useMemo } from 'react';
import { Rocket, ShieldCheck, MapPin, Globe, ChevronRight, Gem, TrendingUp, Building2, ExternalLink } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ProjectPromotion } from '../types';

const Projects: React.FC = () => {
  const [promos, setPromos] = useState<ProjectPromotion[]>([]);

  useEffect(() => {
    setPromos(storageService.getPromotions());
    const handleStorage = () => setPromos(storageService.getPromotions());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      <header className="bg-emerald-950 pt-24 pb-48 px-6 text-center relative overflow-hidden rounded-b-[64px]">
        <div className="absolute inset-0 opacity-10"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200" className="w-full h-full object-cover grayscale" alt="" /><div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" /></div>
        <div className="max-w-4xl mx-auto relative z-10"><div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8"><Rocket className="w-4 h-4" /> Institutional Launchpad</div><h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 tracking-tighter">Project <span className="text-emerald-500">Showcase.</span></h1><p className="text-emerald-100/40 text-xl max-w-2xl mx-auto font-medium leading-relaxed">Direct access to the region's most ambitious residential, commercial, and industrial developments.</p></div>
      </header>
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
         <div className="grid grid-cols-1 gap-16">
            {promos.map(promo => (
              <div key={promo.id} className="group bg-white rounded-[64px] overflow-hidden border border-gray-100 shadow-3xl flex flex-col lg:flex-row min-h-[500px] hover:border-emerald-500/20 transition-all duration-700">
                 <div className="lg:w-[45%] relative overflow-hidden h-96 lg:h-auto"><img src={promo.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className="absolute top-10 left-10"><div className="bg-emerald-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"><Gem className="w-4 h-4 fill-white" /> {promo.packageType}</div></div></div>
                 <div className="lg:w-[55%] p-10 lg:p-20 flex flex-col justify-center"><div className="flex items-center gap-4 mb-8"><span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em] border-b-2 border-emerald-500/20 pb-1">{promo.developerName}</span><div className="w-1 h-1 bg-gray-200 rounded-full" /> <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {promo.location.city}, {promo.location.country}</span></div><h2 className="text-4xl lg:text-6xl font-serif-italic text-emerald-950 mb-8 leading-[1.1] tracking-tight">{promo.title}</h2><p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed mb-12 opacity-80">{promo.description}</p><div className="mt-auto flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] mb-2">Inventory Valuation</p><div className="text-3xl lg:text-5xl font-black text-emerald-950"><span className="text-lg font-bold text-emerald-600 mr-2">{promo.currency}</span>{promo.priceStart.toLocaleString()}+</div></div><a href={promo.link} target="_blank" className="flex items-center gap-3 bg-emerald-950 text-white px-10 py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-3xl active:scale-95">Explore Project <ExternalLink className="w-4 h-4" /></a></div></div>
              </div>
            ))}
         </div>
         {promos.length === 0 && (
           <div className="text-center py-40 bg-gray-50 rounded-[64px] border-2 border-dashed border-gray-100"><Rocket className="w-24 h-24 text-gray-200 mx-auto mb-8" /><h3 className="text-3xl font-serif-italic text-emerald-950 mb-4">No Active Developments</h3><p className="text-gray-400 font-medium max-w-sm mx-auto">Institutional nodes are currently preparing the next project synchronization cycle.</p></div>
         )}
      </div>
    </div>
  );
};

export default Projects;