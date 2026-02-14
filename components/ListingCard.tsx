import React from 'react';
import { Listing, ListingPurpose, AdStatus } from '../types.ts';
import { MapPin, CheckCircle, TrendingUp, Heart, MessageSquare, Ban } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  listing: Listing;
}

const ListingCard: React.FC<Props> = ({ listing }) => {
  const navigate = useNavigate();
  const isSold = listing.status === AdStatus.SOLD;

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Link to={`/listing/${listing.id}`} className={`group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full ${isSold ? 'opacity-80' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={listing.images[0]} alt={listing.title} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isSold ? 'grayscale' : ''}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* SOLD Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
            <div className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-lg uppercase tracking-widest shadow-2xl border-2 border-white/20">
              SOLD
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isSold ? (
            <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1">
              <span className="w-3 h-3"><Ban className="w-full h-full" /></span> Sold Out
            </div>
          ) : (
            listing.purpose && (
              <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl border ${
                listing.purpose === ListingPurpose.SALE ? 'bg-yellow-400 text-yellow-950 border-yellow-300' : 
                listing.purpose === ListingPurpose.RENT ? 'bg-emerald-600 text-white border-emerald-500' : 
                'bg-blue-600 text-white border-blue-500'
              }`}>
                {listing.purpose}
              </div>
            )
          )}
          {listing.featured && !isSold && (
            <div className="bg-white/90 backdrop-blur-md text-emerald-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-xl border border-white/50">
              <TrendingUp className="w-3 h-3" />
              Featured
            </div>
          )}
        </div>
        
        {!isSold && (
          <button className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-red-500 transition-all shadow-lg border border-white/20"><Heart className="w-4 h-4" /></button>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`font-black text-xl tracking-tight ${isSold ? 'text-gray-400 line-through' : 'text-emerald-600'}`}>
            {listing.currency} {listing.price.toLocaleString()}
          </span>
          {listing.isVerified && !isSold && <div className="bg-emerald-50 p-1 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" /></div>}
        </div>
        
        <h3 className={`font-bold mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors text-lg ${isSold ? 'text-gray-400' : 'text-gray-900'}`}>{listing.title}</h3>
        
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4 font-medium uppercase tracking-wider"><MapPin className="w-3.5 h-3.5 text-emerald-500" />{listing.location.city}, {listing.location.country}</div>

        <div className="flex flex-wrap gap-2 mb-6">
          {listing.details.propertyType && <div className="px-3 py-1.5 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">{listing.details.propertyType}</div>}
          {listing.details.area && <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isSold ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{listing.details.area}</div>}
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleContactClick} 
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] border border-white/5 group ${isSold ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-950 hover:bg-emerald-800 text-white'}`}
          >
            <MessageSquare className={`w-4 h-4 transition-transform ${isSold ? '' : 'text-emerald-400 group-hover:rotate-12'}`} />
            {isSold ? 'Sold Out' : 'Exclusive Contact'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;