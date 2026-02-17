
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  LayoutGrid, 
  List as ListIcon, 
  Map as MapIcon, 
  Filter, 
  MapPin, 
  X, 
  Plus, 
  Minus, 
  Navigation, 
  Layers, 
  Search as SearchIcon,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Bookmark,
  Check,
  Maximize2,
  Globe,
  Bed,
  Bath,
  Maximize,
  Coins,
  ChevronDown,
  ArrowRight,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  Building2,
  Clock
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { locationService, Coords } from '../services/locationService.ts';
import { CategoryType, ListingPurpose, AdStatus, Listing, SavedSearch, PropertyType } from '../types.ts';
import { COUNTRIES, CITIES } from '../constants.ts';

declare const L: any;

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  activeCount?: number;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children, isOpen = true, activeCount = 0 }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="border-b border-gray-50 py-5 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
        type="button"
      >
        <div className="flex items-center gap-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors cursor-pointer">{title}</label>
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-emerald-100 text-emerald-600 text-[8px] font-black flex items-center justify-center rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${open ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>
      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as CategoryType;
  const initialCountry = searchParams.get('country');
  const initialSearch = searchParams.get('q') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  const [category, setCategory] = useState<CategoryType | 'All'>(initialCategory || 'All');
  const [purpose, setPurpose] = useState<ListingPurpose | 'All'>('All');
  const [country, setCountry] = useState<string>(initialCountry || 'All');
  const [city, setCity] = useState<string>('All');
  const [society, setSociety] = useState<string>(''); // Hyper-local area filter
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [beds, setBeds] = useState<string>('Any');
  const [baths, setBaths] = useState<string>('Any');
  const [propType, setPropType] = useState<PropertyType | 'Any'>('Any');

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const handleSync = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const listings = useMemo(() => {
    const filtered = storageService.getListings().filter(l => {
      const matchStatus = l.status === AdStatus.ACTIVE;
      const matchCat = category === 'All' || l.category === category;
      const matchPurpose = purpose === 'All' || l.purpose === purpose;
      const query = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        l.title.toLowerCase().includes(query) || 
        l.description.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query) ||
        l.location.city.toLowerCase().includes(query);
      
      const matchCountry = country === 'All' || l.location.country === country;
      const matchCity = city === 'All' || l.location.city === city;
      const matchSociety = !society || l.location.society?.toLowerCase().includes(society.toLowerCase());

      const matchMinPrice = !minPrice || l.price >= Number(minPrice);
      const matchMaxPrice = !maxPrice || l.price <= Number(maxPrice);
      
      let matchPropertyFilters = true;
      if (l.category === CategoryType.PROPERTIES) {
        const lArea = parseFloat(l.details.area || '0');
        const matchMinArea = !minArea || lArea >= Number(minArea);
        const matchMaxArea = !maxArea || lArea <= Number(maxArea);
        
        const lBeds = String(l.details.bedrooms || '');
        const matchBeds = beds === 'Any' || (beds === '5+' ? parseInt(lBeds) >= 5 : lBeds === beds);
        
        const lBaths = String(l.details.bathrooms || '');
        const matchBaths = baths === 'Any' || (baths === '4+' ? parseInt(lBaths) >= 4 : lBaths === baths);
        
        const matchPropType = propType === 'Any' || l.details.propertyType === propType;
        
        matchPropertyFilters = matchMinArea && matchMaxArea && matchBeds && matchBaths && matchPropType;
      }

      return matchStatus && matchCat && matchPurpose && matchCountry && matchCity && matchSociety &&
             matchSearch && matchMinPrice && matchMaxPrice && matchPropertyFilters;
    });

    // CHRONO-SORT ENGINE: Invariant - Featured always appears before Standard
    return filtered.sort((a, b) => {
        // TIER 1: Featured Priority
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        // TIER 2: Selected Sort Logic within respective tiers
        if (sortBy === 'price_low') {
          return a.price - b.price;
        } else if (sortBy === 'price_high') {
          return b.price - a.price;
        } else {
          // Default: Newest first (Latest date and time)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });
  }, [category, purpose, country, city, society, searchQuery, sortBy, minPrice, maxPrice, minArea, maxArea, beds, baths, propType, refreshTrigger]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category !== 'All') count++;
    if (purpose !== 'All') count++;
    if (country !== 'All') count++;
    if (city !== 'All') count++;
    if (society) count++;
    if (minPrice || maxPrice) count++;
    if (minArea || maxArea) count++;
    if (beds !== 'Any') count++;
    if (baths !== 'Any') count++;
    if (propType !== 'Any') count++;
    return count;
  }, [category, purpose, country, city, society, minPrice, maxPrice, minArea, maxArea, beds, baths, propType]);

  const resetFilters = () => {
    setCategory('All');
    setPurpose('All');
    setCountry('All');
    setCity('All');
    setSociety('');
    setSearchQuery('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setBeds('Any');
    setBaths('Any');
    setPropType('Any');
    setSearchParams({});
  };

  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([31.5204, 74.3587], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    if (viewMode === 'map' && mapRef.current) {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      const mapListings = listings.filter(l => l.location.lat && l.location.lng);
      if (mapListings.length > 0) {
        const bounds = L.latLngBounds([]);
        mapListings.forEach(l => {
          const pos: [number, number] = [l.location.lat!, l.location.lng!];
          const marker = L.marker(pos).addTo(mapRef.current);
          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <img src="${l.images[0]}" class="w-full h-24 object-cover rounded-lg mb-2" />
              <h4 class="font-bold text-emerald-950 text-xs mb-1">${l.title}</h4>
              <p class="text-emerald-600 font-black text-xs mb-2">${l.currency} ${l.price.toLocaleString()}</p>
              <a href="/#/listing/${l.id}" class="block text-center py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg">View Details</a>
            </div>
          `;
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
          bounds.extend(pos);
        });
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    return () => {
      if (viewMode !== 'map' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [viewMode, listings]);

  const FilterSidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-emerald-950">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <h2 className="font-black text-xs uppercase tracking-widest">Market Filters</h2>
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={resetFilters}
            className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
            title="Reset All Protocols"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>
      
      <div className="space-y-1">
        <FilterSection title="Asset Class" activeCount={category === 'All' ? 0 : 1}>
          <div className="grid grid-cols-1 gap-1.5">
            <button 
              onClick={() => setCategory('All')} 
              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === 'All' ? 'bg-emerald-950 text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
            >
              All Assets
            </button>
            {Object.values(CategoryType).map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)} 
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Region & Sector" activeCount={(country !== 'All' || city !== 'All' || society !== '') ? 1 : 0}>
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <select 
                value={country} 
                onChange={(e) => { setCountry(e.target.value); setCity('All'); }} 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold outline-none appearance-none hover:bg-white focus:border-emerald-500 transition-all"
              >
                <option value="All">Global Ledger</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none" />
            </div>

            {country !== 'All' && (
              <div className="relative animate-in slide-in-from-top-1 duration-300">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold outline-none appearance-none hover:bg-white focus:border-emerald-500 transition-all"
                >
                  <option value="All">All Cities</option>
                  {(CITIES[country] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none" />
              </div>
            )}

            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input 
                type="text" 
                placeholder="Society / Area Name" 
                value={society}
                onChange={e => setSociety(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold outline-none hover:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Sort Protocols" activeCount={sortBy === 'newest' ? 0 : 1}>
           <div className="grid grid-cols-1 gap-1.5">
             <button 
               onClick={() => setSortBy('newest')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'newest' ? 'bg-emerald-950 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
             >
               <Clock className="w-3.5 h-3.5" /> Latest Arrivals
             </button>
             <button 
               onClick={() => setSortBy('price_low')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'price_low' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
             >
               <ArrowDownNarrowWide className="w-3.5 h-3.5" /> Price: Low to High
             </button>
             <button 
               onClick={() => setSortBy('price_high')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortBy === 'price_high' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
             >
               <ArrowUpWideNarrow className="w-3.5 h-3.5" /> Price: High to Low
             </button>
           </div>
        </FilterSection>

        <FilterSection title="Price Threshold" activeCount={(minPrice || maxPrice) ? 1 : 0}>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={e => setMinPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-3 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-3 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Trade Intention" activeCount={purpose === 'All' ? 0 : 1}>
          <div className="grid grid-cols-2 gap-2">
            {['All', ...Object.values(ListingPurpose)].map(p => (
              <button 
                key={p} 
                onClick={() => setPurpose(p as any)}
                className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all text-center ${purpose === p ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-white border border-transparent hover:border-emerald-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </FilterSection>

        {category === CategoryType.PROPERTIES && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <FilterSection title="Architecture Type" activeCount={propType === 'Any' ? 0 : 1}>
              <div className="relative">
                <select 
                  value={propType} 
                  onChange={e => setPropType(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-[10px] font-black uppercase outline-none focus:border-emerald-500 appearance-none transition-all"
                >
                  <option value="Any">Any Architecture</option>
                  {Object.values(PropertyType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300 pointer-events-none" />
              </div>
            </FilterSection>

            <FilterSection title="Spatial Dimensions" activeCount={(minArea || maxArea) ? 1 : 0}>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Min Area" 
                    value={minArea} 
                    onChange={e => setMinArea(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-3 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Max Area" 
                    value={maxArea} 
                    onChange={e => setMaxArea(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-3 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </FilterSection>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex gap-3">
        <button 
          onClick={() => setIsFilterDrawerOpen(true)}
          className="bg-emerald-950 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 transition-transform"
        >
          <Filter className="w-4 h-4 text-emerald-500" />
          Protocols {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-950">Filters</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {FilterSidebarContent}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-80 shrink-0 space-y-8">
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm sticky top-24 overflow-y-auto max-h-[85vh] scrollbar-hide">
            {FilterSidebarContent}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <h1 className="text-3xl font-serif-italic text-emerald-950 leading-tight">
                  {category === 'All' ? 'Global Market' : category} <span className="text-emerald-600">Assets</span>
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {listings.length} Tiered Results
                  </p>
                </div>
              </div>

              <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-950 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-emerald-950 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="relative w-full md:w-[400px] group">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-50" />
              <input 
                type="text" 
                placeholder="Search Property, Vehicles, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-[28px] py-4 pl-14 pr-6 text-sm font-bold text-emerald-950 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {listings.length > 0 ? (
                listings.map(item => <ListingCard key={item.id} listing={item} />)
              ) : (
                <div className="col-span-full py-40 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100 shadow-inner">
                  <SearchIcon className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif-italic text-emerald-950 mb-2">No Matching Records Found</h3>
                  <button onClick={resetFilters} className="mt-12 px-10 py-4 bg-emerald-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-black transition-all shadow-xl">Reset Network Filters</button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm h-[650px]">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
