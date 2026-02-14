
import React, { useState } from 'react';
import { Search, User, Menu, Globe, ChevronDown, Check, Phone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Language } from '../services/i18nService';

interface Props {
  onToggleSidebar: () => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenChat: () => void;
}

const Navbar: React.FC<Props> = ({ onToggleSidebar, currentLang, onLanguageChange, onOpenChat }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
    { code: 'ur' as Language, label: 'اردو', flag: '🇵🇰' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-50 rounded-xl text-emerald-950 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-950 tracking-tighter">
              Trazot
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            to="/contact" 
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Contact Us
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-all border border-gray-100"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950 hidden sm:block">
                {languages.find(l => l.code === currentLang)?.label}
              </span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-3xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span className={`text-xs font-bold ${currentLang === lang.code ? 'text-emerald-600' : 'text-gray-600'}`}>
                        {lang.label}
                      </span>
                    </div>
                    {currentLang === lang.code && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900 hidden sm:block">
              Assistant
            </span>
          </button>

          <div className="h-6 w-[1px] bg-gray-100 hidden sm:block" />

          <Link to="/search" className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <Search className="w-5 h-5" />
          </Link>
          
          <Link to="/auth" className="hidden sm:flex items-center gap-2 bg-emerald-950 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-900 transition-all shadow-xl shadow-black/10">
            <User className="w-4 h-4" />
            <span>Join Protocol</span>
          </Link>
          
          <Link to="/auth" className="sm:hidden p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
