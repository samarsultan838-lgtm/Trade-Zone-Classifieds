import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { X, Send, Sparkles, Loader2, Minus, ChevronUp, AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { GoogleGenAI } from "@google/genai";
import { storageService } from './services/storageService';
import { locationService } from './services/locationService';
import { Language, i18n } from './services/i18nService';
import { MARKET_KEYWORDS } from './constants';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const PostAd = lazy(() => import('./pages/PostAd'));
const Workspace = lazy(() => import('./pages/Workspace'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Auth = lazy(() => import('./pages/Auth'));
const News = lazy(() => import('./pages/News'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Safety = lazy(() => import('./pages/Safety'));
const TrazotTools = lazy(() => import('./pages/TrazotTools'));
const Advertise = lazy(() => import('./pages/Advertise'));
const Homes = lazy(() => import('./pages/Homes'));
const Messages = lazy(() => import('./pages/Messages'));
const Services = lazy(() => import('./pages/Services'));
const VerifiedDealers = lazy(() => import('./pages/VerifiedDealers'));
const Projects = lazy(() => import('./pages/Projects'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/40">Synchronizing Global Node...</span>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
    <AlertCircle className="w-20 h-20 text-emerald-950 mb-6 opacity-20" />
    <h1 className="text-4xl font-serif-italic text-emerald-950 mb-4">Route Disconnected</h1>
    <p className="text-gray-500 mb-8 max-w-md">The requested technical node could not be located in the current Trazot directory.</p>
    <Link to="/" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-700 transition-all">Reconnect to Home</Link>
  </div>
);

const SEOManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const location = useLocation();
  const t = i18n.get(lang);
  const userCountry = locationService.detectUserCountry();

  useEffect(() => {
    const path = location.pathname;
    const keywords = MARKET_KEYWORDS[userCountry] || MARKET_KEYWORDS['Pakistan'];
    const keywordStr = [...(keywords?.motors || []), ...(keywords?.property || [])].slice(0, 5).join(', ');
    
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
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scrollbar-hide">
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
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white" dir={i18n.isRTL(lang) ? 'rtl' : 'ltr'}>
      <Navbar onToggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)} currentLang={lang} onLanguageChange={onLangChange} onOpenChat={() => setChatOpen(true)} syncStatus={syncStatus} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarIsOpen} onClose={() => setSidebarIsOpen(false)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-hide">
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

  // HEARTBEAT PROTOCOL: Real check for Hostinger Connection with race condition fix
  useEffect(() => {
    let mounted = true;
    storageService.startBackgroundSync();
    
    const checkHealth = async () => {
      try {
        const health = await storageService.getBackendHealth();
        if (!mounted) return;
        
        if (health.status.includes('Active')) {
          setSyncStatus('synced');
        } else if (health.status.includes('Offline')) {
          setSyncStatus('error');
        } else {
          setSyncStatus('local');
        }
      } catch (e) {
        if (mounted) setSyncStatus('error');
      }
    };

    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, 30000); // Pulse every 30s
    
    return () => {
      mounted = false;
      storageService.stopBackgroundSync();
      clearInterval(interval);
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/homes" element={<Homes />} />
              <Route path="/promotions" element={<Projects />} />
              <Route path="/dealers" element={<VerifiedDealers />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>} />
      </Routes>
    </Router>
  );
};

export default App;