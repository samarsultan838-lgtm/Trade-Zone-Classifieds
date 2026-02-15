
import React, { useState } from 'react';
import { Search, User, Menu, Globe, ChevronDown, Check, Phone, Sparkles, Radio, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Language } from '../services/i18nService';

interface Props {
  onToggleSidebar: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenChat: () => void;
  syncStatus?: 'syncing' | 'synced' | 'local' | 'error';
}

const Navbar: React.FC<Props> = ({ onToggleSidebar, currentLang, onLanguageChange, onOpenChat, syncStatus = 'synced' }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
    { code: 'ur' as Language, label: 'اردو', flag: '🇵🇰' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3" aria-label="Main Navigation">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 hover:bg-gray-50 rounded-xl text-emerald-950 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-3" aria-label="Trazot Home">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20" aria-hidden="true">
               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-950 tracking-tighter">
              Trazot
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-gray-50 rounded-full border border-gray-100" role="status" aria-live="polite">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 
              syncStatus === 'synced' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
              syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-900/40">
              {syncStatus === 'syncing' ? 'Syncing Node...' : 
               syncStatus === 'synced' ? 'Global Node Active' : 
               syncStatus === 'error' ? 'Connection Error' : 'Offline Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/contact" 
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Contact Us
          </Link>

          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Select Language"
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-all border border-gray-100"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950 hidden sm:block">
                {languages.find(l => l.code === currentLang)?.label}
              </span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <ul className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-3xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200" role="listbox">
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors"
                      role="option"
                      aria-selected={currentLang === lang.code}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg" aria-hidden="true">{lang.flag}</span>
                        <span className={`text-xs font-bold ${currentLang === lang.code ? 'text-emerald-600' : 'text-gray-600'}`}>
                          {lang.label}
                        </span>
                      </div>
                      {currentLang === lang.code && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={onOpenChat}
            aria-label="Open AI Assistant"
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 hidden sm:block">
              Assistant
            </span>
          </button>

          <Link to="/search" className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" aria-label="Search Listings">
            <Search className="w-5 h-5" />
          </Link>
          
          <Link to="/auth" className="hidden sm:flex items-center gap-2 bg-emerald-950 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-900 transition-all shadow-xl shadow-black/10">
            <User className="w-4 h-4" />
            <span>Join Protocol</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
