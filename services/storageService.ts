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

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'The Sovereign Shift: Institutional Appetite in Riyadh Real Estate',
    content: 'As Saudi Arabia accelerates its Vision 2030 initiatives, institutional investors are moving from speculative trading to long-term residential holdings in Riyadh. Our latest data indicates a 14.2% increase in high-fidelity villa valuations across the Al Malqa and Al Olaya districts. Trazot remains the primary node for verified international participants to access these secure assets through our partnership with BigBossTrader.',
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c8?auto=format&fit=crop&q=80&w=1200&h=675',
    category: 'Market Trend',
    author: 'Chief Intelligence Officer',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Hyper-Liquid Assets: Automotive Valuation Benchmarks Q4 2024',
    content: 'The GCC luxury automotive market is witnessing a unique liquidity trend. High-performance SUVs, specifically the Mercedes-Benz G-Class and Range Rover Autobiography, are currently outperforming traditional gold-hedged assets in short-term value retention. This report analyzes why the "Garage-as-a-Vault" strategy is becoming a staple for diversified portfolios in Dubai and Doha.',
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b8fa2393c?auto=format&fit=crop&q=80&w=1200&h=675',
    category: 'Expert Advice',
    author: 'Automotive Desk',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'n3',
    title: 'PropTech Nodes: AI-Driven Appraisals in Tier-1 South Asian Cities',
    content: 'Trazot is pioneering the deployment of AI-driven appraisal nodes across Lahore, Mumbai, and Delhi. By leveraging Google Gemini models for deep asset analysis, we are reducing transaction friction by up to 40%. Verified merchants can now expect near-instant valuation benchmarks based on historical trade data and real-time market sentiment.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=675',
    category: 'Tech Update',
    author: 'Trazot Engineering',
    publishedAt: new Date().toISOString()
  }
];

export interface Subscriber {
  email: string;
  subscribedAt: string;
  interests: string[];
}

export const storageService = {
  // Admin Authentication
  getAdminAuth: () => {
    const creds = localStorage.getItem(ADMIN_CRED_KEY);
    return creds ? JSON.parse(creds) : null;
  },

  setAdminAuth: (password: string, recoveryKey: string) => {
    localStorage.setItem(ADMIN_CRED_KEY, JSON.stringify({ password, recoveryKey }));
  },

  resetAdminPassword: (recoveryKey: string, newPassword: string) => {
    const creds = storageService.getAdminAuth();
    if (creds && creds.recoveryKey === recoveryKey) {
      localStorage.setItem(ADMIN_CRED_KEY, JSON.stringify({ ...creds, password: newPassword }));
      return true;
    }
    return false;
  },

  // Listings
  getListings: (): Listing[] => {
    const stored = localStorage.getItem(LISTINGS_KEY);
    if (!stored) {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    return JSON.parse(stored);
  },

  saveListing: (listing: Listing) => {
    const listings = storageService.getListings();
    const user = storageService.getCurrentUser();
    
    const existingIndex = listings.findIndex(l => l.id === listing.id);
    const isNew = existingIndex === -1;

    if (isNew) {
      const cost = listing.featured ? 2 : 1;
      if (user.credits < cost) {
        throw new Error(`Insufficient credits. You need ${cost} credits.`);
      }
      storageService.registerIdentifier(user.email, listing.contactPhone);
      user.credits -= cost;
      storageService.updateUser(user);
    }

    if (!isNew) {
      listings[existingIndex] = listing;
    } else {
      listings.push(listing);
    }
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    
    if (isNew) {
      storageService.triggerSubscriberNotification(`New Asset Alert: ${listing.title} in ${listing.location.city}`, listing.category);
    }
  },

  deleteListing: (id: string) => {
    const listings = storageService.getListings().filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  },

  // Saved Searches
  getSavedSearches: (): SavedSearch[] => {
    const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveSearch: (search: SavedSearch) => {
    const searches = storageService.getSavedSearches();
    searches.unshift(search);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  },

  deleteSavedSearch: (id: string) => {
    const searches = storageService.getSavedSearches().filter(s => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
  },

  // News
  getNews: (): NewsArticle[] => {
    const stored = localStorage.getItem(NEWS_KEY);
    if (!stored) {
      localStorage.setItem(NEWS_KEY, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
    }
    return JSON.parse(stored);
  },

  saveNews: (article: NewsArticle) => {
    const news = storageService.getNews();
    const existingIndex = news.findIndex(n => n.id === article.id);
    if (existingIndex > -1) {
      news[existingIndex] = article;
    } else {
      news.unshift(article);
    }
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    
    storageService.triggerSubscriberNotification(`IMMEDIATE BROADCAST: ${article.title}`, article.category);
  },

  deleteNews: (id: string) => {
    const news = storageService.getNews().filter(n => n.id !== id);
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
  },

  // Newsletter Subscribers
  getSubscribers: (): Subscriber[] => {
    const stored = localStorage.getItem(SUBSCRIBERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  subscribeEmail: (email: string, interests: string[] = ['All']) => {
    const subs = storageService.getSubscribers();
    const existingIdx = subs.findIndex(s => s.email === email);
    
    if (existingIdx > -1) {
      subs[existingIdx].interests = Array.from(new Set([...subs[existingIdx].interests, ...interests]));
    } else {
      subs.push({ email, interests, subscribedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
  },

  triggerSubscriberNotification: (subject: string, category: string) => {
    const subs = storageService.getSubscribers();
    subs.forEach(sub => {
      const isInterested = sub.interests.includes('All') || 
                          sub.interests.some(i => category.toLowerCase().includes(i.toLowerCase()));
      
      if (isInterested) {
        console.log(`[AUTOMATED NOTIFICATION] Sent to: ${sub.email} | Subject: ${subject}`);
      }
    });
  },

  // User & Registry
  getCurrentUser: (): User => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      const hasDeviceClaimed = localStorage.getItem(DEVICE_CLAIMED_KEY) === 'true';
      const newUser: User = {
        id: 'current_user_1',
        name: 'Guest User',
        email: 'guest@trazot.com',
        isPremium: false,
        credits: hasDeviceClaimed ? 0 : 5,
        joinedAt: new Date().toISOString()
      };
      if (!hasDeviceClaimed) {
        localStorage.setItem(DEVICE_CLAIMED_KEY, 'true');
      }
      storageService.updateUser(newUser);
      return newUser;
    }
    return JSON.parse(stored);
  },

  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  updateUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    const users = storageService.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  },

  registerIdentifier: (email: string, phone: string) => {
    const used = storageService.getUsedIdentifiers();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!used.emails.includes(email)) used.emails.push(email);
    if (cleanPhone && !used.phones.includes(cleanPhone)) used.phones.push(cleanPhone);
    localStorage.setItem(USED_IDENTIFIERS_KEY, JSON.stringify(used));
  },

  getUsedIdentifiers: () => {
    const stored = localStorage.getItem(USED_IDENTIFIERS_KEY);
    return stored ? JSON.parse(stored) : { emails: [], phones: [] };
  },

  isIdentifierUsed: (email: string, phone?: string): { used: boolean; type: string } => {
    const used = storageService.getUsedIdentifiers();
    if (used.emails.includes(email)) return { used: true, type: 'email' };
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone && used.phones.includes(cleanPhone)) return { used: true, type: 'phone' };
    }
    return { used: false, type: '' };
  }
};