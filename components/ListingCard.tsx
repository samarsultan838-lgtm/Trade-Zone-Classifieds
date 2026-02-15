
import React from 'react';
import { Listing, ListingPurpose, AdStatus } from '../types.ts';
import { MapPin, CheckCircle, TrendingUp, Phone, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  listing: Listing;
}

const ListingCard: React.FC<Props> = React.memo(({ listing }) => {
  const isSold = listing.status === AdStatus.SOLD;

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
        className={`group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full ${isSold ? 'opacity-80' : ''}`}
        aria-label={`View details for ${listing.title} priced at ${listing.currency} ${listing.price.toLocaleString()}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img 
            src={`${listing.images[0] || 'https://images.unsplash.com/photo-1560340155-939bb77ad610?auto=format&fit=crop&q=80'}&w=400`} 
            alt={`Front view of ${listing.title}`} 
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isSold ? 'grayscale' : ''}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {isSold && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-lg uppercase tracking-widest shadow-2xl border-2 border-white/20">
                SOLD
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {!isSold && listing.purpose && (
              <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl border ${
                listing.purpose === ListingPurpose.SALE ? 'bg-yellow-400 text-yellow-950 border-yellow-300' : 
                listing.purpose === ListingPurpose.RENT ? 'bg-emerald-600 text-white border-emerald-500' : 
                'bg-blue-600 text-white border-blue-500'
              }`}>
                {listing.purpose}
              </div>
            )}
            {listing.featured && !isSold && (
              <div className="bg-white/90 backdrop-blur-md text-emerald-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl border border-white/50">
                <TrendingUp className="w-3 h-3" />
                Featured
              </div>
            )}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-black text-lg tracking-tight ${isSold ? 'text-gray-400 line-through' : 'text-emerald-600'}`}>
              {listing.currency} {listing.price.toLocaleString()}
            </span>
            {listing.isVerified && !isSold && <CheckCircle className="w-4 h-4 text-emerald-500" aria-label="Verified Listing" />}
          </div>
          
          <h3 className={`font-bold mb-1.5 line-clamp-1 group-hover:text-emerald-600 transition-colors text-base ${isSold ? 'text-gray-400' : 'text-gray-900'}`}>{listing.title}</h3>
          
          <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-4 font-bold uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-emerald-500" aria-hidden="true" />
            {listing.location.city}, {listing.location.country}
          </div>

          <div className="mt-auto">
            {isSold ? (
              <div className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center border border-gray-200">
                Asset Liquidated
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-[#17933f] text-white rounded-2xl hover:bg-[#127a34] transition-all shadow-md active:scale-95 group/btn"
                  aria-label={`Send WhatsApp message about ${listing.title}`}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">WhatsApp</span>
                </button>
                <button 
                  onClick={handleCall}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-[#17933f] text-white rounded-2xl hover:bg-[#127a34] transition-all shadow-md active:scale-95 group/btn"
                  aria-label={`Call about ${listing.title}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">Dial</span>
                </button>
                <button 
                  onClick={handleEmail}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-[#17933f] text-white rounded-2xl hover:bg-[#127a34] transition-all shadow-md active:scale-95 group/btn"
                  aria-label={`Send email inquiry about ${listing.title}`}
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
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
