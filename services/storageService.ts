import { Listing, User, AdStatus, NewsArticle, SavedSearch, Dealer, ProjectPromotion } from '../types.ts';
import { INITIAL_LISTINGS } from '../constants.ts';

const LISTINGS_KEY = 'tz_listings';
const USER_KEY = 'tz_user';
const USERS_REGISTRY_KEY = 'tz_users_registry';
const NEWS_KEY = 'tz_news';
const DEALERS_KEY = 'tz_dealers';
const PROMOTIONS_KEY = 'tz_promotions';
const ADMIN_CRED_KEY = 'tz_admin_cred';
const SAVED_SEARCHES_KEY = 'tz_saved_searches';
const SECURITY_LOGS_KEY = 'tz_security_logs';
const SUBSCRIBERS_KEY = 'tz_newsletter_subscribers';

/** 
 * HOSTINGER NODE CONFIGURATION 
 * Matching Screenshot: u550128434
 */
export const OFFICIAL_DOMAIN = 'trazot.com';
export const MASTER_EMERGENCY_KEY = 'TRAZOT-MASTER-2025-RECOVERY-NODE';
const DB_NODE_ID = 'u550128434_trazot_db';
const DB_ADMIN_USER = 'u550128434_trazot_admin';

// The Cloud Relay Node (JSON-based persistence)
const CLOUD_NODE_URL = 'https://api.jsonbin.io/v3/b/67bd541cacd3cb34a8ef7be6'; 
const MASTER_KEY = '$2a$10$7zV7f1pL6MvD9.x1xX1Z1.rO9xP7f9f9f9f9f9f9f9f9f9f9f9'; 

let pollingInterval: any = null;

