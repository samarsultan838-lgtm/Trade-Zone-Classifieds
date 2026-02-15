
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
  Plus
} from 'lucide-react';
import { CategoryType, ListingPurpose, AdStatus, Listing, PropertyType, AreaUnit } from '../types.ts';
import { storageService } from '../services/storageService.ts';
import { processImage } from '../services/imageService.ts';
import { optimizeListingContent } from '../services/geminiService.ts';
import { COUNTRIES, CITIES } from '../constants.ts';

const MAX_IMAGES = 10;
const GCC_COUNTRIES = ['Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'];

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
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [bestFeatures, setBestFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [category, setCategory] = useState<CategoryType>(CategoryType.PROPERTIES);
  const [propertyMainType, setPropertyMainType] = useState<'Home' | 'Plots' | 'Land' | 'Commercial'>('Home');
  
  const user = storageService.getCurrentUser();

  useEffect(() => {
    if (user.email === 'guest@trazot.com') {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    purpose: ListingPurpose.SALE,
    propertyType: PropertyType.HOUSE,
    country: 'Pakistan',
    city: '',
    location: '',
    areaValue: '',
    areaUnit: AreaUnit.MARLA,
    price: '',
    currency: 'PKR',
    isInstallment: false,
    isReady: false,
    featured: false,
    bedrooms: '3',
    bathrooms: '3',
    title: '',
    description: '',
    email: user.email,
    mobile: user.phone || '+92',
    landline: '+92',
    platformSelection: true,
    
    // Vehicle Specific
    make: '',
    model: '',
    year: '2024',
    mileage: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    condition: 'Used',
    
    // Electronics & General
    brand: '',
    subCategory: '',
    warranty: false
  });

  const availableCities = useMemo(() => {
    return CITIES[formData.country] || [];
  }, [formData.country]);

  const isGCC = useMemo(() => GCC_COUNTRIES.includes(formData.country), [formData.country]);

  const dynamicPropertyTypes = useMemo(() => {
    if (propertyMainType === 'Home') {
      return [
        { label: 'House', value: PropertyType.HOUSE },
        { label: 'Flat', value: PropertyType.FLAT },
        { label: 'Upper Portion', value: PropertyType.UPPER_PORTION },
        { label: 'Lower Portion', value: PropertyType.LOWER_PORTION },
        { label: 'Farm House', value: PropertyType.FARM_HOUSE },
        { label: 'Penthouse', value: PropertyType.PENTHOUSE },
        { label: 'Room', value: PropertyType.ROOM },
      ];
    } else if (propertyMainType === 'Plots') {
      return [
        { label: 'Residential Plot', value: PropertyType.RESIDENTIAL_PLOT },
        { label: 'Commercial Plot', value: PropertyType.COMMERCIAL_PLOT },
        { label: 'Plot File', value: PropertyType.PLOT_FILE },
        { label: 'Plot Form', value: PropertyType.PLOT_FORM },
      ];
    } else if (propertyMainType === 'Land') {
      return [
        { label: 'Agricultural Land', value: PropertyType.AGRICULTURAL_LAND },
        { label: 'Industrial Land', value: PropertyType.INDUSTRIAL_LAND },
        { label: 'Development Land', value: PropertyType.OTHER },
      ];
    } else {
      return [
        { label: 'Office', value: PropertyType.OFFICE },
        { label: 'Shop', value: PropertyType.SHOP },
        { label: 'Warehouse', value: PropertyType.WAREHOUSE },
        { label: 'Factory', value: PropertyType.FACTORY },
        { label: 'Building', value: PropertyType.BUILDING },
        { label: 'Other', value: PropertyType.OTHER },
      ];
    }
  }, [propertyMainType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setError(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); 
    setFormData(prev => ({ ...prev, price: value }));
  };

  const handleAddFeature = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (featureInput.trim() && !bestFeatures.includes(featureInput.trim())) {
      setBestFeatures([...bestFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    if (images.length + filesArray.length > MAX_IMAGES) return;
    setLoading(true);
    try {
      const processedImages = await Promise.all(filesArray.map(file => processImage(file)));
      setImages(prev => [...prev, ...processedImages]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [images]);

  const handleAIOptimize = async () => {
    if (!formData.title || !formData.description) {
      setError("Please enter a basic title and description first.");
      return;
    }
    setAiOptimizing(true);
    setError(null);
    try {
      const optimized = await optimizeListingContent(formData.title, formData.description, category);
      if (optimized) {
        setFormData(prev => ({
          ...prev,
          title: optimized.optimizedTitle,
          description: optimized.optimizedDescription
        }));
      } else {
        setError("AI optimization failed. Please try again later.");
      }
    } catch (err) {
      setError("AI connection error.");
    } finally {
      setAiOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cost = formData.featured ? 2 : 1;
    if (user.credits < cost) {
      setError(`Insufficient credits. You need ${cost} credits.`);
      setLoading(false);
      return;
    }

    const prefixMap = {
      [CategoryType.PROPERTIES]: 'PRP',
      [CategoryType.VEHICLES]: 'VEH',
      [CategoryType.ELECTRONICS]: 'ELC',
      [CategoryType.GENERAL]: 'GEN'
    };

    let classification: Listing['classification'] = 'Free';
    if (user.tier === 'Starter') classification = 'Basic';
    if (user.tier === 'Professional' && formData.featured) classification = 'Super Hot';
    else if (formData.featured) classification = 'Hot';
    if (user.tier === 'Elite' && formData.featured) classification = 'Super Hot';
    
    const newListing: Listing = {
      id: `${prefixMap[category]}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      currency: formData.currency,
      category: category,
      purpose: formData.purpose,
      images,
      location: { country: formData.country, city: formData.city },
      status: AdStatus.ACTIVE,
      userId: user.id,
      createdAt: new Date().toISOString(),
      featured: formData.featured,
      classification,
      isVerified: false,
      contactEmail: formData.email,
      contactPhone: formData.mobile,
      whatsappNumber: formData.mobile,
      details: {
        bestFeatures,
        ...(category === CategoryType.PROPERTIES ? {
          propertyType: formData.propertyType,
          area: `${formData.areaValue} ${formData.areaUnit}`,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          isReady: formData.isReady,
          isInstallment: formData.isInstallment
        } : category === CategoryType.VEHICLES ? {
          make: formData.make,
          model: formData.model,
          year: Number(formData.year),
          mileage: Number(formData.mileage),
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          condition: formData.condition as any
        } : {
          brand: formData.brand,
          condition: formData.condition as any,
          subCategory: formData.subCategory,
          warranty: formData.warranty
        })
      }
    };

    try {
      storageService.saveListing(newListing);
      await new Promise(r => setTimeout(r, 1000));
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (user.email === 'guest@trazot.com') return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8 px-4">
        
        <SectionCard icon={Sliders} title="Market Selection">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <ChipSelector 
                label="Asset Category"
                options={[
                  { label: 'Properties', value: CategoryType.PROPERTIES },
                  { label: 'Vehicles', value: CategoryType.VEHICLES },
                  { label: 'Electronics', value: CategoryType.ELECTRONICS },
                  { label: 'General', value: CategoryType.GENERAL },
                ]}
                value={category}
                onChange={(v) => setCategory(v)}
              />
              <ChipSelector 
                label="Trade Purpose"
                options={[
                  { label: 'For Sale', value: ListingPurpose.SALE },
                  { label: 'For Rent', value: ListingPurpose.RENT },
                  { label: 'Wanted', value: ListingPurpose.WANTED },
                ]}
                value={formData.purpose}
                onChange={(v) => setFormData(p => ({ ...p, purpose: v }))}
              />
            </div>
            
            <div className="space-y-4">
              <InputRow label="Asking Price" icon={TagIcon}>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    name="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="000" 
                    className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none" 
                  />
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-18 bg-gray-50 border-none rounded-xl p-3 text-[9px] font-black outline-none cursor-pointer">
                    {['PKR', 'AED', 'USD', 'INR', 'SAR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </InputRow>
              <InputRow label="Contact Mobile" icon={Smartphone}>
                <input 
                  type="text" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+92 XXX XXXXXXX" 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none" 
                />
              </InputRow>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={MapPin} title="Geography">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <InputRow label="Country" icon={Globe}>
                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none appearance-none cursor-pointer">
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </InputRow>
              <InputRow label="City" icon={MapPin}>
                <select name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none appearance-none cursor-pointer">
                  <option value="">Select City</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </InputRow>
              <InputRow label="Area / Society" icon={Search} className="col-span-2">
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: DHA Phase 5..." 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none" 
                />
              </InputRow>
           </div>
        </SectionCard>

        {category === CategoryType.PROPERTIES && (
          <SectionCard icon={Building2} title="Property Matrix">
             <div className="space-y-4">
              <ChipSelector 
                label="Class"
                options={['Home', 'Plots', 'Land', 'Commercial']}
                value={propertyMainType}
                onChange={(v) => setPropertyMainType(v as any)}
              />
              <div className="flex flex-wrap gap-1.5">
                {dynamicPropertyTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, propertyType: type.value }))}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${
                      formData.propertyType === type.value 
                      ? 'bg-[#17933f] text-white border-transparent shadow-md' 
                      : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {type.label === 'Agricultural Land' && <Trees className="w-3 h-3 inline mr-1" />}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard icon={Star} title="Ad Boost Protocol">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                {isGCC ? <Coins className="w-5 h-5 text-[#17933f]" /> : <TrendingUp className="w-5 h-5 text-[#17933f]" />}
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-emerald-950">Featured Asset</span>
                <span className="block text-[8px] text-emerald-600 font-bold uppercase tracking-widest">
                  {isGCC ? 'GCC Rate: 2 USDT' : 'Premium Visibility • 2 Credits'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#17933f]"></div>
            </label>
          </div>
        </SectionCard>

        <SectionCard icon={FileText} title="Brief & Media">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Content Optimization</h3>
            <button 
              type="button"
              onClick={handleAIOptimize}
              disabled={aiOptimizing}
              className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
              {aiOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              {aiOptimizing ? 'AI Thinking...' : 'AI Optimize Content'}
            </button>
          </div>

          <InputRow label="Headline" icon={TagIcon}>
            <input 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Luxury 5-Bed Villa in DHA Phase 8" 
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none" 
            />
          </InputRow>
          <InputRow label="Full Brief" icon={FileText}>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3} 
              placeholder="Provide professional details about your asset..." 
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-medium outline-none" 
            />
          </InputRow>

          <InputRow label="Best Features" icon={Gem}>
             <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleAddFeature}
                    placeholder="Ex: Corner Plot, Sea View, 24/7 Security..." 
                    className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none" 
                  />
                  <button type="button" onClick={handleAddFeature} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                     <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {bestFeatures.map(tag => (
                     <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setBestFeatures(bestFeatures.filter(t => t !== tag))} />
                     </span>
                   ))}
                </div>
             </div>
          </InputRow>
          
          <div className="pt-2">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Asset Imagery</label>
            <div 
              onClick={() => document.getElementById('file-upload')?.click()}
              className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-gray-50/20 cursor-pointer hover:bg-emerald-50/20 transition-all"
            >
              <input type="file" id="file-upload" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#17933f] shadow-sm">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-[9px] font-black uppercase text-emerald-950">Add Photos (Up to 10)</p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-md hover:bg-red-500"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
             <AlertTriangle className="w-5 h-5 shrink-0" />
             <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-5 mt-8">
          <div className="flex items-center gap-2 bg-gray-100/30 px-4 py-2 rounded-full border border-gray-100">
             {loading ? <CloudLightning className="w-3 h-3 text-emerald-600 animate-pulse" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
             <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
               {loading ? 'Synchronizing Global Node...' : 'Secure Identity Protocol Active'}
             </span>
          </div>
          <button 
            type="submit" 
            disabled={loading || !formData.title || !formData.price || !formData.mobile}
            className="w-full bg-[#17933f] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/30 hover:bg-[#127a34] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Transmitting Asset...' : 'Authorize Global Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
