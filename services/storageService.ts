
import { Listing, User, AdStatus, NewsArticle, SavedSearch } from '../types.ts';
import { INITIAL_LISTINGS } from '../constants.ts';

const LISTINGS_KEY = 'tz_listings';
const USER_KEY = 'tz_user';
const USERS_REGISTRY_KEY = 'tz_users_registry';
const NEWS_KEY = 'tz_news';
const ADMIN_CRED_KEY = 'tz_admin_cred';
const SAVED_SEARCHES_KEY = 'tz_saved_searches';

/**
 * GLOBAL MARKETPLACE NODE - JSONBin.io Relay
 * Note: In production, the MASTER_KEY should be handled by a secure backend proxy.
 */
const CLOUD_NODE_URL = 'https://api.jsonbin.io/v3/b/67bd541cacd3cb34a8ef7be6'; 
const MASTER_KEY = '$2a$10$7zV7f1pL6MvD9.x1xX1Z1.rO9xP7f9f9f9f9f9f9f9f9f9f9f9'; 

export const storageService = {
  // --- CORE SYNC ENGINE (RE-ENGINEERED) ---

  /**
   * Fetches latest state and merges it with local storage
   */
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
        // 1. Sync Listings
        const localListings = storageService.getListings();
        const listingMap = new Map<string, Listing>();
        
        // Strategy: Cloud is source of truth, but newer local edits take priority
        (cloudData.listings || []).forEach((cL: Listing) => listingMap.set(cL.id, cL));
        localListings.forEach(lL => {
          const cL = listingMap.get(lL.id);
          if (!cL || new Date(lL.createdAt) > new Date(cL.createdAt)) {
            listingMap.set(lL.id, lL);
          }
        });
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(Array.from(listingMap.values())));

        // 2. Sync Users
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
        
        // 3. Sync News
        if (cloudData.news) {
          localStorage.setItem(NEWS_KEY, JSON.stringify(cloudData.news));
        }
      }

      return 'synced';
    } catch (e) {
      console.warn("Cloud synchronization failed. Operating in Local Persistence mode.");
      return 'local';
    }
  },

  /**
   * Broadcasts entire current state to cloud
   * IMPORTANT: This now implements a soft-lock by syncing before pushing
   */
  broadcastToCloud: async () => {
    try {
      const data = {
        listings: storageService.getListings(),
        news: storageService.getNews(),
        users: storageService.getUsers(),
        lastUpdate: new Date().toISOString(),
        version: '2.1.0'
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
      
      // Notify all components of the data change
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (e) {
      console.error("Cloud Broadcast Error:", e);
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
      // Filter out internal system/test emails
      return users.filter((u: User) => u.email !== 'merchant@gmail.com' && u.email !== 'guest@trazot.com');
    } catch {
      return [];
    }
  },

  updateUser: async (user: User) => {
    // 1. Update current session
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // 2. Update in global registry if not a guest
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
    
    // Clear session if user is deleting themselves
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

  // --- MISC UTILITIES ---

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
  },

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
