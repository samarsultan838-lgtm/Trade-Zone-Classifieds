import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck, Smartphone, Copy, Check, Globe, HelpCircle } from 'lucide-react';

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
    // Simulate transmission protocol
    setSubmitted(true);
    console.log('Inquiry Transmitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pb-24">
      {/* Cinematic Header */}
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" alt="Contact background" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-950/60 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <HelpCircle className="w-4 h-4" /> Global Concierge
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-8 tracking-tight">Connect with <span className="text-emerald-500">Trazot</span></h1>
          <p className="text-emerald-100/60 text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Elite assistance for high-fidelity asset trades. Our regional agents are ready to facilitate your next transaction.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-3xl border border-gray-100">
              {submitted ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-600/10">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl font-serif-italic text-emerald-950 mb-4">Transmission Success</h2>
                  <p className="text-gray-500 text-lg max-w-sm mx-auto font-medium">Your inquiry has been registered. An official representative will contact you within 2 business hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-12 text-emerald-600 font-black uppercase tracking-widest text-xs border-b-2 border-emerald-600/20 pb-1 hover:border-emerald-600 transition-all">Submit Another Query</button>
                </div>
              ) : (
                <>
                  <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950 mb-4">Initialize Inquiry</h2>
                    <p className="text-gray-400 font-medium">Please provide precise details for accurate routing to our regional specialists.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Legal Name</label>
                        <input 
                          required 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <input 
                          required 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@company.com"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone</label>
                        <input 
                          required 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+92 XXX XXXXXXX"
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Inquiry Subject</label>
                        <select 
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          <option>Asset Verification Query</option>
                          <option>Premium Membership Inquiry</option>
                          <option>Corporate Partnership</option>
                          <option>Technical Support</option>
                          <option>Payment & Ad Credits</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Message</label>
                      <textarea 
                        required 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6} 
                        className="w-full bg-gray-50 border-2 border-transparent rounded-[32px] p-8 font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner leading-relaxed" 
                        placeholder="Describe your inquiry in detail, including listing IDs if applicable..."
                      />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-[24px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all active:scale-[0.98]">
                      <Send className="w-5 h-5" /> Transmit Inquiry Protocol
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Primary Contact Hub */}
            <div className="bg-emerald-950 text-white rounded-[48px] p-10 shadow-3xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Verified Partner: BigBossTrader</span>
                </div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Globe className="w-6 h-6 text-emerald-400" /> Official Channels
                </h3>
              </div>
              
              <div className="space-y-10">
                <div className="group cursor-pointer" onClick={() => handleCopy('info@trazot.com')}>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Central Intelligence Email</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Mail className="w-5 h-5 text-white/40" />
                      <p className="text-lg font-bold group-hover:text-emerald-400 transition-colors">info@trazot.com</p>
                    </div>
                    <Copy className="w-4 h-4 text-white/20 group-hover:text-white" />
                  </div>
                </div>

                <div className="group cursor-pointer" onClick={() => handleCopy('+92 300 1887808')}>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Verified Hotline</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-white/40" />
                      <p className="text-lg font-bold group-hover:text-emerald-400 transition-colors">+92 300 1887808</p>
                    </div>
                    <Copy className="w-4 h-4 text-white/20 group-hover:text-white" />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Regional Headquarters</div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-white/20 mt-1" />
                      <div>
                        <p className="font-bold text-sm">Dubai Central Hub</p>
                        <p className="text-xs text-white/50 font-medium">Sheikh Zayed Rd, Downtown Dubai, UAE</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-white/20 mt-1" />
                      <div>
                        <p className="font-bold text-sm">Riyadh Settlement Node</p>
                        <p className="text-xs text-white/50 font-medium">Al Olaya District, King Fahad Rd, KSA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Banner */}
            <div className="bg-white rounded-[40px] p-8 border border-emerald-100 shadow-xl overflow-hidden group">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:rotate-12 transition-transform">
                     <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950">Security Protocol</h4>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Verified Communication</p>
                  </div>
               </div>
               <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                 All official correspondence from Trazot is sent exclusively from the <span className="text-emerald-950 font-bold">@trazot.com</span> domain. 
               </p>
               <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Response</span>
                  <span className="text-sm font-black text-emerald-950">94 Minutes</span>
               </div>
            </div>

            {/* Service Status */}
            <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 shadow-sm">
              <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Operational Hours
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-800/60 font-medium">Mon - Fri</span>
                  <span className="font-black text-emerald-950">09:00 - 21:00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-800/60 font-medium">Saturday</span>
                  <span className="font-black text-emerald-950">10:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-800/60 font-medium">Sunday</span>
                  <span className="font-black text-emerald-600">VIP Priority</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;