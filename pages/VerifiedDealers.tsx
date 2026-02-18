import React, { useState, useEffect, useMemo } from 'react';
import { BadgeCheck, ShieldCheck, Search, MapPin, Phone, MessageCircle, Globe, Star, ChevronRight, ArrowUpRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Dealer } from '../types';

const VerifiedDealers: React.FC = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setDealers(storageService.getDealers());
    const handleStorage = () => setDealers(storageService.getDealers());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filtered = useMemo(() => dealers.filter(d => 
    d.companyName.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
  ), [dealers, search]);

  return (
    <div className="pb-24 animate-in fade-in duration-700">
      <header className="bg-[#01110a] pt-20 pb-32 px-6 rounded-b-[64px] text-center relative overflow-hidden mb-16">
         <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
               <ShieldCheck className="w-4 h-4" /> Global Verification Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-serif-italic text-white mb-6">Verified <span className="text-emerald-500">Trade Partners</span></h1>
            <p className="text-emerald-100/40 text-lg max-w-2xl mx-auto font-medium">Access our network of institutional-grade merchants, agencies, and regional developers.</p>
         </div>
      </header>
      <div className="max-w-7xl mx-auto px-6">
         <div className="bg-white p-2 rounded-[32px] shadow-4xl border border-gray-100 mb-16 max-w-2xl mx-auto flex items-center relative group">
            <Search className="absolute left-6 w-5 h-5 text-emerald-600" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Verified Agency or Representative..." className="w-full bg-gray-50 rounded-[26px] py-5 pl-14 pr-6 text-sm font-bold text-emerald-950 outline-none border border-transparent focus:border-emerald-100 focus:bg-white transition-all" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(dealer => (
              <div key={dealer.id} className="group bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-4xl hover:border-emerald-500/20 transition-all duration-700">
                 <div className="h-32 bg-emerald-950 relative">
                    <img src={dealer.coverImage} className="w-full h-full object-cover opacity-20" alt="" />
                    <div className="absolute -bottom-10 left-10"><div className="w-24 h-24 bg-white rounded-[32px] p-1 shadow-2xl border-4 border-white overflow-hidden"><img src={dealer.logo} className="w-full h-full object-cover rounded-[28px]" alt="" /></div></div>
                 </div>
                 <div className="pt-16 p-10 space-y-6">
                    <div><div className="flex items-center gap-2 mb-2"><h3 className="text-2xl font-bold text-emerald-950">{dealer.companyName}</h3><BadgeCheck className="w-6 h-6 text-emerald-600" /></div><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{dealer.name} • Official Delegate</p></div>
                    <p className="text-gray-500 text-sm font-medium line-clamp-3 leading-relaxed">{dealer.description}</p>
                    <div className="flex flex-wrap gap-2 pt-4">{dealer.specialization.map(s => <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-lg border border-emerald-100">{s}</span>)}</div>
                    <div className="pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                       <button onClick={() => window.open(`https://wa.me/${dealer.whatsappNumber}`)} className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:scale-[1.02] transition-all"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
                       <button onClick={() => window.location.href = `tel:${dealer.contactPhone}`} className="flex items-center justify-center gap-2 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-black transition-all"><Phone className="w-4 h-4" /> Initialize</button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default VerifiedDealers;