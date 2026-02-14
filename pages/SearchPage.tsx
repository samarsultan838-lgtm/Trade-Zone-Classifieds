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
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street'>('street');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const resetFilters = () => {
    setCategory('All');
    setPurpose('All');
    setCountry('All');
    setCity('All');
    setSearchQuery('');
    setIsNearMeActive(false);
    setSearchParams({});
    setSaveStatus('idle');
  };

  const handleSaveSearch = () => {
    const filters = {
      category,
      purpose,
      country,
      city,
      searchQuery,
      isNearMeActive
    };

    let name = category !== 'All' ? category : 'All Assets';
    if (city !== 'All') name += ` in ${city}`;
    else if (country !== 'All') name += ` in ${country}`;
    if (searchQuery) name += ` matching "${searchQuery}"`;

    const newSavedSearch: SavedSearch = {
      id: Math.random().toString(36).substring(7),
      name,
      filters,
      createdAt: new Date().toISOString()
    };

    storageService.saveSearch(newSavedSearch);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const listings = useMemo(() => {
    return storageService.getListings().filter(l => {
      const matchStatus = l.status === AdStatus.ACTIVE;
      const matchCat = category === 'All' || l.category === category;
      const matchPurpose = purpose === 'All' || l.purpose === purpose;
      const matchSearch = !searchQuery || 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (isNearMeActive && userCoords) {
        const distance = locationService.calculateDistance(userCoords, {
          lat: l.location.lat || 25.276987, 
          lng: l.location.lng || 55.296249
        });
        return matchStatus && matchCat && matchPurpose && matchSearch && distance < 100;
      }

      const matchCountry = country === 'All' || l.location.country === country;
      const matchCity = city === 'All' || l.location.city === city;
      return matchStatus && matchCat && matchPurpose && matchCountry && matchCity && matchSearch;
    });
  }, [category, purpose, country, city, isNearMeActive, userCoords, searchQuery]);

  const handleLocateMe = async () => {
    setGpsLoading(true);
    try {
      const position = await locationService.getCurrentPosition();
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserCoords(coords);
      
      if (mapRef.current) {
        mapRef.current.setView([coords.lat, coords.lng], 14);
      }
      
      if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
      
      const customIcon = L.divIcon({
        className: 'gps-marker',
        html: '<div class="gps-dot"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      
      userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(mapRef.current);
    } catch (err) {
      console.error("GPS Access Denied:", err);
      alert("Please enable location services in your browser settings to use active GPS features.");
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current) {
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          center: [25.276987, 55.296249],
          zoom: 12
        });

        const streetTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB'
        });
        
        const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri'
        });

        if (mapStyle === 'street') streetTiles.addTo(mapRef.current);
        else satelliteTiles.addTo(mapRef.current);

        mapRef.current._tileLayers = { street: streetTiles, satellite: satelliteTiles };
      }

      Object.keys(mapRef.current._tileLayers).forEach(k => mapRef.current.removeLayer(mapRef.current._tileLayers[k]));
      mapRef.current._tileLayers[mapStyle].addTo(mapRef.current);

      markersRef.current.forEach(m => mapRef.current.removeLayer(m));
      markersRef.current = [];

      listings.forEach(l => {
        const lat = l.location.lat || (25.2 + Math.random() * 0.1);
        const lng = l.location.lng || (55.2 + Math.random() * 0.1);

        const pinIcon = L.divIcon({
          className: 'custom-pin',
          html: `
            <div class="bg-white border-2 border-[#17933f] px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 transform -translate-y-4 hover:scale-110 transition-all">
              <span class="text-[10px] font-black text-[#17933f]">${l.currency} ${(l.price/1000).toFixed(0)}k</span>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r-2 border-b-2 bg-white border-[#17933f]"></div>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedPin(l));
        markersRef.current.push(marker);
      });
      
      if (isNearMeActive && userCoords && listings.length > 0) {
        const bounds = L.latLngBounds(listings.map(l => [l.location.lat || 25, l.location.lng || 55]));
        bounds.extend([userCoords.lat, userCoords.lng]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [viewMode, mapStyle, listings, isNearMeActive, userCoords]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className={`w-full md:w-64 space-y-8 ${viewMode === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-emerald-950">
                <Filter className="w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Filters</h2>
              </div>
              <button 
                onClick={resetFilters}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="Clear All Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              <button 
                onClick={() => {
                  if (!isNearMeActive) handleLocateMe();
                  setIsNearMeActive(!isNearMeActive);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                  isNearMeActive ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Navigation className={`w-4 h-4 ${isNearMeActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-bold">Near Me</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isNearMeActive ? 'bg-white/20' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isNearMeActive ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market</label>
                <select 
                  value={country} 
                  onChange={(e) => { setCountry(e.target.value); setCity('All'); }} 
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="All">Global Market</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {country !== 'All' && (
                  <select 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer animate-in fade-in"
                  >
                    <option value="All">All Cities</option>
                    {CITIES[country]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              <div className="border-t border-gray-50 pt-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</label>
                <div className="space-y-1.5">
                  <button onClick={() => setCategory('All')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-500'}`}>Show All Assets</button>
                  {Object.values(CategoryType).map(cat => <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-500'}`}>{cat}</button>)}
                </div>
              </div>

              <button 
                onClick={handleSaveSearch}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-sm ${
                  saveStatus === 'saved' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-gray-100 text-emerald-950 hover:bg-emerald-50'
                }`}
              >
                {saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {saveStatus === 'saved' ? 'Search Saved' : 'Save This Search'}
                </span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-serif-italic text-emerald-950">
                {country === 'All' ? 'Global' : country} <span className="text-emerald-600">Inventory</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{listings.length} Results Available</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Keyword search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#17933f] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#17933f] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <ListIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-[#17933f] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="relative h-[calc(100vh-250px)] min-h-[500px] bg-gray-100 rounded-[40px] overflow-hidden shadow-2xl border border-gray-200 group">
              <div ref={mapContainerRef} className="absolute inset-0 z-0" />
              <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/50">
                  <button onClick={() => setMapStyle('street')} className={`w-12 h-12 flex items-center justify-center border-b border-gray-100 transition-all ${mapStyle === 'street' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600'}`}><LayoutGrid className="w-5 h-5" /></button>
                  <button onClick={() => setMapStyle('satellite')} className={`w-12 h-12 flex items-center justify-center transition-all ${mapStyle === 'satellite' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600'}`}><Layers className="w-5 h-5" /></button>
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/50">
                  <button onClick={() => mapRef.current?.zoomIn()} className="w-12 h-12 flex items-center justify-center border-b border-gray-100 text-gray-400 hover:text-emerald-600"><Plus className="w-5 h-5" /></button>
                  <button onClick={() => mapRef.current?.zoomOut()} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-emerald-600"><Minus className="w-5 h-5" /></button>
                </div>
                <button 
                  onClick={handleLocateMe}
                  className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 ${
                    userCoords ? 'bg-[#17933f] text-white' : 'bg-white/90 backdrop-blur-md text-emerald-950 hover:bg-white'
                  }`}
                >
                  <Navigation className={`w-5 h-5 ${gpsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {selectedPin && (
                <div className="absolute inset-x-0 bottom-0 lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2 z-30 flex justify-center p-4">
                  <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 relative w-full lg:max-w-md animate-in slide-in-from-bottom-10 duration-500">
                    <button onClick={() => setSelectedPin(null)} className="absolute top-4 right-4 p-2 bg-black/10 backdrop-blur-md rounded-full text-white hover:bg-black/40 z-[40]">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/3 relative h-40 sm:h-auto">
                        <img src={selectedPin.images[0]} className="w-full h-full object-cover" />
                      </div>
                      <Link to={`/listing/${selectedPin.id}`} className="flex-1 p-5 flex flex-col justify-between bg-white hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="text-emerald-600 font-black text-xl mb-1">{selectedPin.currency} {selectedPin.price.toLocaleString()}</div>
                          <h4 className="font-bold text-emerald-950 text-sm line-clamp-1 mb-2">{selectedPin.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {listings.length > 0 ? (
                listings.map(item => <ListingCard key={item.id} listing={item} />)
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-gray-100 shadow-inner">
                  <div className="mb-4 text-gray-200 flex justify-center"><Filter className="w-20 h-20" /></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                  <button onClick={resetFilters} className="text-emerald-600 font-black uppercase tracking-widest text-[10px] hover:underline">Clear all filters to show all assets</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;