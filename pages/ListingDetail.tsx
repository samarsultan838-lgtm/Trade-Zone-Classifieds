
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
  Gem
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
      
      // Inject Structured Data for SEO
      const schemaType = foundListing.category === CategoryType.PROPERTIES ? 'RealEstateListing' : 'Product';
      const scriptId = 'structured-data-listing';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const structuredData = {
        "@context": "https://schema.org/",
        "@type": schemaType,
        "name": foundListing.title,
        "image": foundListing.images,
        "description": foundListing.description,
        "sku": foundListing.id,
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": foundListing.currency,
          "price": foundListing.price,
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Trazot Marketplace"
          }
        }
      };
      
      script.textContent = JSON.stringify(structuredData);

      return () => {
        const s = document.getElementById(scriptId);
        if (s) s.remove();
      };
    }
  }, [id]);

  const priceIndexData = useMemo(() => [
    { month: 'Jan', price: 8.2 },
    { month: 'Mar', price: 8.5 },
    { month: 'May', price: 8.8 },
    { month: 'Jul', price: 9.1 },
    { month: 'Sep', price: 9.4 },
    { month: 'Nov', price: 9.8 },
  ], []);

  if (!listing) return <div className="text-center py-20 font-bold text-gray-500 uppercase tracking-[0.3em]">Asset Not Found</div>;

  const isSold = listing.status === AdStatus.SOLD;

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'PKR' || currency === 'INR') {
      if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Crore`;
      if (price >= 100000) return `${(price / 100000).toFixed(1)} Lakh`;
    }
    return price.toLocaleString();
  };

  const handleWhatsApp = () => {
    if (isSold) return;
    const text = encodeURIComponent(`Hi, I'm interested in: ${listing.title}. ID: ${listing.id.toUpperCase()}`);
    const number = listing.whatsappNumber?.replace(/\D/g, '') || listing.contactPhone?.replace(/\D/g, '') || '03462902804';
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Visual Header */}
      <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
        <ImageCarousel 
          images={listing.images} 
          aspectRatio="aspect-[4/3] md:aspect-[21/9]"
          className={isSold ? 'grayscale opacity-60' : ''}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[20]">
            <div className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-2xl border-4 border-white/20 -rotate-6">
              SOLD
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-0">
        {/* Header Info */}
        <div className="py-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="sr-only">{listing.title} - Price and Details</h1>
            <div className="text-gray-900 font-black text-4xl md:text-6xl flex items-center gap-3">
              <span className="text-xl md:text-2xl font-bold text-emerald-600">{listing.currency}</span> 
              {formatPrice(listing.price, listing.currency)}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-red-500 transition-all border border-gray-100 shadow-sm"><Heart className="w-6 h-6" /></button>
            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-100 shadow-sm"><Share2 className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="pb-8 border-b border-gray-100">
          <div className="flex items-start gap-3 text-gray-500 text-sm font-bold leading-relaxed">
            <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-emerald-950/80 uppercase tracking-tight">{listing.location.city}, {listing.location.country} — High Priority Zone</p>
          </div>
        </div>

        {/* Best Features Highlight - New Addition */}
        {listing.details.bestFeatures && listing.details.bestFeatures.length > 0 && (
          <div className="py-6 flex flex-wrap gap-2 animate-in fade-in duration-700">
             {listing.details.bestFeatures.map(feat => (
               <div key={feat} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                  <Gem className="w-3.5 h-3.5" /> {feat}
               </div>
             ))}
          </div>
        )}

        {/* Dynamic Spec Header */}
        {listing.category === CategoryType.PROPERTIES ? (
          <div className="py-8 grid grid-cols-3 gap-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <Maximize className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide">{listing.details.area || '1 Kanal'}</span>
            </div>
            <div className="flex items-center gap-4">
              <Bed className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide">{listing.details.bedrooms || 0} Beds</span>
            </div>
            <div className="flex items-center gap-4">
              <Bath className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide">{listing.details.bathrooms || 0} Baths</span>
            </div>
          </div>
        ) : (
          <div className="py-8 grid grid-cols-3 gap-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide truncate">{listing.details.brand || 'No Brand'}</span>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide">{listing.details.condition || 'Used'}</span>
            </div>
            <div className="flex items-center gap-4">
              <Layers className="w-8 h-8 text-emerald-950" />
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide truncate">{listing.details.subCategory || 'Standard'}</span>
            </div>
          </div>
        )}

        {/* Communication Deck */}
        <div className="py-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900/40">Secure Contact Gateways</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Connect with our verified brokerage team</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
               <ShieldCheck className="w-4 h-4 text-emerald-600" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Verified Seller</span>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ${isSold ? 'grayscale pointer-events-none opacity-60' : ''}`}>
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-green-500/30 hover:bg-[#1ebd5e] hover:scale-[1.03] transition-all active:scale-95 border border-white/10">
              <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp
            </button>
            <button className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-[1.03] transition-all active:scale-95 border border-white/10">
              <Phone className="w-5 h-5 fill-current" /> Call Now
            </button>
            <button className="flex items-center justify-center gap-3 bg-sky-500 text-white px-6 py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-sky-500/30 hover:bg-sky-600 hover:scale-[1.03] transition-all active:scale-95 border border-white/10">
              <MessageSquare className="w-5 h-5 fill-current" /> SMS Chat
            </button>
            <button onClick={() => setShowEmailModal(true)} className="flex items-center justify-center gap-3 bg-emerald-950 text-white px-6 py-4.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-black/20 hover:bg-black hover:scale-[1.03] transition-all active:scale-95 border border-white/5">
              <Mail className="w-5 h-5" /> Send Offer
            </button>
          </div>
        </div>

        {/* Tab System */}
        <div className="mt-8 flex items-center gap-10 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {['Overview', 'Technical Details', 'Price Index'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-5 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all border-b-4 ${activeTab === tab ? 'text-emerald-600 border-emerald-600' : 'text-gray-400 border-transparent hover:text-emerald-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-12 animate-in fade-in slide-in-from-bottom-4">
          {activeTab === 'Overview' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">Details</h2>
                <p className="text-gray-600 text-base leading-relaxed font-medium">
                  {listing.description}
                </p>
                
                {listing.details.bestFeatures && listing.details.bestFeatures.length > 0 && (
                  <div className="pt-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 mb-6">Key Attributes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {listing.details.bestFeatures.map(f => (
                        <div key={f} className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                           <Check className="w-3.5 h-3.5" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50/50 rounded-[40px] overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 divide-y divide-gray-100">
                  {[
                    { label: 'Asset Category', value: listing.category },
                    { label: 'Market Status', value: listing.status },
                    { label: 'Origin Gateway', value: listing.location.city },
                    { label: 'Asset Identifier', value: listing.id.toUpperCase() },
                    { label: 'Security Verification', value: listing.isVerified ? 'Elite Level' : 'Standard' }
                  ].map((row, i) => (
                    <div key={i} className="flex py-6 px-10 items-center justify-between hover:bg-white transition-colors">
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">{row.label}</span>
                      <span className="text-emerald-950 text-sm font-black uppercase tracking-tight">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
