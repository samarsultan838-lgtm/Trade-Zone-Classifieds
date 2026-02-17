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
  
  const currentUser = storageService.getCurrentUser();
  const isAdmin = !!sessionStorage.getItem('tz_admin_session');

  useEffect(() => {
    const foundListing = storageService.getListings().find(l => l.id === id);
    
    // SEO Integrity Check: If trashed, remove from index
    if (foundListing && foundListing.status === AdStatus.TRASHED) {
      const robots = document.createElement('meta');
      robots.name = "robots";
      robots.content = "noindex, nofollow";
      document.head.appendChild(robots);
      
      // Only Admin can view trashed items directly via ID
      if (!isAdmin) {
        setListing(null);
        return;
      }
    }

    if (foundListing) {
      setListing(foundListing);
      window.scrollTo(0, 0);
    } else {
      setListing(null);
    }

    return () => {
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) meta.remove();
    };
  }, [id, isAdmin]);

  if (!listing) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div>
        <h2 className="text-3xl font-serif-italic text-emerald-950 mb-2">Asset Not Found</h2>
        <p className="text-gray-400 font-medium max-w-xs mx-auto">This transmission ID has been redacted, moved to trash, or does not exist in the active ledger.</p>
      </div>
      <button onClick={() => navigate('/')} className="px-10 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">Return to Home Node</button>
    </div>
  );

  const isSold = listing.status === AdStatus.SOLD;
  const isTrashed = listing.status === AdStatus.TRASHED;

  const handleWhatsApp = () => {
    if (isSold || isTrashed) return;
    const text = encodeURIComponent(`Hi, I'm interested in: ${listing.title}. ID: ${listing.id.toUpperCase()}`);
    const number = listing.whatsappNumber?.replace(/\D/g, '') || listing.contactPhone?.replace(/\D/g, '') || '03462902804';
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    if (isSold || isTrashed) return;
    window.location.href = `tel:${listing.contactPhone}`;
  };

  const handleEmail = () => {
    if (isSold || isTrashed) return;
    window.location.href = `mailto:${listing.contactEmail}?subject=Trazot Inquiry: ${listing.title} (ID: ${listing.id})`;
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Visual Header */}
      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl mx-2 mt-4">
        <ImageCarousel 
          images={listing.images} 
          aspectRatio="aspect-[4/3] md:aspect-[21/9]"
          className={(isSold || isTrashed) ? 'grayscale opacity-60' : ''}
        />
        {(isSold || isTrashed) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[20]">
            <div className={`text-white px-10 py-4 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-2xl border-4 border-white/20 -rotate-6 ${isTrashed ? 'bg-black' : 'bg-red-600'}`}>
              {isTrashed ? 'TRASHED' : 'SOLD'}
            </div>
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
              {isTrashed && <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Admin Trash View</span>}
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

        {/* Spec Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-3"><Info className="text-emerald-500" /> Technical Brief</h2>
               <p className="text-lg text-gray-600 leading-relaxed font-medium">
                 {listing.description}
               </p>
            </div>

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

          <div className="space-y-8">
            <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><MessageCircle className="text-emerald-400" /> Merchant Interface</h3>
              <div className="space-y-4 relative z-10">
                 <button 
                  disabled={isSold || isTrashed}
                  onClick={handleWhatsApp} 
                  className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                 >
                   <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Relay
                 </button>
                 <button 
                  disabled={isSold || isTrashed}
                  onClick={handleCall} 
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                 >
                   <Phone className="w-5 h-5 fill-current" /> Initialize Voice
                 </button>
                 <button 
                  disabled={isSold || isTrashed}
                  onClick={handleEmail} 
                  className="w-full py-5 bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                 >
                   <Mail className="w-5 h-5" /> Email Transmission
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;