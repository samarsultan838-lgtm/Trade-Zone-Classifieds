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
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Share2,
  CheckCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { AdStatus, Listing, InternalMessage } from '../types';
import ImageCarousel from '../components/ImageCarousel';

declare const google: any;

const ListingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [syncRetries, setSyncRetries] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const currentUser = storageService.getCurrentUser();
  const isAdmin = !!sessionStorage.getItem('tz_admin_session');

  useEffect(() => {
    const fetchAsset = async () => {
      setIsLoading(true);
      if (!id) return;
      
      const found = await storageService.getListingById(id);
      
      if (found) {
        // Trashed listings are only visible to admins or the owner
        if (found.status === AdStatus.TRASHED && !isAdmin && found.userId !== currentUser.id) {
          setListing(null);
        } else {
          setListing(found);
          window.scrollTo(0, 0);
        }
      } else {
        setListing(null);
      }
      setIsLoading(false);
    };
    fetchAsset();
  }, [id, isAdmin, currentUser.id, syncRetries]);

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

  const handleManualSync = () => {
    setSyncRetries(prev => prev + 1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this asset on Trazot: ${listing?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard.');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center animate-in fade-in duration-700">
      <div className="relative">
         <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
         </div>
      </div>
      <div className="space-y-2">
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-900/60 block">Global Relay Active</span>
        <span className="text-xs font-bold text-gray-400">Synchronizing asset node from the Trazot directory...</span>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center animate-in fade-in duration-700 px-6">
      <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200 mb-4 border border-gray-100">
        <RefreshCw className="w-12 h-12" />
      </div>
      <div className="space-y-4 max-w-md">
        <h2 className="text-3xl md:text-4xl font-serif-italic text-emerald-950">Asset Node Disconnected</h2>
        <p className="text-gray-400 font-medium leading-relaxed">
          The requested listing ID <span className="font-bold text-emerald-600">"{id}"</span> could not be retrieved. It may be recently posted and pending global propagation, or it has been permanently purged from the network.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
        <button onClick={handleManualSync} className="flex-1 px-8 py-4 bg-white border border-gray-100 text-emerald-950 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-sm hover:bg-emerald-50 hover:border-emerald-100 transition-all flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Force Hub Sync
        </button>
        <button onClick={() => navigate('/')} className="flex-1 px-8 py-4 bg-emerald-950 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </button>
      </div>
    </div>
  );

  const isSold = listing.status === AdStatus.SOLD;
  const isPending = listing.status === AdStatus.PENDING;
  const isOwner = listing.userId === currentUser.id;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Top Banner for Status */}
      {isPending && (
        <div className="bg-amber-50 border-b border-amber-100 py-4 px-6 animate-in slide-in-from-top duration-500">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 text-center md:text-left">
                Node Status: <span className="text-amber-600">Pending Protocol Authorization</span>
              </p>
            </div>
            {isOwner && (
              <p className="text-[9px] font-bold text-amber-700/60 uppercase tracking-tight text-center md:text-right max-w-md">
                Admin review required for global search placement. Direct link access is active for verification purposes.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Actions */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6 flex items-center justify-between mb-6">
         <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl text-emerald-950 hover:bg-emerald-50 transition-all">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <div className="flex gap-2">
            <button onClick={handleShare} className="p-3 bg-gray-50 rounded-2xl text-emerald-950 hover:bg-emerald-50 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               <Share2 className="w-4 h-4" /> Share Asset
            </button>
            {isAdmin && (
               <button onClick={() => navigate('/admin-access-portal')} className="p-3 bg-emerald-950 text-white rounded-2xl hover:bg-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4" /> Approve Listing
               </button>
            )}
         </div>
      </div>

      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl mx-2">
        <ImageCarousel images={listing.images} aspectRatio="aspect-[4/3] md:aspect-[21/9]" className={isSold ? 'grayscale opacity-60' : ''} />
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 border rounded-full text-[9px] font-black uppercase flex items-center gap-2 ${
                isPending ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {isPending ? <Clock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {isPending ? 'Transmission Pending' : 'Institutional Asset Node'}
              </div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {listing.id}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-emerald-950 leading-tight">{listing.title}</h1>
            <div className="flex items-center gap-3 text-gray-500 font-bold uppercase text-sm"><MapPin className="w-5 h-5 text-emerald-600" />{listing.location.city}, {listing.location.country}</div>
          </div>
          <div className="lg:w-80 bg-gray-50/50 p-8 rounded-[48px] text-center border border-gray-100">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Market Valuation</p>
            <div className="text-4xl lg:text-5xl font-black text-emerald-950"><span className="text-lg font-bold text-emerald-600 mr-2">{listing.currency}</span>{listing.price.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 mt-2 justify-center"><TrendingUp className="w-3.5 h-3.5" /> Real-time Node Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-emerald-950 uppercase flex items-center gap-3"><Info className="text-emerald-500" /> Technical Brief</h2>
               <p className="text-lg text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
            
            <div className="bg-gray-50/50 rounded-[48px] p-8 md:p-12 border border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-10">
                 {[
                   { icon: <Maximize />, label: 'Dimensions', value: listing.details.area || 'Verified' },
                   { icon: <Layers />, label: 'Asset Class', value: listing.category },
                   { icon: <Package />, label: 'Year Built / Reg', value: listing.details.year || '2025' },
                   { icon: <Clock />, label: 'Listed', value: new Date(listing.createdAt).toLocaleDateString() }
                 ].map((spec, i) => (
                   <div key={i} className="space-y-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">{spec.icon}</div>
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{spec.label}</p><p className="text-sm font-black text-emerald-950">{spec.value}</p></div>
                   </div>
                 ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-black text-emerald-950 uppercase flex items-center gap-3"><MapPin className="text-emerald-500" /> Asset Localization</h2>
              <div ref={mapContainerRef} className="w-full h-80 rounded-[40px] border border-gray-100 shadow-inner overflow-hidden bg-gray-50" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-emerald-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full" />
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10"><MessageCircle className="text-emerald-400" /> Merchant Interface</h3>
              <div className="space-y-4 relative z-10">
                 <button disabled={isSold || isOwner} onClick={handleInternalChatInit} className="w-full py-5 bg-white text-emerald-950 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" /> Secure Chat
                 </button>
                 <button disabled={isSold} onClick={() => window.open(`https://wa.me/${listing.whatsappNumber?.replace(/\D/g, '')}`)} className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all">
                   <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Relay
                 </button>
                 <button disabled={isSold} onClick={() => window.location.href = `tel:${listing.contactPhone}`} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all">
                   <Phone className="w-5 h-5 fill-current" /> Voice Call
                 </button>
                 {isOwner && (
                    <p className="text-[9px] font-bold text-emerald-100/40 uppercase tracking-widest text-center pt-2">Merchant Link Active (Owner View)</p>
                 )}
              </div>
            </div>

            <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-950 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Node Integrity
               </h4>
               <ul className="space-y-3">
                  {['Verified Merchant Node', 'Technical Audit Complete', 'SSL Transmission Active'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase">
                       <CheckCircle className="w-3 h-3 text-emerald-500" /> {item}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>
      </div>

      {showInternalChat && (
        <div className="fixed inset-0 z-[200] bg-emerald-950/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full relative animate-in zoom-in-95">
              <button onClick={() => setShowInternalChat(false)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
              <h3 className="text-3xl font-serif-italic text-emerald-950 mb-2">Establish Link</h3>
              <p className="text-gray-500 mb-8 text-sm">Send a direct message to the merchant of this node.</p>
              <form onSubmit={handleSendInternal} className="space-y-6">
                 <textarea required value={chatMessage} onChange={e => setChatMessage(e.target.value)} rows={5} placeholder="Draft your professional inquiry..." className="w-full bg-gray-50 rounded-[32px] p-8 font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed" />
                 <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
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