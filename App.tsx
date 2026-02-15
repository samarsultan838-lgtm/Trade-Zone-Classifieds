import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { X, Send, Sparkles, Loader2, Minus, ChevronUp, Radio } from 'lucide-react';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Footer from './components/Footer.tsx';
import { GoogleGenAI } from "@google/genai";
import { storageService } from './services/storageService.ts';
import { locationService } from './services/locationService.ts';
import { Language, i18n } from './services/i18nService.ts';
import { MARKET_KEYWORDS } from './constants.ts';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home.tsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.tsx'));
const ListingDetail = lazy(() => import('./pages/ListingDetail.tsx'));
const PostAd = lazy(() => import('./pages/PostAd.tsx'));
const Workspace = lazy(() => import('./pages/Workspace.tsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.tsx'));
const Auth = lazy(() => import('./pages/Auth.tsx'));
const News = lazy(() => import('./pages/News.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const Privacy = lazy(() => import('./pages/Privacy.tsx'));
const Terms = lazy(() => import('./pages/Terms.tsx'));
const Safety = lazy(() => import('./pages/Safety.tsx'));
const TrazotTools = lazy(() => import('./pages/TrazotTools.tsx'));
const Advertise = lazy(() => import('./pages/Advertise.tsx'));
const Homes = lazy(() => import('./pages/Homes.tsx'));
const Messages = lazy(() => import('./pages/Messages.tsx'));
const Services = lazy(() => import('./pages/Services.tsx'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/40">Synchronizing Global Node...</span>
  </div>
);

const SEOManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const location = useLocation();
  const t = i18n.get(lang);
  const prevPathname = useRef(location.pathname);
  const userCountry = locationService.detectUserCountry();

  useEffect(() => {
    const path = location.pathname;
    const keywords = MARKET_KEYWORDS[userCountry] || MARKET_KEYWORDS['Pakistan'];
    const keywordStr = [...keywords.motors, ...keywords.property].slice(0, 5).join(', ');
    
    let title = `Trazot | Elite Marketplace - ${userCountry}`;
    let description = `${t.footerAbout} Trending: ${keywordStr}`;

    if (path === '/') {
      title = `Trazot | ${t.buySale} in ${userCountry}`;
    } else if (path.includes('/listing/')) {
      const id = path.split('/').pop();
      const listing = storageService.getListings().find(l => l.id === id);
      if (listing) {
        title = `Buy ${listing.title} for ${listing.currency} ${listing.price.toLocaleString()} | Trazot`;
        description = `View details of ${listing.title} in ${listing.location.city}. Professional seller on Trazot.`;
      }
    }

    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);
  }, [location.pathname, lang, t, userCountry]);

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      window.scrollTo(0, 0);
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
};

const AIChatbot: React.FC<{ lang: Language, isOpen: boolean, onClose: () => void }> = ({ lang, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Welcome to Trazot. I'm your AI Assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { systemInstruction: "Concise assistant for Trazot Marketplace. Help with finding cars, property and tech." }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[100] w-[350px] bg-white rounded-[32px] shadow-4xl border border-emerald-100 flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300 ${isMinimized ? 'h-[80px]' : 'h-[550px]'}`}>
      <div className="bg-emerald-950 p-6 flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-bold text-sm">Trazot AI</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-white/40 hover:text-white p-1">
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-[24px] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-emerald-950 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />}
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input type="text" placeholder="Ask anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-gray-50 rounded-xl px-5 py-3 outline-none text-sm" />
            <button onClick={handleSend} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><Send className="w-5 h-5" /></button>
          </div>
        </>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode; lang: Language; onLangChange: (l: Language) => void; syncStatus: 'syncing' | 'synced' | 'local' | 'error' }> = ({ children, lang, onLangChange, syncStatus }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white" dir={i18n.isRTL(lang) ? 'rtl' : 'ltr'}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} currentLang={lang} onLanguageChange={onLangChange} onOpenChat={() => setChatOpen(true)} syncStatus={syncStatus} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </div>
          <Footer lang={lang} />
          <AIChatbot lang={lang} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>((localStorage.getItem('tz_lang') as Language) || 'en');
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'local' | 'error'>('syncing');

  useEffect(() => {
    // RESOLUTION: Start Background Sync Engine
    storageService.startBackgroundSync();
    
    // Listen for storage events to update sync status bar
    const handleStorageUpdate = () => {
      // Small delay to let local data settle
      setTimeout(() => setSyncStatus('synced'), 500);
    };
    
    window.addEventListener('storage', handleStorageUpdate);
    
    return () => {
      storageService.stopBackgroundSync();
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleLangChange = (newLang: Language) => { setLang(newLang); localStorage.setItem('tz_lang', newLang); };
  
  return (
    <Router>
      <SEOManager lang={lang} />
      <Routes>
        <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
        <Route path="/admin-access-portal" element={<Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>} />
        <Route path="*" element={<Layout lang={lang} onLangChange={handleLangChange} syncStatus={syncStatus}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/homes" element={<Homes />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/news" element={<News />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/tools" element={<TrazotTools />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </Layout>} />
      </Routes>
    </Router>
  );
};

export default App;