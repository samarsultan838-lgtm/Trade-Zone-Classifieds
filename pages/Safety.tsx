
import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  Smartphone, 
  MapPin, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Landmark, 
  Verified, 
  Lock, 
  EyeOff, 
  FileCheck,
  UserCheck
} from 'lucide-react';

const Safety: React.FC = () => {
  return (
    <div className="pb-24 bg-white animate-in fade-in duration-700">
      <header className="bg-emerald-950 pt-24 pb-48 px-4 relative overflow-hidden text-center rounded-[48px] md:rounded-[64px] mx-2 md:mx-4 mt-4">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="Safety" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/80 to-emerald-950" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">
            <ShieldCheck className="w-4 h-4" /> Trust Architecture 2.0
          </div>
          <h1 className="text-5xl md:text-8xl font-serif-italic text-white mb-6 leading-tight">Integrity <span className="text-emerald-500">By Design.</span></h1>
          <p className="text-emerald-100/60 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Our multi-layered security protocol ensures the authenticity of high-fidelity transmissions across the Trazot network.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Security Pillars */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[56px] p-8 md:p-16 shadow-4xl border border-gray-100">
               <div className="mb-16">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4 block">Operational Security</span>
                 <h2 className="text-3xl md:text-5xl font-serif-italic text-emerald-950 leading-tight">Asset <span className="text-emerald-500">Integrity Protocol.</span></h2>
               </div>
               
               <div className="space-y-16">
                  {[
                    {
                      icon: <MapPin />,
                      title: "Physical Custody Audit",
                      desc: "All high-value assets (Property/Vehicles) must undergo a physical inspection at a verified Trazot Hub or public secure zone. Never authorize a transaction without a direct verification node meeting.",
                      label: "Rule #1"
                    },
                    {
                      icon: <FileCheck />,
                      title: "Document Hash Verification",
                      desc: "Trazot cross-references regional Land Department (DLD/REGA) and Excise documents to ensure title integrity. Participants can request an official 'Trade Zone Hash' for any verified listing.",
                      label: "Rule #2"
                    },
                    {
                      icon: <EyeOff />,
                      title: "Encrypted Liaison",
                      desc: "Maintain all technical and financial discussions within the Trazot relay. External communication fragments the audit trail and exposes participants to off-node vulnerabilities.",
                      label: "Rule #3"
                    },
                    {
                      icon: <UserCheck />,
                      title: "Merchant Tier Validation",
                      desc: "Always prioritize 'Elite' or 'Professional' merchants. These nodes have undergone full legal background synchronization and maintain active credit balances.",
                      label: "Rule #4"
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-10 group">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center shrink-0 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                         {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'w-10 h-10' })}
                      </div>
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{step.label}</span>
                        <h4 className="font-bold text-emerald-950 text-2xl mb-1">{step.title}</h4>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-xl">{step.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar Alerts */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-red-50 rounded-[48px] p-10 border border-red-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl" />
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 mb-8 shadow-sm group-hover:scale-110 transition-transform">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-red-950 mb-4">Critical Alerts</h3>
                <div className="space-y-6">
                   <div className="p-5 bg-white rounded-3xl border border-red-50 text-xs font-bold text-red-900 leading-relaxed uppercase tracking-tight">
                      Report any merchant requesting "Digital Wallet Only" transfers prior to document signing.
                   </div>
                   <div className="p-5 bg-white rounded-3xl border border-red-50 text-xs font-bold text-red-900 leading-relaxed uppercase tracking-tight">
                      Beware of "Direct Port Delivery" scams on heavy industrial machinery.
                   </div>
                </div>
             </div>

             <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                <Lock className="w-12 h-12 text-emerald-500 mb-8" />
                <h4 className="text-2xl font-bold mb-4">Data Sovereignty</h4>
                <p className="text-emerald-100/40 text-sm font-medium leading-relaxed mb-10">
                   Trazot utilizes SSL/TLS 1.3 encryption for all node-to-node transmissions. Your identity is fragmented and encrypted across our regional storage clusters.
                </p>
                <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all">Review Privacy Node</button>
             </div>

             <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm text-center">
                <Verified className="w-12 h-12 text-emerald-600 mx-auto mb-6" />
                <h5 className="font-bold text-emerald-950 mb-2 uppercase tracking-tight">Report a Breach</h5>
                <p className="text-gray-400 text-xs font-medium mb-8">Identify an integrity breach? Help us maintain the global network standard.</p>
                <button className="text-[10px] font-black uppercase text-emerald-600 border-b-2 border-emerald-500/20 pb-1 hover:border-emerald-600 transition-all">Submit Security Packet</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Safety;
