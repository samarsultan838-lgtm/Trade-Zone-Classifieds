
import { Listing, User, AdStatus, NewsArticle, SavedSearch } from '../types.ts';
import { INITIAL_LISTINGS } from '../constants.ts';

const LISTINGS_KEY = 'tz_listings';
const USER_KEY = 'tz_user';
const USERS_REGISTRY_KEY = 'tz_users_registry';
const NEWS_KEY = 'tz_news';
const ADMIN_CRED_KEY = 'tz_admin_cred';
const SAVED_SEARCHES_KEY = 'tz_saved_searches';

// EMERGENCY OVERRIDE KEY
export const MASTER_EMERGENCY_KEY = 'TRAZOT-GLOBAL-RECOVERY-2025';

/**
 * GLOBAL MARKETPLACE NODE - JSONBin.io Relay
 */
const CLOUD_NODE_URL = 'https://api.jsonbin.io/v3/b/67bd541cacd3cb34a8ef7be6'; 
const MASTER_KEY = '$2a$10$7zV7f1pL6MvD9.x1xX1Z1.rO9xP7f9f9f9f9f9f9f9f9f9f9f9'; 

let pollingInterval: any = null;

export const storageService = {
  // --- CORE SYNC ENGINE ---

  startBackgroundSync: () => {
    if (pollingInterval) return;
    storageService.syncWithCloud();
    pollingInterval = setInterval(() => {
      storageService.syncWithCloud();
    }, 60000); 
  },

  stopBackgroundSync: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  syncWithCloud: async (): Promise<'synced' | 'local' | 'error'> => {
    try {
      const response = await fetch(`${CLOUD_NODE_URL}/latest`, {
        headers: { 
          'X-Master-Key': MASTER_KEY,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) return 'local';

      const result = await response.json();
      const cloudData = result.record;

      if (cloudData) {
        // Sync Listings
        const localListings = storageService.getListings();
        const listingMap = new Map<string, Listing>();
        (cloudData.listings || []).forEach((cL: Listing) => listingMap.set(cL.id, cL));
        localListings.forEach(lL => {
          const cL = listingMap.get(lL.id);
          if (!cL || new Date(lL.createdAt) > new Date(cL.createdAt)) {
            listingMap.set(lL.id, lL);
          }
        });
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(Array.from(listingMap.values())));

        // Sync Users
        const localUsers = storageService.getUsers();
        const userMap = new Map<string, User>();
        (cloudData.users || []).forEach((cU: User) => userMap.set(cU.id, cU));
        localUsers.forEach(lU => {
          const cU = userMap.get(lU.id);
          if (!cU || new Date(lU.joinedAt) > new Date(cU.joinedAt)) {
            userMap.set(lU.id, lU);
          }
        });
        localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(Array.from(userMap.values())));
        
        // Sync News
        if (cloudData.news) {
          localStorage.setItem(NEWS_KEY, JSON.stringify(cloudData.news));
        }
        
        window.dispatchEvent(new Event('storage'));
      }

      return 'synced';
    } catch (e) {
      return 'local';
    }
  },

  broadcastToCloud: async () => {
    try {
      const data = {
        listings: storageService.getListings(),
        news: storageService.getNews(),
        users: storageService.getUsers(),
        lastUpdate: new Date().toISOString(),
        version: '2.5.0'
      };

      const res = await fetch(CLOUD_NODE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error("Cloud write failed");
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- ASSET MANAGEMENT ---

  getListings: (): Listing[] => {
    const stored = localStorage.getItem(LISTINGS_KEY);
    try {
      return stored ? JSON.parse(stored) : INITIAL_LISTINGS;
    } catch (e) {
      return INITIAL_LISTINGS;
    }
  },

  saveListing: async (listing: Listing) => {
    const listings = storageService.getListings();
    const existingIndex = listings.findIndex(l => l.id === listing.id);
    if (existingIndex !== -1) {
      listings[existingIndex] = listing;
    } else {
      listings.unshift(listing);
    }
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    await storageService.broadcastToCloud();
  },

  deleteListing: async (id: string) => {
    const listings = storageService.getListings().filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    await storageService.broadcastToCloud();
  },

  // --- MERCHANT MANAGEMENT ---

  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    try {
      const users = stored ? JSON.parse(stored) : [];
      return users.filter((u: User) => u.email !== 'merchant@gmail.com' && u.email !== 'guest@trazot.com');
    } catch {
      return [];
    }
  },

  updateUser: async (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (!user.id.startsWith('guest_')) {
      const users = storageService.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
      await storageService.broadcastToCloud();
    }
  },

  deleteUser: async (id: string) => {
    const users = storageService.getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    const current = storageService.getCurrentUser();
    if (current.id === id) {
      localStorage.removeItem(USER_KEY);
    }
    await storageService.broadcastToCloud();
  },

  getCurrentUser: (): User => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      return {
        id: 'guest_' + Math.random().toString(36).substring(7),
        name: 'Guest Merchant',
        email: 'guest@trazot.com',
        isPremium: false,
        tier: 'Free',
        credits: 5,
        joinedAt: new Date().toISOString()
      };
    }
    return JSON.parse(stored);
  },

  // --- NEWS MANAGEMENT ---

  getNews: (): NewsArticle[] => {
    const stored = localStorage.getItem(NEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveNews: async (article: NewsArticle) => {
    const news = storageService.getNews();
    news.unshift(article);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    await storageService.broadcastToCloud();
  },

  deleteNews: async (id: string) => {
    const news = storageService.getNews().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    await storageService.broadcastToCloud();
  },

  // --- AUTH UTILITIES ---

  getAdminAuth: () => {
    const stored = localStorage.getItem(ADMIN_CRED_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setAdminAuth: (password: string, recoveryKey: string) => {
    localStorage.setItem(ADMIN_CRED_KEY, JSON.stringify({ password, recoveryKey }));
  },

  resetAdminPassword: (recoveryKey: string, newPassword: string): boolean => {
    const creds = storageService.getAdminAuth();
    // Allow both the user's key AND the Master Emergency Key
    if (recoveryKey === MASTER_EMERGENCY_KEY || (creds && creds.recoveryKey === recoveryKey)) {
      storageService.setAdminAuth(newPassword, recoveryKey || MASTER_EMERGENCY_KEY);
      return true;
    }
    return false;
  },

  getSavedSearches: () => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveSearch: (s: any) => {
    const existing = storageService.getSavedSearches();
    existing.unshift(s);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(existing));
  },

  deleteSavedSearch: (id: string) => {
    const filtered = storageService.getSavedSearches().filter((s: any) => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
  },
  
  isIdentifierUsed: (email: string) => {
    const users = storageService.getUsers();
    const used = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    return { used, type: used ? 'email' : '' };
  }
};
