
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Filter, 
  ChevronDown, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Home as HomeIcon,
  Zap,
  Building,
  Map as MapIcon,
  GanttChartSquare,
  ShieldCheck,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { CategoryType, AdStatus, PropertyType, ListingPurpose } from '../types.ts';

const Homes: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'villa' | 'apartment' | 'commercial' | 'land'>('all');
  
  const allListings = useMemo(() => storageService.getListings(), []);

  const segments = [
    { id: 'all', label: 'All Property', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'villa', label: 'House / Villa', icon: <HomeIcon className="w-4 h-4" /> },
    { id: 'apartment', label: 'Flat / Apartment', icon: <Building className="w-4 h-4" /> },
    { id: 'commercial', label: 'Commercial', icon: <Building2 className="w-4 h-4" /> },
    { id: 'land', label: 'Plots / Land', icon: <MapIcon className="w-4 h-4" /> },
  ];

  // CLOSING THE GAP: Comprehensive Mapping of Database Enums to UI Segments
  const filteredListings = useMemo(() => {
    return allListings.filter(l => {
      if (l.category !== CategoryType.PROPERTIES || l.status !== AdStatus.ACTIVE) return false;
      
      const queryMatch = !searchQuery || 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.city.toLowerCase().includes(searchQuery.toLowerCase());

      if (!queryMatch) return false;

      const pType = l.details.propertyType;

      if (activeSegment === 'villa') {
        return [
          PropertyType.HOUSE, 
          PropertyType.VILLA, 
          PropertyType.TOWNHOUSE, 
          PropertyType.UPPER_PORTION, 
          PropertyType.LOWER_PORTION, 
          PropertyType.FARM_HOUSE
        ].includes(pType as PropertyType);
      }
      if (activeSegment === 'apartment') {
        return [
          PropertyType.FLAT, 
          PropertyType.APARTMENT, 
          PropertyType.STUDIO, 
          PropertyType.PENTHOUSE, 
          PropertyType.ROOM
        ].includes(pType as PropertyType);
      }
      if (activeSegment === 'commercial') {
        return [
          PropertyType.OFFICE, 
          PropertyType.SHOP, 
          PropertyType.WAREHOUSE, 
          PropertyType.FACTORY, 
          PropertyType.BUILDING
        ].includes(pType as PropertyType);
      }
      if (activeSegment === 'land') {
        return [
          PropertyType.RESIDENTIAL_PLOT, 
          PropertyType.COMMERCIAL_PLOT, 
          PropertyType.PLOT_FILE, 
          PropertyType.PLOT_FORM, 
          PropertyType.AGRICULTURAL_LAND, 
          PropertyType.INDUSTRIAL_LAND
        ].includes(pType as PropertyType);
      }
      return true; // "all" segment
    });
  }, [allListings, activeSegment, searchQuery]);

  const quickKeywords = {
    villa: ['Ready to Move', 'Luxury Villa', 'Direct Owner', 'New Villa', 'Townhouse', 'Farm House'],
    apartment: ['Dubai Marina', 'Downtown Dubai', 'Luxury Apartment', 'Studio', '1 Bedroom', 'Flat for Rent'],
    commercial: ['Retail Shop', 'Office Space', 'Warehouse', 'Business Sale', 'Showroom', 'Factory'],
    land: ['Freehold', 'Industrial Land', 'Farm Land', 'Corner Plot', 'Cheap Plot', 'Plot File']
  };

  const handleKeywordSearch = (keyword: string) => {
    setSearchQuery(keyword);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      
      {/* CINEMATIC PROPERTY HERO */}
      <section className="relative rounded-[48px] md:rounded-[64px] overflow-hidden bg-emerald-950 h-[500px] md:h-[600px] flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20 grayscale scale-105" 
            alt="Luxury Real Estate Hub" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-950/40 to-emerald-950" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Institutional Property Node
          </div>
          <h1 className="text-4xl md:text-7xl font-serif-italic text-white leading-[1.1] tracking-tight">
            The Elite <br />
            <span className="text-emerald-500">Property Ledger.</span>
          </h1>
          <p className="text-emerald-100/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Direct owner access and verified agency inventory across Dubai, UAE, and South Asian markets.
          </p>
          
          <div className="bg-white/10 backdrop-blur-3xl p-1.5 rounded-[28px] border border-white/10 max-w-2xl mx-auto flex items-center shadow-2xl">
             <div className="flex-1 relative flex items-center">
                <Search className="absolute left-5 w-4.5 h-4.5 text-emerald-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 'Villa in Dubai Marina', 'Plot File', 'Shop'..." 
                  className="w-full bg-white rounded-[22px] py-4 pl-14 pr-6 text-sm font-bold text-emerald-950 outline-none"
                />
             </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE SEGMENTATION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-10">
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => { setActiveSegment(seg.id as any); setSearchQuery(''); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                activeSegment === seg.id 
                ? 'bg-emerald-950 text-white border-emerald-950 shadow-2xl scale-105' 
                : 'bg-white text-gray-400 border-gray-100 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              {seg.icon}
              {seg.label}
            </button>
          ))}
        </div>

        {/* FAST-TRACK KEYWORDS BAR */}
        {activeSegment !== 'all' && (
          <div className="flex items-center gap-3 mb-10 animate-in slide-in-from-left-4 duration-500">
            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest shrink-0">Intelligence Filters:</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickKeywords[activeSegment as keyof typeof quickKeywords].map(keyword => (
                <button 
                  key={keyword}
                  onClick={() => handleKeywordSearch(keyword)}
                  className="whitespace-nowrap px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PROPERTY GRID */}
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-3">
               <Zap className="w-5 h-5 text-yellow-500" /> 
               {activeSegment === 'all' ? 'Featured Inventory' : segments.find(s => s.id === activeSegment)?.label}
             </h2>
             <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">
               {filteredListings.length} Transmission Nodes Found
             </p>
           </div>
           <button 
            onClick={() => navigate('/post-ad')}
            className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-500 transition-all"
           >
             Post My Property <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredListings.map(item => (
                <ListingCard key={item.id} listing={item} />
              ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[48px] py-24 text-center border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <GanttChartSquare className="w-10 h-10 text-gray-200" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Node Synchronization Required</h3>
             <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">No matching assets currently available for this segment in the global ledger.</p>
             <button onClick={() => { setActiveSegment('all'); setSearchQuery(''); }} className="mt-10 px-8 py-3 bg-emerald-950 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Reset Filters</button>
          </div>
        )}
      </section>

      {/* MARKET TRENDS WIDGET */}
      <section className="max-w-7xl mx-auto px-4 py-12">
         <div className="bg-emerald-950 rounded-[48px] p-8 md:p-16 text-white relative overflow-hidden shadow-4xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="flex-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-4 block">Regional Intelligence</span>
                  <h2 className="text-3xl md:text-5xl font-serif-italic mb-6">Property <span className="text-emerald-500">Market Velocity</span></h2>
                  <div className="grid grid-cols-2 gap-8 mt-12">
                     <div className="space-y-1">
                        <div className="text-2xl font-black text-white">Hyper-Liquid</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Dubai Luxury Segment</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-black text-white">+14.5%</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Riyadh Institutional Demand</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-black text-white">400M+</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Daily Relay Value (PKR)</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-black text-white">Elite</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Service Integrity Grade</div>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-auto">
                  <div className="bg-white rounded-[40px] p-10 text-center shadow-3xl text-emerald-950">
                     <TrendingUp className="w-12 h-12 text-emerald-600 mx-auto mb-6" />
                     <h4 className="text-xl font-bold mb-3 uppercase tracking-tight">Access Pro Intel</h4>
                     <p className="text-gray-500 text-xs font-medium mb-8">Receive weekly market heatmaps for Dubai and South Asia.</p>
                     <button onClick={() => navigate('/auth')} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500 transition-all">Join Pro Node</button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Homes;
