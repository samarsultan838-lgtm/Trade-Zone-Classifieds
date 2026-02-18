import React, { useMemo } from 'react';
import { Listing, ListingPurpose, AdStatus } from '../types';
import { MapPin, CheckCircle, TrendingUp, Phone, Mail, MessageCircle, Clock, ImageIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  listing: Listing;
}

const ListingCard: React.FC<Props> = React.memo(({ listing }) => {
  const isSold = listing.status === AdStatus.SOLD;

  const timeAgo = useMemo(() => {
    const now = new Date();
    const created = new Date(listing.createdAt);
    const diffInMs = now.getTime() - created.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  }, [listing.createdAt]);

  const isNew = useMemo(() => {
    const now = new Date();
    const created = new Date(listing.createdAt);
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
  }, [listing.createdAt]);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSold) return;
    const number = listing.whatsappNumber?.replace(/\D/g, '');
    const text = encodeURIComponent(`Hi, I'm interested in: ${listing.title} (ID: ${listing.id})`);
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSold) return;
    window.location.href = `tel:${listing.contactPhone}`;
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSold) return;
    window.location.href = `mailto:${listing.contactEmail}?subject=Trazot Inquiry: ${listing.title}`;
  };

  return (
    <article className="h-full">
      <Link 
        to={`/listing/${listing.id}`} 
        className={`group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full relative ${isSold ? 'opacity-80' : ''}`}
        aria-label={`View details for ${listing.title} priced at ${listing.currency} ${listing.price.toLocaleString()}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={`${listing.images[0] || 'https://images.unsplash.com/photo-1560340155-939bb77ad610?auto=format&fit=crop&q=80'}&w=600`} 
            alt={`Front view of ${listing.title}`} 
            loading="lazy"
            decoding="async"
            width="600"
            height="450"
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isSold ? 'grayscale' : ''}`} 
          />
          
          {/* Overlays for Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {isSold && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-lg uppercase tracking-widest shadow-2xl border-2 border-white/20">
                SOLD
              </div>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {!isSold && listing.featured && (
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl border border-amber-300/50 animate-pulse">
                <Sparkles className="w-3 h-3" />
                Featured
              </div>
            )}
            {!isSold && isNew && (
              <div className="bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl border border-emerald-50">
                New
              </div>
            )}
            {!isSold && listing.purpose && (
              <div className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg border ${
                listing.purpose === ListingPurpose.SALE ? 'bg-white text-emerald-950 border-gray-100' : 
                listing.purpose === ListingPurpose.RENT ? 'bg-blue-600 text-white border-blue-500' : 
                'bg-gray-800 text-white border-gray-700'
              }`}>
                {listing.purpose}
              </div>
            )}
          </div>

          {/* Image Counter Badge */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
            <ImageIcon className="w-3 h-3" />
            {listing.images.length || 1}
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className={`font-black text-2xl tracking-tight leading-none ${isSold ? 'text-gray-400 line-through' : 'text-emerald-600'}`}>
                <span className="text-xs font-bold mr-1 opacity-70">{listing.currency}</span>
                {listing.price.toLocaleString()}
              </span>
            </div>
            {listing.isVerified && !isSold && (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                <CheckCircle className="w-3.5 h-3.5" aria-label="Verified Listing" />
                <span className="text-[8px] font-black uppercase">Verified</span>
              </div>
            )}
          </div>
          
          <h3 className={`font-bold text-lg mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors ${isSold ? 'text-gray-400' : 'text-emerald-950'}`}>{listing.title}</h3>
          
          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-[10px] mb-6 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              {listing.location.city}
            </div>
            <div className="w-1 h-1 bg-gray-200 rounded-full" />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </div>
          </div>

          <div className="mt-auto">
            {isSold ? (
              <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] text-center border border-gray-100">
                Asset Liquidated
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-[#17933f] text-white rounded-2xl hover:bg-[#127a34] transition-all shadow-lg shadow-emerald-600/10 active:scale-95 group/btn"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">WhatsApp</span>
                </button>
                <button 
                  onClick={handleCall}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-emerald-950 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 group/btn"
                >
                  <Phone className="w-4.5 h-4.5" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">Dial</span>
                </button>
                <button 
                  onClick={handleEmail}
                  className="flex flex-col items-center justify-center gap-1.5 py-3.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 group/btn"
                >
                  <Mail className="w-4.5 h-4.5" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">Email</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
});

ListingCard.displayName = 'ListingCard';
export default ListingCard;