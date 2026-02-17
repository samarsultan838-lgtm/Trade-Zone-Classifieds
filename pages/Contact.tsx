
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck, Smartphone, Copy, Check, Globe, HelpCircle, ChevronDown, Zap, Gem, ShieldAlert, Info, Search, ShieldQuestion, LifeBuoy } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-emerald-600' : 'text-emerald-950 group-hover:text-emerald-700'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-8' : 'max-h-0'}`}>
        <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
          {answer}
        </p>
      </div>
    </div>
  );
};

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: 'info@trazot.com',
    phone: '',
    subject: 'Asset Verification Query',
    message: ''
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const faqs = [
    {
      question: "How does the Asset Verification Protocol work?",
      answer: "Every high-value listing marked as 'Verified' undergoes a rigorous 4-point check: Document Hash Verification, Merchant Credential Audit, Physical Node Inspection, and AI-driven behavior analysis."
    },
    {
      question: "What are Trade Credits and how do I replenish them?",
      answer: "Trade Credits are internal units used for authorizing transmissions. Credits can be settled via USDT (BEP-20) or locally in Pakistan through EasyPaisa (0346290804). Provisioning occurs once confirmed."
    },
    {
      question: "How do I report a suspicious node or fraudulent listing?",
      answer: "Integrity is our primary metric. Utilize the 'Report Breach' button or establish a direct secure link via this form using the 'Technical Support' subject."
    }
  ];

  return (
    <div className="pb-24">
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center rounded-b-[64px]">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-950/60 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <HelpCircle className="w-4 h-4" /> Global Concierge Relay
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 tracking-tight">Connect with <span className="text-emerald-500">Trazot</span></h1>
          <p className="text-emerald-100/60 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Elite assistance for high-fidelity trades. Our regional agents are ready to facilitate your next high-value transaction.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-3xl border border-gray-100 h-full">
              {submitted ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
                  <h2 className="text-4xl font-serif-italic text-emerald-950 mb-4">Transmission Success</h2>
                  <p className="text-gray-500 text-lg">Your inquiry has been registered. We will contact you within 2 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-serif-italic text-emerald-950 mb-8">Initialize Inquiry</h2>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Legal Name" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <textarea required name="message" value={formData.message} onChange={handleChange} rows={6} className="w-full bg-gray-50 border-none rounded-[32px] p-8 font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" placeholder="Message details..." />
                    <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-[24px] font-black uppercase tracking-[0.3em] text-xs shadow-xl active:scale-98">Transmit Inquiry</button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-emerald-950 text-white rounded-[48px] p-10 shadow-3xl relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-3"><Globe className="w-6 h-6 text-emerald-400" /> Support Hub</h3>
              <div className="space-y-10">
                <div onClick={() => handleCopy('info@trazot.com')} className="cursor-pointer group">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">Email</span>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold group-hover:text-emerald-400">info@trazot.com</p>
                    <Copy className="w-4 h-4 text-white/20" />
                  </div>
                </div>
                <div onClick={() => handleCopy('0346290804')} className="cursor-pointer group">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">EasyPaisa Hub</span>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold group-hover:text-emerald-400">0346290804</p>
                    <Copy className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-4xl font-serif-italic text-emerald-950 mb-12 text-center">Frequently Asked</h2>
          <div className="max-w-3xl mx-auto bg-white rounded-[40px] p-8 border border-gray-50">
            {faqs.map((f, i) => <FAQItem key={i} question={f.question} answer={f.answer} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
