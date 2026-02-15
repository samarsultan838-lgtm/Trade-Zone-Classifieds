
import { Listing, User, AdStatus, NewsArticle, SavedSearch } from '../types.ts';
import { INITIAL_LISTINGS } from '../constants.ts';

const LISTINGS_KEY = 'tz_listings';
const USER_KEY = 'tz_user';
const USERS_REGISTRY_KEY = 'tz_users_registry';
const NEWS_KEY = 'tz_news';
const ADMIN_CRED_KEY = 'tz_admin_cred';
const SAVED_SEARCHES_KEY = 'tz_saved_searches';

/**
 * MASTER EMERGENCY OVERRIDE
 * This key is the final authority for the site owner. 
 * Use this in the "Emergency Reset" flow if other keys fail.
 */
export const MASTER_EMERGENCY_KEY = 'TRAZOT-MASTER-2025-RECOVERY-NODE';

const CLOUD_NODE_URL = 'https://api.jsonbin.io/v3/b/67bd541cacd3cb34a8ef7be6'; 
const MASTER_KEY = '$2a$10$7zV7f1pL6MvD9.x1xX1Z1.rO9xP7f9f9f9f9f9f9f9f9f9f9f9'; 

let pollingInterval: any = null;

export const storageService = {
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
        // Listings Sync
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

        // Users Sync
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
        version: '2.6.0'
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

  getAdminAuth: () => {
    const stored = localStorage.getItem(ADMIN_CRED_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setAdminAuth: (password: string, recoveryKey: string) => {
    localStorage.setItem(ADMIN_CRED_KEY, JSON.stringify({ password, recoveryKey }));
  },

  resetAdminPassword: (recoveryKey: string, newPassword: string): boolean => {
    const creds = storageService.getAdminAuth();
    // VITAL: Accept the MASTER_EMERGENCY_KEY or the current local key
    if (recoveryKey === MASTER_EMERGENCY_KEY || (creds && creds.recoveryKey === recoveryKey)) {
      storageService.setAdminAuth(newPassword, recoveryKey === MASTER_EMERGENCY_KEY ? MASTER_EMERGENCY_KEY : recoveryKey);
      return true;
    }
    return false;
  },

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

  getSavedSearches: (): SavedSearch[] => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // Added missing deleteSavedSearch method to fix error in Workspace.tsx
  deleteSavedSearch: (id: string) => {
    const searches = storageService.getSavedSearches();
    const updated = searches.filter((s: SavedSearch) => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
  },

  isIdentifierUsed: (email: string) => {
    const users = storageService.getUsers();
    return { used: users.some(u => u.email.toLowerCase() === email.toLowerCase()) };
  },

  getCurrentUser: (): User => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : { id: 'guest', name: 'Guest', email: 'guest@trazot.com', isPremium: false, credits: 0, joinedAt: '' };
  }
};
