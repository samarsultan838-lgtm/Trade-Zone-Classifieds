import React from 'react';
import { 
  Globe, 
  Container, 
  Building2, 
  Settings, 
  HardHat, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Ship, 
  FileText, 
  Target, 
  Briefcase,
  Users,
  BarChart3,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ icon: Icon, title, label, desc, features, color }: any) => (
  <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-3xl border border-gray-100 group hover:border-emerald-500 transition-all duration-500 flex flex-col h-full">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon className="w-8 h-8" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 block">{label}</span>
    <h3 className="text-2xl md:text-3xl font-serif-italic text-emerald-950 mb-6 leading-tight">{title}</h3>
    <p className="text-gray-500 text-base font-medium leading-relaxed mb-8 flex-1">{desc}</p>
    
    <div className="space-y-4 mb-10">
      {features.map((f: string, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-emerald-950/70 uppercase tracking-tight">{f}</span>
        </div>
      ))}
    </div>

    <Link 
      to="/contact" 
      className="inline-flex items-center justify-center gap-3 bg-emerald-950 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-800 transition-all active:scale-95 group-hover:shadow-xl"
    >
      Request Technical Briefing <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
    </Link>
  </div>
);

const Services: React.FC = () => {
  return (
    <div className="pb-32 bg-white">
      {/* Institutional Header */}
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1454165833767-027508496b4c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="Institutional background" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-950/60 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 animate-in slide-in-from-top-4 duration-1000">
            <ShieldCheck className="w-4 h-4" /> Professional Ecosystem
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 tracking-tight leading-none">
            Institutional <span className="text-emerald-500">Solutions</span>
          </h1>
          <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Definitive infrastructure for cross-border asset movement, international expansion, and industrial representation across the Trazot node.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          {/* 1. Import / Export */}
          <ServiceCard 
            icon={Container}
            label="Logistics Relay"
            title="Global Import & Export Protocols"
            desc="Establishing high-fidelity shipping corridors between GCC hubs and South Asian markets. We handle the technical relay of heavy equipment, construction materials, and luxury vehicles."
            color="bg-blue-50 text-blue-600"
            features={[
              "Node-to-Node Freight Tracking",
              "Customs Clearance Liaison",
              "Regional Warehousing Access",
              "Industrial Asset Insurance"
            ]}
          />

          {/* 2. Franchise Service */}
          <ServiceCard 
            icon={Building2}
            label="Business Gateway"
            title="International Franchise Expansion"
            desc="Comprehensive support for global brands entering Pakistan and the Gulf. From site acquisition in premium districts to navigating local regulatory frameworks."
            color="bg-purple-50 text-purple-600"
            features={[
              "Strategic Site Acquisition",
              "Local License Facilitation",
              "Market Entry Intelligence",
              "Merchant Network Integration"
            ]}
          />

          {/* 3. Sales Office */}
          <ServiceCard 
            icon={Settings}
            label="OEM Representation"
            title="Industrial Sales Office Node"
            desc="Operate a virtual or physical regional sales office through Trazot. We act as your primary technical lead generator for machinery and heavy industrial components."
            color="bg-orange-50 text-orange-600"
            features={[
              "Technical Lead Management",
              "Showroom Placement",
              "Machinery Audit Support",
              "B2B Concierge Relay"
            ]}
          />

          {/* 4. Construction Promotion */}
          <ServiceCard 
            icon={HardHat}
            label="Real Estate Growth"
            title="Construction & Project Launchpad"
            desc="Elite marketing infrastructure for new residential and commercial developments. Scale your unit sales with targeted lead generation and institutional-grade property showcases."
            color="bg-emerald-50 text-emerald-600"
            features={[
              "Full-Cycle Project Marketing",
              "High-Net-Worth Lead Funnels",
              "3D Asset Visualization Nodes",
              "Phase-Wise Sales Tracking"
            ]}
          />

        </div>

        {/* Global Partnership Section */}
        <section className="bg-emerald-950 rounded-[64px] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Globe className="w-4 h-4" /> Worldwide Network
              </div>
              <h2 className="text-4xl md:text-6xl font-serif-italic text-white">Scale Beyond <br /><span className="text-emerald-500">Boundaries.</span></h2>
              <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed">
                Trazot isn't just a classifieds node; it's a trade institution. We provide the technical and operational backbone for businesses looking to dominate regional trade corridors.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                  <div className="text-2xl font-black text-white">GCC</div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">Primary Hub</div>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                  <div className="text-2xl font-black text-white">South Asia</div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase">Growth Node</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-[48px] p-10 md:p-12 shadow-4xl text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                 <PhoneCall className="w-12 h-12 text-emerald-600 mx-auto mb-8 group-hover:animate-bounce" />
                 <h4 className="text-2xl font-bold text-emerald-950 mb-4">VIP Desk</h4>
                 <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">Connect with an Institutional Relationship Manager for a custom service contract.</p>
                 <Link 
                   to="/contact" 
                   className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                 >
                   Establish Connection
                 </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Statistics */}
        <section className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
           {[
             { val: "120+", label: "International OEMS" },
             { val: "450M", label: "Monthly Relay Value" },
             { val: "14", label: "Regional Gateways" },
             { val: "Elite", label: "Service Grade" }
           ].map((stat, i) => (
             <div key={i} className="space-y-2">
                <div className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter">{stat.val}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
             </div>
           ))}
        </section>
      </div>
    </div>
  );
};

export default Services;