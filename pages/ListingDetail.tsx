import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  X, 
  Send, 
  Maximize, 
  Smartphone, 
  ShieldCheck, 
  Info, 
  MessageCircle, 
  Package, 
  Layers, 
  Zap, 
  TrendingUp, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { AdStatus, Listing, InternalMessage } from '../types';
import ImageCarousel from '../components/ImageCarousel';

declare const google: any;

const ListingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const currentUser = storageService.getCurrentUser();
  const isAdmin = !!sessionStorage.getItem('tz_admin_session');

  useEffect(() => {
    const foundListing = storageService.getListings().find(l => l.id === id);
    if (foundListing) {
      if (foundListing.status === AdStatus.TRASHED && !isAdmin) {
        setListing(null);
      } else {
        setListing(foundListing);
        window.scrollTo(0, 0);
      }
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (listing?.location?.lat && mapContainerRef.current && typeof google !== 'undefined') {
      const pos = { lat: listing.location.lat, lng: listing.location.lng };
      const map = new google.maps.Map(mapContainerRef.current, {
        center: pos,
        zoom: 15,
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
      });
      new google.maps.Marker({ position: pos, map: map, title: listing.title });
    }
  }, [listing, typeof google]);

  const handleInternalChatInit = () => {
    if (currentUser.id === 'guest') {
      navigate('/auth?reason=chat_auth');
      return;
    }
    setShowInternalChat(true);
  };

  const handleSendInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !listing || isSending) return;

    setIsSending(true);
    const newMsg: InternalMessage = {
      id: `msg_${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: listing.userId,
      text: chatMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await storageService.sendInternalMessage(newMsg);
      setShowInternalChat(false);
      navigate('/messages');
    } catch (e) {
      alert("Transmission failed.");
    } finally {
      setIsSending(false);
    }
  };

  if (!listing) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in duration-700">
      <h2 className="text-3xl font-serif-italic text-emerald-950">Asset Not Found</h2>
      <button onClick={() => navigate('/')} className="px-10 py-4 bg-emerald-950 text-white rounded-2xl">Return Home</button>
    </div>
  );

  const isSold = listing.status === AdStatus.SOLD;

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl mx-2 mt-4">
        <ImageCarousel images={listing.images} aspectRatio="aspect-[4/3] md:aspect-[21/9]" className={isSold ? 'grayscale opacity-60' : ''} />
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-black uppercase text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Institutional Asset Node
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-emerald-950">{listing.title}</h1>
            <div className="flex items-center gap-3 text-gray-500 font-bold uppercase text-sm"><MapPin className="w-5 h-5 text-emerald-600" />{listing.location.city}, {listing.location.country}</div>
          </div>
          <div className="lg:w-80 bg-gray-50/50 p-8 rounded-[48px] text-center">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Market Valuation</p>
            <div className="text-4xl lg:text-5xl font-black text-emerald-950"><span className="text-lg font-bold text-emerald-600 mr-2">{listing.currency}</span>{listing.price.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 mt-2"><TrendingUp className="w-3.5 h-3.5" /> Real-time Node Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-emerald-950 uppercase flex items-center gap-3"><Info className="text-emerald-500" /> Technical Brief</h2>
               <p className="text-lg text-gray-600 font-medium leading-relaxed">{listing.description}</p>
            </div>
            
            <div className="bg-gray-50/50 rounded-[48px] p-8 md:p-12 border border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-10">
                 {[
                   { icon: <Maximize />, label: 'Dimensions', value: listing.details.area || 'Verified' },
                   { icon: <Layers />, label: 'Asset Class', value: listing.category },
                   { icon: <Package />, label: 'Year Built / Reg', value: listing.details.year || '2025' },
                   { icon: <Clock />, label: 'Listed', value: new Date(listing.createdAt).toLocaleDateString() }
                 ].map((spec, i) => (
                   <div key={i} className="space-y-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">{spec.icon}</div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{spec.label}</p><p className="text-sm font-black text-emerald-950">{spec.value}</p></div>
                   </div>
                 ))}
            </div>

            {/* Google Map Implementation */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-emerald-950 uppercase flex items-center gap-3"><MapPin className="text-emerald-500" /> Asset Localization</h2>
              <div ref={mapContainerRef} className="w-full h-80 rounded-[40px] border border-gray-100 shadow-inner overflow-hidden" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><MessageCircle className="text-emerald-400" /> Merchant Interface</h3>
              <div className="space-y-4">
                 <button disabled={isSold || listing.userId === currentUser.id} onClick={handleInternalChatInit} className="w-full py-5 bg-white text-emerald-950 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" /> Secure Chat
                 </button>
                 <button disabled={isSold} onClick={() => window.open(`https://wa.me/${listing.whatsappNumber?.replace(/\D/g, '')}`)} className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3">
                   <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Relay
                 </button>
                 <button disabled={isSold} onClick={() => window.location.href = `tel:${listing.contactPhone}`} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3">
                   <Phone className="w-5 h-5 fill-current" /> Voice Call
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInternalChat && (
        <div className="fixed inset-0 z-[200] bg-emerald-950/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full relative animate-in zoom-in-95">
              <button onClick={() => setShowInternalChat(false)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
              <h3 className="text-3xl font-serif-italic text-emerald-950 mb-4">Establish Link</h3>
              <form onSubmit={handleSendInternal} className="space-y-6">
                 <textarea required value={chatMessage} onChange={e => setChatMessage(e.target.value)} rows={5} placeholder="Draft your professional inquiry..." className="w-full bg-gray-50 rounded-[32px] p-8 font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" />
                 <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-3">
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Transmission'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;