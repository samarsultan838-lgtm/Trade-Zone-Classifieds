import React, { useState } from 'react';
import { MapPin, ChevronDown, RefreshCw, Navigation } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const LocationSelector: React.FC = () => {
  const {
    userLocation,
    isLoading,
    error,
    refreshLocation,
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
    cities
  } = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const countries = [
    'Pakistan',
    'India',
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Kuwait',
    'Oman',
    'Bahrain'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Detecting location...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:border-emerald-500 transition-all"
      >
        <MapPin className="w-4 h-4 text-emerald-600" />
        <span className="font-medium">{selectedCity}, {selectedCountry}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-emerald-950">Select Location</h3>
            <button
              onClick={refreshLocation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Detect my location"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {userLocation && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-xl">
              <p className="text-xs text-emerald-600 font-medium mb-1">Detected Location</p>
              <p className="text-sm font-bold text-emerald-950">
                {userLocation.city}, {userLocation.country}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
          >
            Apply Location
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