export const storageService = {
  security: {
    sanitize: (str: string): string => {
      if (!str) return '';
      return str.replace(/[<>]/g, '').trim();
    },
    logThreat: (type: string, details: string) => {
      const logs = JSON.parse(localStorage.getItem(SECURITY_LOGS_KEY) || '[]');
      logs.unshift({ timestamp: new Date().toISOString(), type, details });
      localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
      window.dispatchEvent(new Event('storage'));
    },
    getLogs: () => JSON.parse(localStorage.getItem(SECURITY_LOGS_KEY) || '[]'),
    rateLimit: (key: string, limit: number, windowMs: number): boolean => {
      const now = Date.now();
      const last = Number(localStorage.getItem(`rl_${key}`) || 0);
      if (now - last < windowMs) {
        storageService.security.logThreat('Rate Limit Exceeded', `Action: ${key}`);
        return false;
      }
      localStorage.setItem(`rl_${key}`, now.toString());
      return true;
    }
  },

  getBackendHealth: async () => {
    const start = performance.now();
    try {
      const res = await fetch(`${CLOUD_NODE_URL}/latest`, { method: 'HEAD', headers: { 'X-Master-Key': MASTER_KEY } });
      const latency = performance.now() - start;
      return { 
        status: res.ok ? 'Healthy' : 'Degraded', 
        latency: Math.round(latency),
        node: DB_NODE_ID,
        admin: DB_ADMIN_USER
      };
    } catch {
      return { status: 'Offline', latency: 0, node: DB_NODE_ID, admin: DB_ADMIN_USER };
    }
  },

  startBackgroundSync: () => {
    if (pollingInterval) return;
    storageService.syncWithCloud();
    pollingInterval = setInterval(() => storageService.syncWithCloud(), 30000); 
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
        headers: { 'X-Master-Key': MASTER_KEY, 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) return 'local';
      const result = await response.json();
      const cloudData = result.record;

      if (cloudData) {
        const resolveCollection = (localKey: string, cloudArray: any[], identifier: string = 'id', timeKey: string = 'createdAt') => {
          const stored = localStorage.getItem(localKey);
          const local = stored ? JSON.parse(stored) : [];
          const mergedMap = new Map();
          [...cloudArray, ...local].forEach(item => {
            const existing = mergedMap.get(item[identifier]);
            if (!existing || new Date(item[timeKey]) > new Date(existing[timeKey])) mergedMap.set(item[identifier], item);
          });
          localStorage.setItem(localKey, JSON.stringify(Array.from(mergedMap.values())));
        };

        resolveCollection(LISTINGS_KEY, cloudData.listings || [], 'id', 'createdAt');
        resolveCollection(USERS_REGISTRY_KEY, cloudData.users || [], 'id', 'joinedAt');
        if (cloudData.news) localStorage.setItem(NEWS_KEY, JSON.stringify(cloudData.news));
        if (cloudData.dealers) localStorage.setItem(DEALERS_KEY, JSON.stringify(cloudData.dealers));
        if (cloudData.promotions) localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(cloudData.promotions));
        if (cloudData.subscribers) localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(cloudData.subscribers));
        window.dispatchEvent(new Event('storage'));
      }
      return 'synced';
    } catch { return 'local'; }
  },

  broadcastToCloud: async () => {
    try {
      const data = {
        listings: storageService.getListings(),
        news: storageService.getNews(),
        users: storageService.getUsers(),
        dealers: storageService.getDealers(),
        promotions: storageService.getPromotions(),
        subscribers: storageService.getSubscribers(),
        lastUpdate: new Date().toISOString(),
        version: '4.1.0-HOSTINGER-SYNC',
        domain: OFFICIAL_DOMAIN,
        dbNode: DB_NODE_ID,
        dbUser: DB_ADMIN_USER
      };
      const res = await fetch(CLOUD_NODE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch { return false; }
  },

  getSubscribers: (): string[] => {
    const stored = localStorage.getItem(SUBSCRIBERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  subscribeToNewsletter: async (email: string): Promise<{ success: boolean; recentNews: NewsArticle[] }> => {
    const subscribers = storageService.getSubscribers();
    const sanitizedEmail = email.toLowerCase().trim();
    if (!subscribers.includes(sanitizedEmail)) {
      subscribers.push(sanitizedEmail);
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
      await storageService.broadcastToCloud();
    }
    return { success: true, recentNews: storageService.getNews().slice(0, 3) };
  },

  getListings: (): Listing[] => {
    const stored = localStorage.getItem(LISTINGS_KEY);
    try { 
      const parsed = stored ? JSON.parse(stored) : INITIAL_LISTINGS;
      const data = Array.isArray(parsed) ? parsed : INITIAL_LISTINGS;
      return [...data].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch { return INITIAL_LISTINGS; }
  },

  saveListing: async (listing: Listing) => {
    const listings = storageService.getListings();
    const existingIndex = listings.findIndex(l => l.id === listing.id);
    
    if (existingIndex === -1) {
      const user = storageService.getCurrentUser();
      
      // REGIONAL PRICING PROTOCOL
      const isPakistan = listing.location.country === 'Pakistan';
      const cost = listing.featured 
        ? (isPakistan ? 10 : 2) 
        : (isPakistan ? 5 : 1);
      
      if (user.id !== 'guest' && user.id !== 'user_guest') {
        if (user.credits < cost) {
          throw new Error(`Insufficient Trade Credits. Required: ${cost}, Available: ${user.credits}`);
        }
        user.credits -= cost;

        // AUTOMATIC EXHAUSTION BONUS: Award 10 after full utilization of initial quota
        if (user.credits === 0 && !user.hasReceivedExhaustionBonus) {
          user.credits = 10;
          user.hasReceivedExhaustionBonus = true;
          storageService.security.logThreat('Exhaustion Bonus', `User ${user.email} received 10 Credit injection.`);
        }
        await storageService.updateUser(user);
      }
      listings.unshift(listing);
    } else {
      listings[existingIndex] = listing;
    }
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    window.dispatchEvent(new Event('storage'));
    await storageService.broadcastToCloud();
  },

  deleteListing: async (id: string) => {
    const listings = storageService.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      listings[idx].status = AdStatus.TRASHED;
      listings[idx].createdAt = new Date().toISOString(); 
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
      window.dispatchEvent(new Event('storage'));
      await storageService.broadcastToCloud();
    }
  },

  purgeListing: async (id: string) => {
    const listings = storageService.getListings().filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    window.dispatchEvent(new Event('storage'));
    await storageService.broadcastToCloud();
  },

  restoreListing: async (id: string) => {
    const listings = storageService.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      listings[idx].status = AdStatus.PENDING; 
      listings[idx].createdAt = new Date().toISOString();
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
      window.dispatchEvent(new Event('storage'));
      await storageService.broadcastToCloud();
    }
  },

  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    try {
      const users = stored ? JSON.parse(stored) : [];
      return users.filter((u: User) => u.email !== 'merchant@gmail.com' && u.email !== 'guest@trazot.com');
    } catch { return []; }
  },

  updateUser: async (user: User) => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser.id === user.id) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user.email !== 'guest@trazot.com') {
      const users = storageService.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) users[idx] = user; else users.push(user);
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
      window.dispatchEvent(new Event('storage'));
      await storageService.broadcastToCloud();
    }
  },

  awardCredits: async (userId: string, amount: number) => {
    if (amount > 10) throw new Error("Maximum provision limit: 10 Credits per cycle.");
    const users = storageService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].credits += amount;
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
      const currentUser = storageService.getCurrentUser();
      if (currentUser.id === userId) localStorage.setItem(USER_KEY, JSON.stringify(users[idx]));
      window.dispatchEvent(new Event('storage'));
      await storageService.broadcastToCloud();
      return true;
    }
    return false;
  },

  getDealers: (): Dealer[] => {
    const stored = localStorage.getItem(DEALERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveDealer: async (dealer: Dealer) => {
    const dealers = storageService.getDealers();
    const idx = dealers.findIndex(d => d.id === dealer.id);
    if (idx !== -1) dealers[idx] = dealer; else dealers.unshift(dealer);
    localStorage.setItem(DEALERS_KEY, JSON.stringify(dealers));
    await storageService.broadcastToCloud();
  },

  getPromotions: (): ProjectPromotion[] => {
    const stored = localStorage.getItem(PROMOTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  savePromotion: async (promo: ProjectPromotion) => {
    const promos = storageService.getPromotions();
    const idx = promos.findIndex(p => p.id === promo.id);
    if (idx !== -1) promos[idx] = promo; else promos.unshift(promo);
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promos));
    await storageService.broadcastToCloud();
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
  },

  getNews: (): NewsArticle[] => {
    const stored = localStorage.getItem(NEWS_KEY);
    try {
      const data = stored ? JSON.parse(stored) : [];
      return [...data].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch { return []; }
  },

  saveNews: async (article: NewsArticle) => {
    const news = storageService.getNews();
    const existingIdx = news.findIndex(n => n.id === article.id);
    if (existingIdx !== -1) news[existingIdx] = article; else news.unshift(article);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    await storageService.broadcastToCloud();
  },

  deleteNews: async (id: string) => {
    const news = storageService.getNews().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    await storageService.broadcastToCloud();
  },

  getSavedSearches: (): SavedSearch[] => {
    try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]'); } catch { return []; }
  },

  isIdentifierUsed: (email: string, phone: string): { emailUsed: boolean; phoneUsed: boolean } => {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    try {
      const users: User[] = stored ? JSON.parse(stored) : [];
      return {
        emailUsed: users.some(u => u.email.toLowerCase() === email.toLowerCase()),
        phoneUsed: users.some(u => u.phone === phone)
      };
    } catch { return { emailUsed: false, phoneUsed: false }; }
  },

  getCurrentUser: (): User => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : { id: 'guest', name: 'Guest', email: 'guest@trazot.com', isPremium: false, credits: 0, joinedAt: '' };
  }
};