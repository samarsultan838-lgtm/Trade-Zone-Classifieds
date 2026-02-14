import React from 'react';
import { ShieldCheck, Eye, Lock, Database, Cpu, Fingerprint } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="pb-24 bg-white">
      {/* Cinematic Privacy Header */}
      <header className="bg-emerald-950 pt-24 pb-32 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="Privacy" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <Lock className="w-4 h-4" /> Network Integrity
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-6">Data <span className="text-emerald-500">Sovereignty</span></h1>
          <p className="text-emerald-100/60 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Advanced cryptographic identity protection and anonymized intelligence governance for the Trazot ecosystem.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-[48px] p-8 md:p-16 shadow-3xl border border-gray-100 space-y-20">
          
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">1. Cryptographic Identity Governance</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              Trazot utilizes unique device identifiers and encrypted metadata to maintain network hygiene. We do not engage in the commercial exploitation of participant data. Your "Work Identity" (Name, Verified Email, Mobile) is strictly utilized for high-fidelity transaction routing and fraud mitigation.
            </p>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">2. Anonymized AI Processing (Google Gemini)</h2>
            </div>
            <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
              <p className="text-sm text-gray-500 font-bold leading-relaxed mb-6">
                Our "Intelligence Suite" leverages Google Gemini AI models to optimize asset descriptions and perform market sentiment analysis.
              </p>
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-emerald-50">
                 <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                 <p className="text-xs text-emerald-900 font-black uppercase tracking-tight">Zero-PII Transmission: No personally identifiable information is ever transmitted to third-party AI models. All linguistic enhancements are performed on anonymized asset data packets.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">3. Regional Data Localization</h2>
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed font-medium">
                Trazot storage nodes are calibrated to meet the stringent data localization requirements of the GCC and South Asian digital corridors:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">UAE / KSA Protocol</h4>
                    <p className="text-xs text-gray-400 font-bold">Compliant with UAE Personal Data Protection Law and KSA PDPL standard for cross-border transmission.</p>
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">South Asia Node</h4>
                    <p className="text-xs text-gray-400 font-bold">Strict adherence to regional IT acts and emerging data protection frameworks in Pakistan and India.</p>
                 </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-950">4. Permissioned Transparency</h2>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium">
              Participant contact details are protected by a "Gatekeeper" protocol. Your private contact nodes are only exposed to another participant once you explicitly authorize an asset inquiry. We utilize SSL/TLS 1.3 encryption for all node-to-node transmissions.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 mb-2">SECURE ENDPOINT: ACTIVE</p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase">ISO 27001 Methodology Applied</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;