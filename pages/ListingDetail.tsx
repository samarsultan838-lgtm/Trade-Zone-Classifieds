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
  ArrowRight,
  Loader2
} from 'lucide-react';
import { storageService } from '../services/storageService.ts';
import { AdStatus, Listing, CategoryType, InternalMessage } from '../types.ts';
import ImageCarousel from '../components/ImageCarousel.tsx';

const ListingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const currentUser = storageService.getCurrentUser();
  const isAdmin = !!sessionStorage.getItem('tz_admin_session');

  useEffect(() => {
    const foundListing = storageService.getListings().find(l => l.id === id);
    if (foundListing && foundListing.status === AdStatus.TRASHED) {
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
  }, [id, isAdmin]);

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
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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
      alert("Transmission failed. Re-initialize node.");
    } finally {
      setIsSending(false);
    }
  };

  if (!listing) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200"><AlertCircle className="w-10 h-10" /></div>
      <h2 className="text-3xl font-serif-italic text-emerald-950 mb-2">Asset Not Found</h2>
      <button onClick={() => navigate('/')} className="px-10 py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Return to Home Node</button>
    </div>
  );

  const isSold = listing.status === AdStatus.SOLD;
  const isTrashed = listing.status === AdStatus.TRASHED;

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="relative rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl mx-2 mt-4">
        <ImageCarousel images={listing.images} aspectRatio="aspect-[4/3] md:aspect-[21/9]" className={(isSold || isTrashed) ? 'grayscale opacity-60' : ''} />
        {(isSold || isTrashed) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[20]">
            <div className={`text-white px-10 py-4 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-2xl border-4 border-white/20 -rotate-6 ${isTrashed ? 'bg-black' : 'bg-red-600'}`}>{isTrashed ? 'TRASHED' : 'SOLD'}</div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Intelligence Packet
              </div>
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{listing.id}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-emerald-950 leading-tight tracking-tight">{listing.title}</h1>
            <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-tight text-sm"><MapPin className="w-5 h-5 text-emerald-600 shrink-0" />{listing.location.city}, {listing.location.country}</div>
          </div>
          <div className="lg:w-80 bg-gray-50/50 p-8 rounded-[48px] border border-gray-100 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Market Valuation</p>
            <div className="text-4xl lg:text-5xl font-black text-emerald-950 mb-2"><span className="text-lg font-bold text-emerald-600 mr-2">{listing.currency}</span>{listing.price.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"><TrendingUp className="w-3.5 h-3.5" /> Real-time Node Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight flex items-center gap-3"><Info className="text-emerald-500" /> Technical Brief</h2>
               <p className="text-lg text-gray-600 leading-relaxed font-medium">{listing.description}</p>
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
                      <div><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{spec.label}</p><p className="text-sm font-black text-emerald-950">{spec.value}</p></div>
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
                 <button disabled={isSold || isTrashed || listing.userId === currentUser.id} onClick={handleInternalChatInit} className="w-full py-5 bg-white text-emerald-950 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" /> Chat on Trazot
                 </button>
                 <div className="h-px bg-white/10 my-4" />
                 <button disabled={isSold || isTrashed} onClick={() => window.open(`https://wa.me/${listing.whatsappNumber?.replace(/\D/g, '')}`)} className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                   <MessageCircle className="w-5 h-5 fill-current" /> WhatsApp Relay
                 </button>
                 <button disabled={isSold || isTrashed} onClick={() => window.location.href = `tel:${listing.contactPhone}`} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                   <Phone className="w-5 h-5 fill-current" /> Initialize Voice
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInternalChat && (
        <div className="fixed inset-0 z-[200] bg-emerald-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full relative animate-in zoom-in-95">
              <button onClick={() => setShowInternalChat(false)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6"><Zap className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-serif-italic text-emerald-950 mb-2">Secure Link</h3>
                 <p className="text-gray-400 font-medium text-sm">Initiating transmission with <strong>{listing.contactEmail.split('@')[0]}</strong> regarding <strong>{listing.title}</strong></p>
              </div>
              <form onSubmit={handleSendInternal} className="space-y-6">
                 <textarea required value={chatMessage} onChange={e => setChatMessage(e.target.value)} rows={5} placeholder="Compose your technical inquiry..." className="w-full bg-gray-50 rounded-[32px] p-8 font-medium outline-none border-2 border-transparent focus:border-emerald-500 transition-all leading-relaxed" />
                 <button type="submit" disabled={isSending} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3">
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Authorize Transmission</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;