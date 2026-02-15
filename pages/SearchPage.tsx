
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
  Check
} from 'lucide-react';
import ListingCard from '../components/ListingCard.tsx';
import { storageService } from '../services/storageService.ts';
import { locationService, Coords } from '../services/locationService.ts';
import { CategoryType, ListingPurpose, AdStatus, Listing, SavedSearch } from '../types.ts';
import { COUNTRIES, CITIES } from '../constants.ts';

declare const L: any;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') as CategoryType;
  const initialCountry = searchParams.get('country');
  const initialSearch = searchParams.get('q') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [category, setCategory] = useState<CategoryType | 'All'>(initialCategory || 'All');
  const [purpose, setPurpose] = useState<ListingPurpose | 'All'>('All');
  const [country, setCountry] = useState<string>(initialCountry || 'All');
  const [city, setCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPin, setSelectedPin] = useState<Listing | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-refresh logic to see new uploads from other users
  useEffect(() => {
    const handleSync = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const listings = useMemo(() => {
    return storageService.getListings().filter(l => {
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
      return matchStatus && matchCat && matchPurpose && matchCountry && matchCity && matchSearch;
    });
  }, [category, purpose, country, city, searchQuery, refreshTrigger]);

  const resetFilters = () => {
    setCategory('All');
    setPurpose('All');
    setCountry('All');
    setCity('All');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-8">
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-emerald-950">
                <Filter className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Filters</h2>
              </div>
              <button 
                onClick={resetFilters}
                className="p-2 text-gray-400 hover:text-emerald-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market</label>
                <select 
                  value={country} 
                  onChange={(e) => { setCountry(e.target.value); setCity('All'); }} 
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none appearance-none"
                >
                  <option value="All">Global Market</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="border-t border-gray-50 pt-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</label>
                <div className="space-y-1.5">
                  <button onClick={() => setCategory('All')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-500'}`}>Show All</button>
                  {Object.values(CategoryType).map(cat => <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-500'}`}>{cat}</button>)}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-serif-italic text-emerald-950">
                {category === 'All' ? 'Market' : category} <span className="text-emerald-600">Inventory</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{listings.length} Live Results</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search LED, 43 inch, Smart TV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map(item => <ListingCard key={item.id} listing={item} />)
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-gray-100 shadow-inner">
                <SearchIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Listing Synchronization Active</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Searching the global ledger for matching assets...</p>
                <button onClick={resetFilters} className="mt-8 text-emerald-600 font-black uppercase tracking-widest text-[10px] hover:underline">Clear Search</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
