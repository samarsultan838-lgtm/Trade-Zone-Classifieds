import React from 'react';
import { ShieldCheck, Scale, FileText, AlertCircle, Globe, ChevronRight } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="pb-24 bg-white">
      {/* Cinematic Legal Header */}
      <header className="bg-emerald-950 pt-24 pb-32 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="Legal" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <Scale className="w-4 h-4" /> Global Governance
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-6">Legal <span className="text-emerald-500">Governance</span></h1>
          <p className="text-emerald-100/60 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Operational protocols governing asset transmission and participant conduct across the Trazot high-fidelity network.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-3xl border border-gray-100 space-y-16">
          
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">1. Node Participation Protocols</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              Access to the Trazot Node ("Platform") constitutes an unconditional acceptance of these Governance Protocols. Participants are expected to maintain professional integrity. Trazot acts exclusively as a high-fidelity information relay and does not hold title, interest, or fiduciary responsibility for assets listed by independent merchants.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">2. Jurisdictional Settlement & Compliance</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed font-medium">
                Asset transmission must align with the statutory frameworks of the region of origin:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block mb-2">GCC Hub (UAE/KSA)</span>
                  <p className="text-xs text-gray-500 font-bold">Strict adherence to DLD/RERA and REGA circulars. Merchant verification is mandatory for commercial entities.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block mb-2">South Asia Node</span>
                  <p className="text-xs text-gray-500 font-bold">Transactions must comply with regional taxation (FBR/GST) and digital commerce regulations.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">3. Commercial Transmission Credits</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              The Trazot ecosystem operates on a non-inflationary credit protocol. All visibility upgrades ("Featured", "Super Hot") consume network credits at the point of authorization.
            </p>
            <div className="bg-emerald-950 rounded-[32px] p-8 text-white">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Global Settlement Rate</span>
                <span className="text-lg font-black text-emerald-400">1 Credit = 1 USDT</span>
              </div>
              <p className="text-xs text-emerald-100/40 italic leading-relaxed">
                Credits are strictly non-transferable and possess no cash value outside the Trazot Node. Reversal of credit consumption is not permitted once asset rendering is initiated.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">4. Exclusion & Integrity Breaches</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              The Intelligence Network reserves the right to terminate participation for any entity engaged in:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Fraudulent Asset Data', 'Sybil Account Generation', 'Data Scraping Protocols', 'Regional Legal Infringement'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Operational Phase: Q4 2024 Revision</p>
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified by BigBossTrader</span>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;