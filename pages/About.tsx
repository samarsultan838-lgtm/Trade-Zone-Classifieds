
import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  Globe, 
  Users, 
  Award, 
  Ship, 
  Building2, 
  Settings, 
  Briefcase,
  ArrowRight,
  Zap,
  CheckCircle2,
  TrendingUp,
  Scale
} from 'lucide-react';

const About: React.FC = () => {
  const stats = [
    { label: 'Asset Throughput', val: '$1.2B+', sub: 'Projected 2025' },
    { label: 'Verified Nodes', val: '4,800+', sub: 'Verified Merchants' },
    { label: 'Regional Reach', val: '8 Nations', sub: 'GCC & South Asia' },
    { label: 'Trade Velocity', val: '24/7', sub: 'Instant Relay' }
  ];

  return (
    <div className="pb-24 bg-white animate-in fade-in duration-1000">
      {/* Institutional Header */}
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center rounded-[48px] md:rounded-[64px] mx-2 md:mx-4 mt-4">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover grayscale" alt="Institutional HQ" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <Globe className="w-4 h-4" /> The Sovereign Trade Protocol
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 leading-tight tracking-tighter">
            Architecting <br />
            <span className="text-emerald-500">Global Liquidity.</span>
          </h1>
          <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Trazot is the definitive infrastructure for high-net-worth asset transmission, cross-border logistics, and industrial representation in the Middle East and South Asia.
          </p>
        </div>
      </header>

      {/* Stats Pulse */}
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] shadow-4xl border border-gray-100 text-center group hover:border-emerald-500 transition-all">
               <div className="text-3xl md:text-4xl font-black text-emerald-950 mb-1 group-hover:scale-110 transition-transform">{stat.val}</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{stat.label}</div>
               <div className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision Pillars */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4 block">Institutional Framework</span>
              <h2 className="text-4xl md:text-6xl font-serif-italic text-emerald-950 leading-[1.1]">The Trazot <span className="text-emerald-600">Standard.</span></h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              Established as a high-fidelity data relay, Trazot has evolved into a comprehensive trade facilitator. We bridge the gap between regional inventory and global demand through a verified node network.
            </p>
            <div className="space-y-6">
               {[
                 { icon: <ShieldCheck />, title: 'Verification Ledger', desc: 'Every commercial entity undergoes 4-point credential auditing.' },
                 { icon: <Zap />, title: 'Instant Liquidity', desc: 'Proprietary matching algorithms connect assets to high-intent participants.' },
                 { icon: <Scale />, title: 'Jurisdictional Harmony', desc: 'Operating within the statutory frameworks of GCC and South Asian corridors.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                       <h4 className="font-bold text-emerald-950 text-lg mb-1">{item.title}</h4>
                       <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-600 rounded-[64px] rotate-3 opacity-10" />
             <img 
               src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
               className="relative z-10 rounded-[64px] shadow-4xl grayscale hover:grayscale-0 transition-all duration-1000 aspect-square object-cover" 
               alt="Global Operations" 
             />
             <div className="absolute -bottom-10 -left-10 bg-emerald-950 p-10 rounded-[40px] text-white z-20 shadow-4xl hidden md:block">
                <TrendingUp className="w-10 h-10 text-emerald-500 mb-4" />
                <div className="text-2xl font-black">+240%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">YoY Node Growth</div>
             </div>
          </div>
        </div>
      </section>

      {/* Core Operational Values */}
      <section className="bg-gray-50 py-32">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-serif-italic text-emerald-950">Regional <span className="text-emerald-500">Stewardship</span></h2>
               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">Defining the future of regional trade</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: 'Transparency', desc: 'Eliminating the "Information Asymmetry" in cross-border machinery and property trades.' },
                 { title: 'Efficiency', desc: 'Reducing asset-to-cash cycles by 40% through verified lead scoring.' },
                 { title: 'Integrity', desc: 'Zero-tolerance policy for fraudulent nodes, enforced by manual audits.' }
               ].map((v, i) => (
                 <div key={i} className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                    <h3 className="text-2xl font-bold text-emerald-950 mb-6">{v.title}</h3>
                    <p className="text-gray-500 leading-relaxed font-medium">{v.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
