
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Map,
  CreditCard,
  Container,
  HardHat,
  Settings,
  Terminal
} from 'lucide-react';
import { Language, i18n } from '../services/i18nService';

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = i18n.get(lang);

  const sections = [
    {
      title: t.footerLinks,
      links: [
        { label: 'Intelligence Network', to: '/news' },
        { label: 'Premium Homes', to: '/homes' },
        { label: 'Ad Protocols', to: '/advertise' },
        { label: 'Trazot Tools', to: '/tools' },
        { label: 'Our Vision', to: '/about' }
      ]
    },
    {
      title: t.footerCategories,
      links: [
        { label: 'Construction Projects', to: '/search?category=Properties' },
        { label: 'Industrial Machinery', to: '/search?category=General Items' },
        { label: 'Luxury Vehicles', to: '/search?category=Vehicles' },
        { label: 'Import/Export Hub', to: '/about' },
        { label: 'Verified Listing', to: '/search?verified=true' }
      ]
    },
    {
      title: t.footerSupport,
      links: [
        { label: 'Help Center', to: '/contact' },
        { label: 'Safety Hub', to: '/safety' },
        { label: 'Merchant Terms', to: '/terms' },
        { label: 'Privacy Protocol', to: '/privacy' }
      ]
    }
  ];

  return (
    <footer className="bg-emerald-950 pt-16 pb-12 px-6 relative overflow-hidden">
      {/* Immersive Background Visuals */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[180px] opacity-[0.07] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[150px] opacity-[0.05] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          
          {/* Brand Identity & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <span className="block text-2xl font-black text-white tracking-tighter">Trazot</span>
                <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500">Global Hub</span>
              </div>
            </Link>
            
            <p className="text-emerald-100/40 text-base font-light leading-relaxed max-w-sm">
              {t.footerAbout}
            </p>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Newsletter Protocol</h4>
              <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-md backdrop-blur-sm group focus-within:border-emerald-500/50 transition-all">
                <input 
                  type="email" 
                  placeholder="Enter secure email..." 
                  className="bg-transparent border-none outline-none px-4 py-3 flex-1 text-white text-sm font-medium placeholder:text-white/20"
                />
                <button className="bg-emerald-600 text-white px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all">
                  Join
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 bg-white/5 hover:bg-emerald-600 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5 hover:border-emerald-500/50"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sections.map((section, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 border-b border-white/5 pb-3">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <Link to={link.to} className="text-emerald-100/40 hover:text-white transition-all text-[13px] font-bold flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all" />
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Service Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y border-white/5">
           {[
             { icon: Container, title: 'Trade Relay', desc: 'Import & Export Protocols', color: 'text-emerald-400' },
             { icon: HardHat, title: 'Project Node', desc: 'Construction & Real Estate', color: 'text-blue-400' },
             { icon: Settings, title: 'Machinery Sales', desc: 'Industrial Supply Office', color: 'text-yellow-400' },
             { icon: ShieldCheck, title: 'Institutional', desc: 'Verified Franchise Partner', color: 'text-purple-400' }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-all cursor-default group">
                <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shrink-0`}>
                   <item.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${item.color} mb-0.5 truncate`}>{item.title}</p>
                  <p className="text-[11px] font-bold text-white/60 truncate">{item.desc}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Global Contact & Support Nodes */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-white/5">
           <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Regional Hotline</span>
              <p className="text-lg font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 opacity-20" /> +92 300 1887808
              </p>
           </div>
           <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Trade Channel</span>
              <p className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-20" /> info@trazot.com
              </p>
           </div>
           <div className="flex flex-col md:items-end justify-center">
              <button className="text-xs font-black uppercase tracking-widest text-white px-6 py-3 bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                B2B Live Support <ExternalLink className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
              © 2024 Trazot Intelligence Network. {t.allRights}.
            </p>
            <div className="hidden md:block h-1 w-1 rounded-full bg-white/10" />
            <div className="flex gap-4">
              <Link to="/terms" className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">Legal Portal</Link>
              <Link to="/privacy" className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">Privacy Protocol</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 tracking-[0.2em]">
                <Globe className="w-3 h-3" /> Regional Node
              </span>
              <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Pakistan & GCC Hub</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
