import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X,
  MapPin,
  Tag as TagIcon,
  FileText,
  Image as ImageIcon,
  Check,
  ChevronDown,
  Bed,
  Bath,
  Smartphone,
  Search,
  Building2,
  Globe,
  HelpCircle,
  CheckSquare,
  ShieldCheck,
  Sliders,
  TrendingUp,
  AlertTriangle,
  Coins,
  Star,
  Zap,
  Gem,
  Trees,
  Sparkles,
  Loader2,
  Wand2,
  CloudLightning,
  Plus,
  Clock,
  CheckCircle2,
  Receipt,
  Navigation,
  ShieldAlert
} from 'lucide-react';
import { CategoryType, ListingPurpose, AdStatus, Listing, PropertyType, AreaUnit } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { processImage, getShortLink } from '../services/imageService.ts';
import { optimizeListingContent } from '../services/geminiService.ts';
import { COUNTRIES, CITIES } from '../constants.ts';

const MAX_IMAGES = 10;

const ChipSelector = ({ options, value, onChange, label, className = "" }: { options: any[], value: any, onChange: (v: any) => void, label?: string, className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {label && <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>}
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value || opt}
          type="button"
          onClick={() => onChange(opt.value || opt)}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            (opt.value || opt) === value 
            ? 'bg-[#17933f] text-white shadow-sm' 
            : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
          }`}
        >
          {opt.label || opt}
        </button>
      ))}
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, children }: { icon: any, title: string, children?: React.ReactNode }) => (
  <div className="bg-white rounded-[24px] md:rounded-[28px] shadow-sm mb-4 border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#17933f] shadow-sm border border-emerald-50">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <h2 className="text-sm font-black text-emerald-950 uppercase tracking-tight">{title}</h2>
      </div>
    </div>
    <div className="p-6 space-y-5">
      {children}
    </div>
  </div>
);

const InputRow = ({ label, icon: Icon, children, required = false, className = "" }: { label: string, icon?: any, children?: React.ReactNode, required?: boolean, className?: string }) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
    {children}
  </div>
);

export default function PostAd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [honeypot, setHoneypot] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.PROPERTIES);
  const user = storageService.getCurrentUser();
  const isGuest = user.email === 'guest@trazot.com' || !user.id || user.id === 'guest';

  const [formData, setFormData] = useState({
    purpose: ListingPurpose.SALE,
    propertyType: PropertyType.HOUSE,
    country: user.country || 'Pakistan',
    city: 'Karachi',
    society: '',
    areaValue: '',
    areaUnit: AreaUnit.MARLA,
    price: '',
    currency: 'PKR',
    featured: false,
    title: '',
    description: '',
    mobile: user.phone || '+92',
    isInstallment: false,
    isReady: false,
    bedrooms: '3',
    bathrooms: '3'
  });

  const cost = useMemo(() => {
    const isPakistan = formData.country === 'Pakistan';
    return formData.featured 
      ? (isPakistan ? 10 : 2) 
      : (isPakistan ? 5 : 1);
  }, [formData.country, formData.featured]);

  useEffect(() => {
    if (isGuest) navigate('/auth?reason=post_auth_required');
  }, [isGuest, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setError(null);
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    if (images.length + filesArray.length > MAX_IMAGES) return;
    setImageProcessing(true);
    try {
      const processedImages = await Promise.all(filesArray.map(async file => {
        const optimizedAsset = await processImage(file);
        return getShortLink(optimizedAsset);
      }));
      setImages(prev => [...prev, ...processedImages]);
    } catch (err: any) {
      setError(err.message || "Asset rejection by security layer.");
    } finally {
      setImageProcessing(false);
    }
  }, [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (honeypot) return;

    if (!storageService.security.rateLimit('post_ad', 1, 30000)) {
      setError("Asset submission cycle exceeded. Wait 30 seconds.");
      return;
    }

    if (user.credits < cost && user.id !== 'user_guest') {
      setError(`Insufficient Credits. Current Balance: ${user.credits}, Required: ${cost}`);
      return;
    }

    setLoading(true);

    const newListing: Listing = {
      id: `${category.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: storageService.security.sanitize(formData.title),
      description: storageService.security.sanitize(formData.description),
      price: Number(formData.price),
      currency: formData.currency,
      category,
      purpose: formData.purpose,
      images,
      location: { 
        country: formData.country, 
        city: formData.city, 
        society: storageService.security.sanitize(formData.society) 
      },
      status: AdStatus.PENDING,
      userId: user.id,
      createdAt: new Date().toISOString(),
      featured: formData.featured,
      isVerified: false,
      contactEmail: user.email,
      contactPhone: formData.mobile,
      whatsappNumber: formData.mobile,
      details: {
        propertyType: formData.propertyType,
        area: `${formData.areaValue} ${formData.areaUnit}`,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        isReady: formData.isReady,
        isInstallment: formData.isInstallment
      }
    };

    try {
      await storageService.saveListing(newListing);
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message || 'Transmission failure.');
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8 px-4">
        <input type="text" name="b_security_honeypot" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />

        <div className="mb-8 p-6 bg-emerald-950 text-white rounded-[32px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full" />
           <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-500" />
                  <h1 className="text-2xl font-serif-italic">Transmit <span className="text-emerald-500">Asset</span></h1>
                </div>
                <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest">Pricing Node: {formData.country === 'Pakistan' ? 'Regional (5/10)' : 'Global (1/2)'}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/5">
                <p className="text-[7px] font-black uppercase text-emerald-400">Available Credits</p>
                <p className="text-xl font-black">{user.credits}</p>
              </div>
           </div>
        </div>

        <SectionCard icon={Navigation} title="Regional Node">
            <div className="grid grid-cols-2 gap-4">
               <InputRow label="Country" icon={Globe}>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none border-none">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </InputRow>
               <InputRow label="City" icon={MapPin}>
                  <select name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none border-none">
                    {(CITIES[formData.country] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </InputRow>
            </div>
            <InputRow label="Society / Area / Neighborhood" icon={Building2}>
              <input 
                name="society" 
                value={formData.society} 
                onChange={handleInputChange} 
                placeholder="e.g. DHA Phase 6, Dubai Marina..." 
                className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none" 
              />
            </InputRow>
        </SectionCard>

        <SectionCard icon={Sliders} title="Market Selection">
           <ChipSelector options={Object.values(CategoryType)} value={category} onChange={(v) => setCategory(v)} label="Asset Category" />
            <div className="grid grid-cols-2 gap-4">
               <InputRow label="Asking Price" icon={TagIcon}>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="000" className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none" />
               </InputRow>
               <InputRow label="Mobile" icon={Smartphone}>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+92" className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none" />
               </InputRow>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-50">
               <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Sparkles className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-950 uppercase">Apply Featured Status</p>
                        <p className="text-[8px] font-bold text-emerald-600 uppercase">Max Visibility • {formData.country === 'Pakistan' ? 10 : 2} Credits</p>
                     </div>
                  </div>
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="w-6 h-6 accent-emerald-600 cursor-pointer" />
               </div>
            </div>
        </SectionCard>

        <SectionCard icon={FileText} title="Asset Inventory">
          <InputRow label="Headline (Sanitized)" icon={TagIcon}>
            <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 rounded-xl p-3 text-xs font-bold outline-none" />
          </InputRow>
          <InputRow label="Deep Briefing" icon={FileText}>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-gray-50 rounded-xl p-4 text-xs font-medium outline-none" />
          </InputRow>
          
          <div onClick={() => document.getElementById('file-upload')?.click()} className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-gray-50/20 cursor-pointer hover:bg-emerald-50 transition-all group">
            <input type="file" id="file-upload" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            <ImageIcon className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase text-emerald-950">Attach High-Res Media</p>
          </div>
        </SectionCard>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-3 border border-red-100 shadow-sm"><ShieldAlert className="w-5 h-5" /> {error}</div>}

        <button type="submit" disabled={loading || imageProcessing} className="w-full bg-[#17933f] text-white py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all disabled:opacity-50">
          {loading ? 'Analyzing Packets...' : `Authorize Transmission (${cost} Credits)`}
        </button>
      </form>
    </div>
  );
}