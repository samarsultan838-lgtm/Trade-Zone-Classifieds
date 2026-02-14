
import { COUNTRIES, CITIES } from '../constants';

export interface Coords {
  lat: number;
  lng: number;
}

export const locationService = {
  detectUserCountry: (): string => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Mapping common timezones to our supported countries
      if (timezone.includes('Karachi')) return 'Pakistan';
      if (timezone.includes('Kolkata')) return 'India';
      if (timezone.includes('Dubai') || timezone.includes('Abu_Dhabi')) return 'United Arab Emirates';
      if (timezone.includes('Riyadh')) return 'Saudi Arabia';
      if (timezone.includes('Qatar')) return 'Qatar';
      if (timezone.includes('Kuwait')) return 'Kuwait';
      if (timezone.includes('Muscat')) return 'Oman';
      if (timezone.includes('Bahrain')) return 'Bahrain';

      // Fallback to browser language
      const lang = navigator.language;
      if (lang.includes('ur') || lang.includes('PK')) return 'Pakistan';
      if (lang.includes('hi') || lang.includes('IN')) return 'India';
      if (lang.includes('ar-AE')) return 'United Arab Emirates';
      if (lang.includes('ar-SA')) return 'Saudi Arabia';

    } catch (e) {
      console.error("Location detection failed", e);
    }
    return 'United Arab Emirates';
  },

  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
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
    return R * c;
  },

  getDefaultCity: (country: string): string => {
    return CITIES[country]?.[0] || '';
  }
};
