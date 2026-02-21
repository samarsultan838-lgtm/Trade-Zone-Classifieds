import { COUNTRIES, CITIES } from '../constants';

export interface Coords {
  lat: number;
  lng: number;
}

export interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  coordinates: Coords;
  timezone: string;
}

const API_BASE = 'https://trazot.com/api';

export const locationService = {
  // Detect user location using API
  detectUserLocation: async (): Promise<LocationData> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE}/location/detect.php`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Location API failed');
      }
      
      const data = await response.json();
      return {
        country: data.country,
        countryCode: data.countryCode,
        city: data.city,
        region: data.region,
        coordinates: data.coordinates,
        timezone: data.timezone
      };
    } catch (error) {
      console.error('Error detecting location via API:', error);
      // Fallback to client-side detection
      return this.detectUserLocationFallback();
    }
  },

  // Fallback location detection (client-side)
  detectUserLocationFallback: (): LocationData => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Mapping common timezones to our supported countries
      const timezoneMap: Record<string, { country: string; code: string; city: string; coords: Coords }> = {
        'Karachi': { country: 'Pakistan', code: 'PK', city: 'Karachi', coords: { lat: 24.8607, lng: 67.0011 } },
        'Kolkata': { country: 'India', code: 'IN', city: 'Kolkata', coords: { lat: 22.5726, lng: 88.3639 } },
        'Dubai': { country: 'United Arab Emirates', code: 'AE', city: 'Dubai', coords: { lat: 25.2048, lng: 55.2708 } },
        'Abu_Dhabi': { country: 'United Arab Emirates', code: 'AE', city: 'Abu Dhabi', coords: { lat: 24.4539, lng: 54.3773 } },
        'Riyadh': { country: 'Saudi Arabia', code: 'SA', city: 'Riyadh', coords: { lat: 24.7136, lng: 46.6753 } },
        'Qatar': { country: 'Qatar', code: 'QA', city: 'Doha', coords: { lat: 25.2854, lng: 51.5310 } },
        'Kuwait': { country: 'Kuwait', code: 'KW', city: 'Kuwait City', coords: { lat: 29.3759, lng: 47.9774 } },
        'Muscat': { country: 'Oman', code: 'OM', city: 'Muscat', coords: { lat: 23.5880, lng: 58.3829 } },
        'Bahrain': { country: 'Bahrain', code: 'BH', city: 'Manama', coords: { lat: 26.2285, lng: 50.5860 } }
      };

      for (const [tzKey, data] of Object.entries(timezoneMap)) {
        if (timezone.includes(tzKey)) {
          return {
            country: data.country,
            countryCode: data.code,
            city: data.city,
            region: data.city,
            coordinates: data.coords,
            timezone: timezone
          };
        }
      }

      // Fallback to browser language
      const lang = navigator.language;
      const langMap: Record<string, LocationData> = {
        'ur': { country: 'Pakistan', countryCode: 'PK', city: 'Karachi', region: 'Sindh', coordinates: { lat: 24.8607, lng: 67.0011 }, timezone: 'Asia/Karachi' },
        'hi': { country: 'India', countryCode: 'IN', city: 'Mumbai', region: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 }, timezone: 'Asia/Kolkata' },
        'ar-AE': { country: 'United Arab Emirates', countryCode: 'AE', city: 'Dubai', region: 'Dubai', coordinates: { lat: 25.2048, lng: 55.2708 }, timezone: 'Asia/Dubai' },
        'ar-SA': { country: 'Saudi Arabia', countryCode: 'SA', city: 'Riyadh', region: 'Riyadh', coordinates: { lat: 24.7136, lng: 46.6753 }, timezone: 'Asia/Riyadh' }
      };

      for (const [langKey, data] of Object.entries(langMap)) {
        if (lang.startsWith(langKey)) {
          return data;
        }
      }

    } catch (e) {
      console.error("Location detection failed", e);
    }
    
    // Default to UAE
    return {
      country: 'United Arab Emirates',
      countryCode: 'AE',
      city: 'Dubai',
      region: 'Dubai',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      timezone: 'Asia/Dubai'
    };
  },

  // Get cities for a country
  getCitiesForCountry: async (country: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE}/location/cities.php?country=${encodeURIComponent(country)}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      return data.cities || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Fallback to constant
      return CITIES[country]?.[0] || [];
    }
  },

  // Get all countries
  getCountries: async (): Promise<Record<string, string[]>> => {
    try {
      const response = await fetch(`${API_BASE}/location/cities.php`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      return data.cities || {};
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to constant
      return COUNTRIES;
    }
  },

  // Get coordinates for a city
  getCityCoordinates: async (city: string): Promise<Coords | null> => {
    try {
      const response = await fetch(`${API_BASE}/location/coordinates.php?city=${encodeURIComponent(city)}`);
      if (!response.ok) throw new Error('Failed to fetch coordinates');
      const data = await response.json();
      return data.coordinates || null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  },

  // Get user's current position via browser geolocation
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  },

  // Calculate distance between two coordinates in km (Haversine formula)
  calculateDistance: (c1: Coords, c2: Coords): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLng = (c2.lng - c1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  },

  // Get nearby listings based on user location
  getNearbyListings: async (coords: Coords, radius: number = 50): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE}/location/nearby.php?lat=${coords.lat}&lng=${coords.lng}&radius=${radius}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby listings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
      return { listings: [], cities: [] };
    }
  },

  // Get default city for a country
  getDefaultCity: (country: string): string => {
    return CITIES[country]?.[0] || 'Dubai';
  },

  // Format distance for display
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance} km`;
  }
};

export default locationService;
