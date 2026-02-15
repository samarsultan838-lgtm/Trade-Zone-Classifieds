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
  Container, 
  HardHat, 
  Settings 
} from 'lucide-react';
import { Language, i18n } from '../services/i18nService';

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = i18n.get(lang);

  const sections = [
    {
      title: t.footerLinks,
      links: [
        { label: 'Intelligence Network', to: '/news' },
        { label: 'Institutional Services', to: '/services' },
        { label: 'Ad Protocols', to: '/advertise' },
        { label: 'Trazot Tools', to: '/tools' },
        { label: 'Our Vision', to: '/about' }
      ]
    },
    {
      title: t.footerCategories,
      links: [
        { label: 'Construction Projects', to: '/services' },
        { label: 'Industrial Machinery', to: '/services' },
        { label: 'Luxury Vehicles', to: '/search?category=Vehicles' },
        { label: 'Import/Export Hub', to: '/services' },
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
    <footer className="bg-emerald-950 pt-12 pb-8 px-6 relative overflow-hidden border-t border-white/5">
      {/* Immersive Background Visuals - Adjusted for better blending */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[140px] opacity-[0.06] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[120px] opacity-[0.04] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-10">
          
          {/* Brand Identity & Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 group-hover:scale-105 transition-all duration-500">
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="block text-xl font-black text-white tracking-tighter leading-none">Trazot</span>
                <span className="block text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500 mt-1">Global Hub</span>
              </div>
            </Link>
            
            <p className="text-emerald-100/40 text-sm font-medium leading-relaxed max-w-sm">
              {t.footerAbout}
            </p>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Newsletter Protocol</h4>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl max-w-md backdrop-blur-sm group focus-within:border-emerald-500/50 transition-all shadow-inner">
                <input 
                  type="email" 
                  placeholder="Enter secure email..." 
                  className="bg-transparent border-none outline-none px-4 py-2 flex-1 text-white text-xs font-medium placeholder:text-white/20"
                />
                <button className="bg-emerald-600 text-white px-5 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500 transition-all">
                  Join
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {[Instagram, Twitter, Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-9 h-9 bg-white/5 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-all border border-white/5 hover:border-emerald-500/50"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sections.map((section, i) => (
              <div key={i} className="space-y-5">
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-400 border-b border-white/5 pb-2">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <Link to={link.to} className="text-emerald-100/30 hover:text-white transition-all text-[12px] font-bold flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all" />
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Service Grid - Tightened */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-6 border-y border-white/5">
           {[
             { icon: Container, title: 'Trade Relay', desc: 'Import & Export', color: 'text-emerald-400' },
             { icon: HardHat, title: 'Project Node', desc: 'Real Estate Projects', color: 'text-blue-400' },
             { icon: Settings, title: 'Machinery Sales', desc: 'Industrial Supply', color: 'text-yellow-400' },
             { icon: ShieldCheck, title: 'Institutional', desc: 'Franchise Partner', color: 'text-purple-400' }
           ].map((item, i) => (
             <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/[0.07] transition-all cursor-default group">
                <div className={`w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shrink-0`}>
                   <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[8px] font-black uppercase tracking-widest ${item.color} mb-0.5 truncate`}>{item.title}</p>
                  <p className="text-[10px] font-bold text-white/50 truncate leading-tight">{item.desc}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Global Contact & Support Nodes - Compressed */}
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/5">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500">
                <Phone className="w-4 h-4 opacity-50" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400/60">Regional Hotline</span>
                <p className="text-base font-bold text-white tracking-tight">+92 300 1887808</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500">
                <Mail className="w-4 h-4 opacity-50" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400/60">Trade Channel</span>
                <p className="text-base font-bold text-white tracking-tight">info@trazot.com</p>
              </div>
           </div>
           <div className="flex flex-col md:items-end justify-center">
              <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-white px-5 py-3 bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95">
                B2B Live Support <ExternalLink className="w-3 h-3" />
              </Link>
           </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 text-center md:text-left">
              © 2024 Trazot Intelligence Network. {t.allRights}.
            </p>
            <div className="hidden md:block h-1 w-1 rounded-full bg-white/10" />
            <div className="flex gap-4">
              <Link to="/terms" className="text-[8px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">Legal Portal</Link>
              <Link to="/privacy" className="text-[8px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest">Privacy Protocol</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6 opacity-60">
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em]">
                <Globe className="w-2.5 h-2.5" /> Regional Node
              </span>
              <span className="text-[7px] font-bold text-white/30 uppercase tracking-tighter">Pakistan & GCC Hub</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;