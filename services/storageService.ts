
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

      if (cloudData) {
        // Handle Listings Sync
        if (Array.isArray(cloudData.listings)) {
          const localListings = storageService.getListings();
          const listingMap = new Map<string, Listing>();
          INITIAL_LISTINGS.forEach(l => listingMap.set(l.id, l));
          cloudData.listings.forEach((cL: Listing) => listingMap.set(cL.id, cL));
          localListings.forEach(l => {
            const cloudVersion = listingMap.get(l.id);
            if (!cloudVersion || new Date(l.createdAt) > new Date(cloudVersion.createdAt)) {
              listingMap.set(l.id, l);
            }
          });
          const mergedListings = Array.from(listingMap.values());
          mergedListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          localStorage.setItem(LISTINGS_KEY, JSON.stringify(mergedListings));
        }

        // Handle Users Registry Sync
        if (Array.isArray(cloudData.users)) {
          const localUsers = storageService.getUsers();
          const userMap = new Map<string, User>();
          cloudData.users.forEach((cU: User) => userMap.set(cU.id, cU));
          localUsers.forEach(u => {
            const cloudU = userMap.get(u.id);
            if (!cloudU || new Date(u.joinedAt) > new Date(cloudU.joinedAt)) {
              userMap.set(u.id, u);
            }
          });
          localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(Array.from(userMap.values())));
        }
      }

      return 'synced';
    } catch (e) {
      console.warn("Sync failed. Operating in Local Mode.");
      return 'local';
    }
  },

  broadcastToCloud: async () => {
    try {
      const listings = storageService.getListings();
      const news = storageService.getNews();
      const users = storageService.getUsers();

      await fetch(CLOUD_NODE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify({ listings, news, users, lastUpdate: new Date().toISOString() })
      });
      
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Cloud Broadcast Error:", e);
    }
  },

  // --- DATA RETRIEVAL ---

  getListings: (): Listing[] => {
    const stored = localStorage.getItem(LISTINGS_KEY);
    try {
      return stored ? JSON.parse(stored) : INITIAL_LISTINGS;
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
        tier: 'Free',
        credits: 5,
        joinedAt: new Date().toISOString()
      };
      storageService.updateUser(newUser);
      return newUser;
    }
    return JSON.parse(stored);
  },

  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  updateUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Maintain registry
    const users = storageService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    storageService.broadcastToCloud();
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
  
  isIdentifierUsed: (email: string) => {
    const users = storageService.getUsers();
    const used = users.some(u => u.email === email);
    return { used, type: used ? 'email' : '' };
  },
  registerIdentifier: (email: string, phone: string) => {},

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
