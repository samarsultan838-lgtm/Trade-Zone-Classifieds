import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationService, LocationData, Coords } from '../services/locationService';

interface LocationContextType {
  userLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: string[];
  distance: number | null;
  calculateDistanceTo: (coords: Coords) => number | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('United Arab Emirates');
  const [selectedCity, setSelectedCity] = useState<string>('Dubai');
  const [cities, setCities] = useState<string[]>([]);

  const loadUserLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const location = await locationService.detectUserLocation();
      setUserLocation(location);
      setSelectedCountry(location.country);
      setSelectedCity(location.city);
      
      // Load cities for the detected country
      const countryCities = await locationService.getCitiesForCountry(location.country);
      setCities(countryCities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
      // Fallback to UAE
      setSelectedCountry('United Arab Emirates');
      setSelectedCity('Dubai');
      setCities(['Dubai', 'Abu Dhabi', 'Sharjah']);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserLocation();
  }, []);

  useEffect(() => {
    // Load cities when country changes
    const loadCities = async () => {
      const countryCities = await locationService.getCitiesForCountry(selectedCountry);
      setCities(countryCities);
      
      // Set default city if current city not in list
      if (!countryCities.includes(selectedCity)) {
        setSelectedCity(countryCities[0] || '');
      }
    };
    
    if (selectedCountry) {
      loadCities();
    }
  }, [selectedCountry]);

  const refreshLocation = async () => {
    await loadUserLocation();
  };

  const calculateDistanceTo = (coords: Coords): number | null => {
    if (!userLocation?.coordinates) return null;
    return locationService.calculateDistance(userLocation.coordinates, coords);
  };

  return (
    <LocationContext.Provider value={{
      userLocation,
      isLoading,
      error,
      refreshLocation,
      selectedCountry,
      setSelectedCountry,
      selectedCity,
      setSelectedCity,
      cities,
      distance: null,
      calculateDistanceTo
    }}>
      {children}
    </LocationContext.Provider>
  );
};
