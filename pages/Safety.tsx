import React from 'react';
import { ShieldAlert, CheckCircle, Smartphone, MapPin, Search, AlertTriangle, ShieldCheck, Landmark, Verified } from 'lucide-react';

const Safety: React.FC = () => {
  return (
    <div className="pb-24 bg-white">
      <header className="bg-emerald-950 pt-24 pb-32 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="Safety" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <ShieldCheck className="w-4 h-4" /> Integrity Protocol
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-6">Integrity <span className="text-emerald-500">Framework</span></h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-3xl border border-gray-100">
               <h2 className="text-3xl font-serif-italic text-emerald-950 mb-12 flex items-center gap-4">
                 <Verified className="text-emerald-600 w-8 h-8" /> Counter-Fraud Framework
               </h2>
               <div className="space-y-12">
                  {[
                    {
                      icon: <MapPin />,
                      title: "Physical Asset Audit",
                      desc: "Participants must never initiate fund transfers prior to a physical validation of the property or vehicle."
                    },
                    {
                      icon: <Landmark />,
                      title: "Document Authentication",
                      desc: "Leverage official regional gateways to verify Title Deeds."
                    },
                    {
                      icon: <Smartphone />,
                      title: "Encrypted Communication Loop",
                      desc: "Maintain all technical and financial discussions within the Trazot relay."
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-8">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                         {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-950 text-xl mb-3">{step.title}</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;