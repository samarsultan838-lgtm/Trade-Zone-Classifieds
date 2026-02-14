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
  CheckCircle2
} from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pb-24 bg-white">
      <header className="bg-emerald-950 pt-24 pb-40 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover grayscale" alt="Institutional HQ" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <Globe className="w-4 h-4" /> Global Trade Node
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 leading-tight">Beyond a Marketplace: <br /><span className="text-emerald-500">A Trade Institution</span></h1>
          <p className="text-emerald-100/60 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Trazot is the definitive infrastructure for cross-border logistics, international franchise expansion, and heavy industrial representation.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <section className="bg-white rounded-[64px] p-10 md:p-24 shadow-3xl border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-serif-italic text-emerald-950 leading-tight">The Trazot <span className="text-emerald-600">Ecosystem</span></h2>
              <p className="text-gray-600 text-xl leading-relaxed font-light">
                Established in 2024, Trazot has evolved from an elite classifieds node into a comprehensive trade facilitator.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;