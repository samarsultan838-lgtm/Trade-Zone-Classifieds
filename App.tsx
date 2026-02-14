import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Loader2, Minus, ChevronUp } from 'lucide-react';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import SearchPage from './pages/SearchPage.tsx';
import ListingDetail from './pages/ListingDetail.tsx';
import PostAd from './pages/PostAd.tsx';
import Workspace from './pages/Workspace.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import Auth from './pages/Auth.tsx';
import News from './pages/News.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';
import Privacy from './pages/Privacy.tsx';
import Terms from './pages/Terms.tsx';
import Safety from './pages/Safety.tsx';
import TrazotTools from './pages/TrazotTools.tsx';
import Advertise from './pages/Advertise.tsx';
import Homes from './pages/Homes.tsx';
import Messages from './pages/Messages.tsx';
import { GoogleGenAI } from "@google/genai";
import { storageService } from './services/storageService.ts';
import { Language, i18n } from './services/i18nService.ts';

const SEOManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const location = useLocation();
  const t = i18n.get(lang);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    const path = location.pathname;
    let title = "Trazot | Elite Marketplace for Premium Assets";
    let description = t.footerAbout;

    if (path === '/') {
      title = `Trazot | ${t.buySale}`;
    } else if (path.includes('/listing/')) {
      const id = path.split('/').pop();
      const listing = storageService.getListings().find(l => l.id === id);
      if (listing) {
        title = `Buy ${listing.title} for ${listing.currency} ${listing.price.toLocaleString()} | Trazot`;
        description = `View details of ${listing.title} in ${listing.location.city}. Verified seller on Trazot Premium Classifieds.`;
      }
    } else if (path === '/homes') {
      title = `${t.premiumHomes} | Trazot Real Estate Hub`;
    } else if (path === '/news') {
      title = `${t.marketIntel} | Trazot Intelligence Network`;
    }

    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [location.pathname, lang, t]);

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  return null;
};

const AIChatbot: React.FC<{ lang: Language, isOpen: boolean, onClose: () => void }> = ({ lang, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const t = i18n.get(lang);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Welcome to Trazot. I'm your AI Assistant. How can I help you find premium assets or list your property today?" }
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
        config: {
          systemInstruction: "You are Trazot AI, a professional assistant for a premium marketplace. Be helpful, professional, and concise.",
        }
      });
      
      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please check your network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[100] w-[350px] sm:w-[400px] bg-white rounded-[32px] shadow-4xl border border-emerald-100 flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300 transition-all ${
        isMinimized ? 'h-[80px]' : 'h-[550px]'
      }`}
    >
      <div 
        className="bg-emerald-950 p-6 flex items-center justify-between cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Trazot AI</h3>
            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-white/40 hover:text-white transition-colors p-1"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl text-white/60 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-white/5"
          >
            <X className="w-3 h-3" />
            <span>Close Chat</span>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white text-emerald-950 border border-emerald-50 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-5 py-3.5 rounded-[24px] rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-gray-50 rounded-xl px-5 py-3.5 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button onClick={handleSend} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode; lang: Language; onLangChange: (l: Language) => void }> = ({ children, lang, onLangChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#ffffff]" dir={i18n.isRTL(lang) ? 'rtl' : 'ltr'}>
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        currentLang={lang} 
        onLanguageChange={onLangChange} 
        onOpenChat={() => setChatOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            {children}
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

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('tz_lang', newLang);
  };

  return (
    <Router>
      <SEOManager lang={lang} />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin-access-portal" element={<AdminPanel />} />
        
        <Route path="*" element={
          <Layout lang={lang} onLangChange={handleLangChange}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/homes" element={<Homes />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/post-ad" element={<PostAd />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/tools" element={<TrazotTools />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;