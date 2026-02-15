
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Share2, 
  Heart,
  MessageSquare, 
  Check, 
  Copy, 
  X, 
  Send, 
  Bed,
  Bath,
  Maximize,
  ChevronRight,
  Smartphone,
  Navigation,
  Calculator,
  LineChart as LineChartIcon,
  ShieldCheck,
  Tag,
  Info,
  MessageCircle,
  AlertCircle,
  Package,
  Layers,
  Gem,
  Sparkles,
  Zap,
  // Added missing imports for TrendingUp, Clock, UserIcon, and ArrowRight
  TrendingUp,
  Clock,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { storageService } from '../services/storageService.ts';
import { AdStatus, Listing, CategoryType } from '../types.ts';
import ImageCarousel from '../components/ImageCarousel.tsx';

const ListingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    const foundListing = storageService.getListings().find(l => l.id === id);
    if (foundListing) {
      setListing(foundListing);
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!listing) return <div className="text-center py-20 font-bold text-gray-500 uppercase tracking-[0.3em]">Asset Not Found</div>;

  const isSold = listing.status === AdStatus.SOLD;

  const handleWhatsApp = () => {
    if (isSold) return;
    const text = encodeURIComponent(`Hi, I'm interested in: ${listing.title}. ID: ${listing.id.toUpperCase()}`);
    const number = listing.whatsappNumber?.replace(/\D/g, '') || listing.contactPhone?.replace(/\D/g, '') || '03462902804';
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Visual Header */}
      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl mx-2 mt-4">
        <ImageCarousel 
          images={listing.images} 
          aspectRatio="aspect-[4/3] md:aspect-[21/9]"
          className={isSold ? 'grayscale opacity-60' : ''}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[20]">
            <div className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-2xl border-4 border-white/20 -rotate-6">SOLD</div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 mt-12">
        {/* Header Info */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Intelligence Packet
              </div>
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{listing.id}</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-emerald-950 leading-tight tracking-tight">{listing.title}</h1>
            
            <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-tight text-sm">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              {listing.location.city}, {listing.location.country} — High Priority Zone
            </div>
          </div>

          <div className="lg:w-80 bg-gray-50/50 p-8 rounded-[48px] border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Market Valuation</p>
            <div className="text-4xl lg:text-5xl font-black text-emerald-950 mb-2">
              <span className="text-lg font-bold text-emerald-600 mr-2">{listing.currency}</span>
              {listing.price.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
               <TrendingUp className="w-3.5 h-3.5" /> Real-time Node Rate
            </div>
          </div>
        </div>

        {/* Best Features Protocol 2.0 */}
        {listing.details.bestFeatures && listing.details.bestFeatures.length > 0 && (
          <div className="mb-12">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-900/30 mb-6 ml-1">Asset Highlight Spectrum</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {listing.details.bestFeatures.map(feat => (
                 <div key={feat} className="group relative bg-white hover:bg-emerald-50 p-4 rounded-3xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Zap className="w-5 h-5 fill-current opacity-20" />
                       <Gem className="w-5 h-5 absolute" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-emerald-950">{feat}</span>
                 </div>
               ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
          {/* Main Context */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-3"><Info className="text-emerald-500" /> Technical Brief</h2>
               <p className="text-lg text-gray-600 leading-relaxed font-medium">
                 {listing.description}
               </p>
            </div>

            {/* Spec Matrix */}
            <div className="bg-gray-50/50 rounded-[48px] p-8 md:p-12 border border-gray-100">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                 {[
                   { icon: <Maximize />, label: 'Dimensions', value: listing.details.area || 'Standard' },
                   { icon: <Layers />, label: 'Asset Class', value: listing.category },
                   { icon: <ShieldCheck />, label: 'Verification', value: listing.isVerified ? 'Elite Level' : 'Standard' },
                   { icon: <Smartphone />, label: 'Lead Source', value: 'Trade Zone Node' },
                   { icon: <Package />, label: 'Condition', value: listing.details.condition || 'Verified' },
                   { icon: <Clock />, label: 'Joined Node', value: new Date(listing.createdAt).toLocaleDateString() }
                 ].map((spec, i) => (
                   <div key={i} className="space-y-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">{spec.icon}</div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{spec.label}</p>
                        <p className="text-sm font-black text-emerald-950">{spec.value}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Side Actions */}
          <div className="space-y-8">
            <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><MessageCircle className="text-emerald-400" /> Merchant Interface</h3>
              <div className="space-y-4 relative z-10">
                 <button onClick={handleWhatsApp} className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                   <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Relay
                 </button>
                 <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                   <Phone className="w-5 h-5 fill-current" /> Initialize Voice
                 </button>
                 <div className="pt-4 border-t border-white/10 mt-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><UserIcon className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified ID</p>
                      <p className="text-xs font-bold text-white/60">{listing.userId}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm group">
               <h4 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> Safety Protocol</h4>
               <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">Always conduct high-value asset inspections in public verified Trade Zone nodes.</p>
               <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 group-hover:gap-4 transition-all">Integrity Policy <ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
