
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Globe, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Award,
  Crown,
  X,
  Building2,
  Settings,
  Ship,
  Briefcase,
  Flame,
  Star,
  Clock,
  HardHat,
  Container,
  Warehouse,
  LineChart
} from 'lucide-react';

const Advertise: React.FC = () => {
  const [showInquiry, setShowInquiry] = useState(false);

  const packages = [
    {
      name: "STARTER",
      price: 1500,
      originalPrice: 5000,
      currency: "PKR",
      classification: "Individual Merchant",
      features: [
        "10 Standard Credits",
        "Asset Verification Badge",
        "Basic Search Visibility",
        "Community Support Node",
        "Standard Analytics"
      ],
      color: "bg-white",
      accent: "text-emerald-950",
      badge: "Standard",
      icon: <Star className="w-5 h-5" />
    },
    {
      name: "PROFESSIONAL",
      price: 4500,
      originalPrice: 15000,
      currency: "PKR",
      classification: "Verified Agency",
      features: [
        "40 High-Yield Credits",
        "Priority Search Ranking",
        "Verified Professional Badge",
        "Direct WhatsApp Relay",
        "Advanced Market Intel"
      ],
      color: "bg-gray-50",
      accent: "text-gray-900",
      isPopular: true,
      badge: "Market Choice",
      icon: <Flame className="w-5 h-5" />
    },
    {
      name: "ELITE PROJECT",
      price: 12000,
      originalPrice: 40000,
      currency: "PKR",
      classification: "Real Estate Developer",
      features: [
        "120 VIP Credits",
        "Project Launchpad Access",
        "Homepage Hero Placement",
        "360° Technical Support",
        "Lead Generation Engine"
      ],
      color: "bg-emerald-950",
      accent: "text-white",
      badge: "Institutional",
      icon: <Crown className="w-5 h-5" />
    },
    {
      name: "INDUSTRIAL",
      price: 25000,
      originalPrice: 75000,
      currency: "PKR",
      classification: "Machinery Supplier",
      features: [
        "Unlimited Asset Transmissions",
        "Dedicated Sales Office Page",
        "Regional Representation Node",
        "B2B Concierge Support",
        "Custom Trade Pipelines"
      ],
      color: "bg-white",
      accent: "text-emerald-950",
      badge: "Global Supplier",
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="pb-24 bg-white">
      {/* Dynamic Hero Section */}
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center rounded-[40px] md:rounded-[64px] mx-2 md:mx-4 mt-4">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="Architecture" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <LineChart className="w-4 h-4" /> B2B Growth Protocol
          </div>
          <h1 className="text-4xl md:text-8xl font-serif-italic text-white mb-8 leading-tight">Scale Your <span className="text-emerald-500">Commercial Output.</span></h1>
          <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            From industrial machinery representation to real estate project marketing, Trazot provides the infrastructure for high-fidelity business expansion.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        
        {/* Core Operational Pillar Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {[
            { 
              icon: <HardHat className="w-7 h-7" />, 
              title: "Construction Hub", 
              desc: "Complete inventory marketing for new residential & commercial projects. Sell units faster with our Project Launchpad.",
              label: "Real Estate Projects"
            },
            { 
              icon: <Container className="w-7 h-7" />, 
              title: "Import / Export", 
              desc: "Strategic logistics representation for international clients. Secure node-to-node asset movement across GCC/PK.",
              label: "Logistics Relay"
            },
            { 
              icon: <Building2 className="w-7 h-7" />, 
              title: "Franchise Gateway", 
              desc: "Establishing international business footprints in Pakistan. Full site acquisition and local licensing support.",
              label: "Business Expansion"
            },
            { 
              icon: <Settings className="w-7 h-7" />, 
              title: "Machinery Hub", 
              desc: "Authorized regional sales office for international heavy equipment suppliers. Direct technical leads and audits.",
              label: "Industrial Supply"
            }
          ].map((pillar, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] shadow-3xl border border-gray-100 group hover:border-emerald-500 transition-all">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 {pillar.icon}
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2 block">{pillar.label}</span>
               <h3 className="text-xl font-bold text-emerald-950 mb-3">{pillar.title}</h3>
               <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{pillar.desc}</p>
               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-900 group-hover:gap-4 transition-all">
                 Inquire <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          ))}
        </section>

        {/* Pricing Architecture */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-4 block">Commercial Investment Tiers</span>
          <h2 className="text-4xl md:text-6xl font-serif-italic text-emerald-950">B2B <span className="text-emerald-500">Plan Architecture</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {packages.map((pkg, i) => (
            <div key={i} className={`relative flex flex-col p-8 rounded-[40px] border transition-all duration-500 hover:-translate-y-2 ${
              pkg.isPopular ? 'border-emerald-500 shadow-2xl scale-[1.05] z-10' : 'border-gray-100 shadow-xl'
            } ${pkg.color} ${pkg.accent}`}>
              
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pkg.isPopular ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-emerald-600'}`}>
                  {pkg.icon}
                </div>
                <div className="text-right">
                  <span className={`block text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 ${
                    pkg.isPopular ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {pkg.badge}
                  </span>
                  <span className="block text-[7px] font-black uppercase text-gray-400">{pkg.classification}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight">{pkg.name}</h3>
                <div className="flex items-center gap-1.5 opacity-60 mt-1">
                  <Clock className="w-3 h-3" />
                  <p className="text-[9px] font-black uppercase tracking-widest">30 Day Protocol Cycle</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-black">{pkg.currency} {pkg.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold line-through opacity-40">{pkg.currency} {pkg.originalPrice.toLocaleString()}</span>
                  <div className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase">Launch Promo</div>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {pkg.features.map((feat, fi) => (
                  <div key={fi} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className="text-[11px] font-bold leading-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 ${
                pkg.isPopular ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-white text-emerald-950 hover:bg-gray-50 border border-gray-100'
              }`}>
                Activate Plan
              </button>
            </div>
          ))}
        </div>

        {/* Industrial Sales Office Showcase */}
        <section className="bg-emerald-950 rounded-[64px] p-12 md:p-24 relative overflow-hidden text-center md:text-left">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full" />
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-emerald-400 text-[9px] font-black uppercase border border-white/10 mb-8">
                   <Settings className="w-4 h-4" /> Global OEM Relay
                 </div>
                 <h2 className="text-4xl md:text-6xl font-serif-italic text-white mb-8">Industrial <span className="text-emerald-500">Sales Office</span></h2>
                 <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed mb-10">
                   International suppliers of heavy equipment, construction machinery, and industrial components can now leverage Trazot as their primary regional sales office in Pakistan and the GCC.
                 </p>
                 <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                    <div className="flex items-center gap-3">
                       <Warehouse className="text-emerald-500 w-5 h-5" />
                       <span className="text-[10px] font-black uppercase text-white tracking-widest">Inventory Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Target className="text-emerald-500 w-5 h-5" />
                       <span className="text-[10px] font-black uppercase text-white tracking-widest">Technical Sales Node</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Globe className="text-emerald-500 w-5 h-5" />
                       <span className="text-[10px] font-black uppercase text-white tracking-widest">Cross-Border Logistics</span>
                    </div>
                 </div>
              </div>
              <div className="w-full lg:w-auto">
                 <div className="bg-white rounded-[48px] p-10 md:p-16 shadow-4xl text-center">
                    <Briefcase className="w-12 h-12 text-emerald-600 mx-auto mb-8" />
                    <h4 className="text-2xl font-bold text-emerald-950 mb-4">Request OEM Status</h4>
                    <p className="text-gray-500 font-medium mb-10 text-sm">Submit your proposal for international supplier representation.</p>
                    <button 
                      onClick={() => setShowInquiry(true)}
                      className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
                    >
                      Initialize B2B Inquiry
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Analytics & Transparency */}
        <section className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
           {[
             { val: "3.1M+", label: "Regional Reach" },
             { val: "22k+", label: "Qualified Project Leads" },
             { val: "120+", label: "Global Suppliers" },
             { val: "97%", label: "Satisfaction Rate" }
           ].map((stat, i) => (
             <div key={i} className="space-y-2">
                <div className="text-3xl md:text-5xl font-black text-emerald-950">{stat.val}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
             </div>
           ))}
        </section>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 z-[200] bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full relative animate-in zoom-in-95">
              <button onClick={() => setShowInquiry(false)} className="absolute top-8 right-8 text-gray-400 hover:text-emerald-950 transition-all">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-3xl font-serif-italic text-emerald-950 mb-4">Corporate Inquiry</h3>
              <p className="text-gray-500 font-medium mb-8 text-sm">Our institutional team will review your project or supply requirements.</p>
              
              <form className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Company / Legal Name</label>
                    <input type="text" className="w-full bg-gray-50 rounded-2xl p-5 font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Corporate Email</label>
                    <input type="email" className="w-full bg-gray-50 rounded-2xl p-5 font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Service Segment</label>
                    <select className="w-full bg-gray-50 rounded-2xl p-5 font-bold outline-none border border-transparent focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                       <option>Construction / Real Estate Project Marketing</option>
                       <option>Import & Export Clients</option>
                       <option>International Franchise Expansion</option>
                       <option>Machinery Sales Office Representation</option>
                    </select>
                 </div>
                 <button className="w-full bg-emerald-950 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/20 hover:bg-black transition-all">
                    Transmit Request
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Advertise;
