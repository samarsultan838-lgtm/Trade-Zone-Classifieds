
import { Listing, User, AdStatus, NewsArticle, SavedSearch } from '../types.ts';
import { INITIAL_LISTINGS } from '../constants.ts';

const LISTINGS_KEY = 'tz_listings';
const USER_KEY = 'tz_user';
const USERS_REGISTRY_KEY = 'tz_users_registry';
const NEWS_KEY = 'tz_news';
const ADMIN_CRED_KEY = 'tz_admin_cred';
const USED_IDENTIFIERS_KEY = 'tz_used_identifiers';
const DEVICE_CLAIMED_KEY = 'tz_device_claimed_free';
const SUBSCRIBERS_KEY = 'tz_subscribers';
const SAVED_SEARCHES_KEY = 'tz_saved_searches';

/**
 * GLOBAL MARKETPLACE NODE
 * Using a public relay to ensure cross-device visibility for all users.
 */
const CLOUD_NODE_URL = 'https://api.jsonbin.io/v3/b/67bd541cacd3cb34a8ef7be6'; 
const MASTER_KEY = '$2a$10$7zV7f1pL6MvD9.x1xX1Z1.rO9xP7f9f9f9f9f9f9f9f9f9f9f9'; 

export const storageService = {
  // --- GLOBAL SYNCHRONIZATION ENGINE ---

  syncWithCloud: async (): Promise<'synced' | 'local' | 'error'> => {
    try {
      const response = await fetch(`${CLOUD_NODE_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });

      if (!response.ok) return 'local';

      const result = await response.json();
      const cloudData = result.record;

      if (cloudData && Array.isArray(cloudData.listings)) {
        // Current listings in this specific browser
        const localListings = storageService.getListings();
        const listingMap = new Map<string, Listing>();
        
        // 1. Start with Hardcoded Demo Listings (The baseline)
        INITIAL_LISTINGS.forEach(l => listingMap.set(l.id, l));
        
        // 2. Add Cloud Listings (These include other users' uploads and the admin's approvals)
        cloudData.listings.forEach((cL: Listing) => {
          listingMap.set(cL.id, cL);
        });

        // 3. Add Local Listings (Current user's recent uploads)
        // This ensures the 43 inch LED is preserved even if the cloud hasn't synced it yet
        localListings.forEach(l => {
          // If the cloud version is older or doesn't exist, local version wins for the uploader
          const cloudVersion = listingMap.get(l.id);
          if (!cloudVersion || new Date(l.createdAt) > new Date(cloudVersion.createdAt)) {
            listingMap.set(l.id, l);
          }
        });

        const merged = Array.from(listingMap.values());
        // Sort by date (newest first)
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(merged));
      }

      return 'synced';
    } catch (e) {
      console.warn("Sync failed. Operating in Local Mode.");
      return 'local';
    }
  },

  broadcastToCloud: async () => {
    try {
      // Get the absolute latest state from local storage before pushing
      const listings = storageService.getListings();
      const news = storageService.getNews();

      await fetch(CLOUD_NODE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify({ listings, news, lastUpdate: new Date().toISOString() })
      });
      
      // Notify other components in the same tab/window
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Cloud Broadcast Error:", e);
    }
  },

  // --- STANDARD DATA RETRIEVAL ---

  getListings: (): Listing[] => {
    const stored = localStorage.getItem(LISTINGS_KEY);
    if (!stored) {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_LISTINGS;
    }
  },

  saveListing: (listing: Listing) => {
    const listings = storageService.getListings();
    const existingIndex = listings.findIndex(l => l.id === listing.id);

    if (existingIndex !== -1) {
      listings[existingIndex] = listing;
    } else {
      listings.unshift(listing);
    }
    
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    // Trigger global update immediately
    storageService.broadcastToCloud();
  },

  deleteListing: (id: string) => {
    const listings = storageService.getListings().filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    storageService.broadcastToCloud();
  },

  getNews: (): NewsArticle[] => {
    const stored = localStorage.getItem(NEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveNews: (article: NewsArticle) => {
    const news = storageService.getNews();
    news.unshift(article);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    storageService.broadcastToCloud();
  },

  deleteNews: (id: string) => {
    const news = storageService.getNews().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    storageService.broadcastToCloud();
  },

  getCurrentUser: (): User => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substring(7),
        name: 'Guest Merchant',
        email: 'guest@trazot.com',
        isPremium: false,
        credits: 5,
        joinedAt: new Date().toISOString()
      };
      storageService.updateUser(newUser);
      return newUser;
    }
    return JSON.parse(stored);
  },

  updateUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getSavedSearches: () => JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]'),
  saveSearch: (s: any) => {
    const existing = storageService.getSavedSearches();
    existing.unshift(s);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(existing));
  },
  deleteSavedSearch: (id: string) => {
    const filtered = storageService.getSavedSearches().filter((s: any) => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
  },
  isIdentifierUsed: (email: string) => ({ used: false, type: '' }),
  registerIdentifier: (email: string, phone: string) => {},

  // --- ADMIN AUTHENTICATION ---

  getAdminAuth: () => {
    const stored = localStorage.getItem(ADMIN_CRED_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setAdminAuth: (password: string, recoveryKey: string) => {
    localStorage.setItem(ADMIN_CRED_KEY, JSON.stringify({ password, recoveryKey }));
  },

  resetAdminPassword: (recoveryKey: string, newPassword: string): boolean => {
    const creds = storageService.getAdminAuth();
    if (creds && creds.recoveryKey === recoveryKey) {
      storageService.setAdminAuth(newPassword, recoveryKey);
      return true;
    }
    return false;
  }
};
