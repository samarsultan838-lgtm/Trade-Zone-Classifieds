import { Listing, User, AdStatus, NewsArticle, Dealer, ProjectPromotion, InternalMessage } from '../types';

const API_BASE = 'https://trazot.com/api';

export const storageService = {
  // ---------- Listings ----------
  async getListings(): Promise<Listing[]> {
    try {
      const res = await fetch(`${API_BASE}/listings/index.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data);
        return [];
      }
      
      // Convert date strings to Date objects and ensure all fields exist
      return data.map((item: any) => ({
        id: item.id || '',
        title: item.title || '',
        description: item.description || '',
        price: Number(item.price) || 0,
        currency: item.currency || 'TZS',
        category: item.category || '',
        condition: item.condition || 'New',
        images: Array.isArray(item.images) ? item.images : [],
        sellerId: item.sellerId || '',
        sellerName: item.sellerName || 'Unknown Seller',
        sellerRating: Number(item.sellerRating) || 0,
        location: {
          city: item.location?.city || '',
          district: item.location?.district || '',
          region: item.location?.region || ''
        },
        status: item.status || AdStatus.PENDING,
        views: Number(item.views) || 0,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        // Add version tracking for cache busting
        _version: item._version || 1,
        _lastModified: item._lastModified || Date.now()
      }));
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Fallback to localStorage if API fails (for development)
      return this.getListingsFallback();
    }
  },

  // Fallback to localStorage for development/offline
  getListingsFallback(): Listing[] {
    try {
      const cached = localStorage.getItem('tz_listings_fallback');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async getListing(id: string): Promise<Listing | null> {
    try {
      const res = await fetch(`${API_BASE}/listings/read.php?id=${id}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      return { 
        ...data, 
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
      };
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  },

  async saveListing(listing: Listing): Promise<boolean> {
    const method = listing.id ? 'PUT' : 'POST';
    const url = listing.id
      ? `${API_BASE}/listings/update.php?id=${listing.id}`
      : `${API_BASE}/listings/create.php`;

    // Add version and timestamp
    const listingToSave = {
      ...listing,
      _version: (listing as any)._version ? (listing as any)._version + 1 : 1,
      _lastModified: Date.now(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(listingToSave)
      });

      if (res.ok) {
        // Trigger cross-tab synchronization
        this.notifyListingsUpdated();
        
        // Update fallback cache
        this.updateListingsFallback(listing);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving listing:', error);
      
      // Save to fallback storage if API fails
      this.updateListingsFallback(listing);
      return false;
    }
  },

  // Update fallback cache
  async updateListingsFallback(listing: Listing): Promise<void> {
    try {
      const fallback = this.getListingsFallback();
      const index = fallback.findIndex(l => l.id === listing.id);
      
      if (index >= 0) {
        fallback[index] = { ...listing, _version: (fallback[index] as any)?._version + 1 || 1 };
      } else {
        fallback.push({ ...listing, _version: 1 });
      }
      
      localStorage.setItem('tz_listings_fallback', JSON.stringify(fallback));
    } catch (error) {
      console.error('Error updating fallback:', error);
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/listings/delete.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        // Trigger cross-tab synchronization
        this.notifyListingsUpdated();
        
        // Remove from fallback
        this.deleteListingFallback(id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting listing:', error);
      
      // Remove from fallback anyway
      this.deleteListingFallback(id);
      return false;
    }
  },

  deleteListingFallback(id: string): void {
    try {
      const fallback = this.getListingsFallback();
      const filtered = fallback.filter(l => l.id !== id);
      localStorage.setItem('tz_listings_fallback', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from fallback:', error);
    }
  },

  // ---------- News ----------
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`${API_BASE}/news/index.php`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error('API returned non-array news data:', data);
        return [];
      }
      
      return data.map((item: any) => ({
        id: item.id || '',
        title: item.title || '',
        content: item.content || '',
        category: item.category || 'Market Trend',
        image: item.image || '',
        author: item.author || 'Admin',
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        _version: item._version || 1,
        _lastModified: item._lastModified || Date.now()
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getNewsFallback();
    }
  },

  getNewsFallback(): NewsArticle[] {
    try {
      const cached = localStorage.getItem('tz_news_fallback');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async saveNews(article: NewsArticle): Promise<boolean> {
    const method = article.id ? 'PUT' : 'POST';
    const url = article.id
      ? `${API_BASE}/news/update.php?id=${article.id}`
      : `${API_BASE}/news/create.php`;

    const articleToSave = {
      ...article,
      _version: (article as any)._version ? (article as any)._version + 1 : 1,
      _lastModified: Date.now(),
      publishedAt: article.publishedAt || new Date().toISOString()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(articleToSave)
      });

      if (res.ok) {
        this.notifyNewsUpdated();
        this.updateNewsFallback(article);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving news:', error);
      this.updateNewsFallback(article);
      return false;
    }
  },

  updateNewsFallback(article: NewsArticle): void {
    try {
      const fallback = this.getNewsFallback();
      const index = fallback.findIndex(a => a.id === article.id);
      
      if (index >= 0) {
        fallback[index] = { ...article, _version: (fallback[index] as any)?._version + 1 || 1 };
      } else {
        fallback.push({ ...article, _version: 1 });
      }
      
      localStorage.setItem('tz_news_fallback', JSON.stringify(fallback));
    } catch (error) {
      console.error('Error updating news fallback:', error);
    }
  },

  async deleteNews(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/news/delete.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        this.notifyNewsUpdated();
        this.deleteNewsFallback(id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting news:', error);
      this.deleteNewsFallback(id);
      return false;
    }
  },

  deleteNewsFallback(id: string): void {
    try {
      const fallback = this.getNewsFallback();
      const filtered = fallback.filter(a => a.id !== id);
      localStorage.setItem('tz_news_fallback', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from news fallback:', error);
    }
  },

  // ---------- Cross-tab Synchronization ----------
  notifyListingsUpdated(): void {
    // Dispatch storage event for cross-tab sync
    const event = new StorageEvent('storage', {
      key: 'tz_listings_sync',
      newValue: Date.now().toString(),
      oldValue: null,
      storageArea: localStorage
    });
    window.dispatchEvent(event);
    
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent('listings-updated', {
      detail: { timestamp: Date.now() }
    }));
  },

  notifyNewsUpdated(): void {
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tz_news_sync',
      newValue: Date.now().toString(),
      oldValue: null,
      storageArea: localStorage
    }));
    
    window.dispatchEvent(new CustomEvent('news-updated', {
      detail: { timestamp: Date.now() }
    }));
  },

  // ---------- Admin Authentication (still using localStorage) ----------
  async getAdminAuth(): Promise<{ password: string; recoveryKey: string } | null> {
    try {
      // In a production app, this should be an API call
      // For now, keep using localStorage for admin auth
      const auth = localStorage.getItem('tz_admin_auth');
      return auth ? JSON.parse(auth) : null;
    } catch (error) {
      console.error('Error getting admin auth:', error);
      return null;
    }
  },

  async setAdminAuth(password: string, recoveryKey: string): Promise<void> {
    try {
      // In production, this should be an API call
      localStorage.setItem('tz_admin_auth', JSON.stringify({ 
        password, 
        recoveryKey,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error setting admin auth:', error);
      throw error;
    }
  },

  async resetAdminPassword(recoveryKey: string, newPassword: string): Promise<boolean> {
    try {
      const auth = await this.getAdminAuth();
      if (!auth) return false;
      
      if (auth.recoveryKey !== recoveryKey) return false;
      
      auth.password = newPassword;
      auth.lastReset = new Date().toISOString();
      
      localStorage.setItem('tz_admin_auth', JSON.stringify(auth));
      return true;
    } catch (error) {
      console.error('Error resetting admin password:', error);
      return false;
    }
  },

  // ---------- Users ----------
  async getCurrentUser(): Promise<User> {
    try {
      // Try to get from API first
      const res = await fetch(`${API_BASE}/users/current.php`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (res.ok) {
        const user = await res.json();
        return user;
      }
    } catch (error) {
      console.error('Error fetching current user from API:', error);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('tz_user');
    return stored ? JSON.parse(stored) : { 
      id: 'guest', 
      name: 'Guest', 
      email: 'guest@trazot.com', 
      credits: 0,
      role: 'guest'
    };
  },

  // ---------- Utility Methods ----------
  async clearCache(): Promise<void> {
    try {
      // Clear browser cache for API requests
      const cacheKeys = ['tz_listings', 'tz_news', 'tz_listings_fallback', 'tz_news_fallback'];
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      // Force reload data
      await this.getListings();
      await this.getNews();
      
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  async getSyncStatus(): Promise<{
    listings: { count: number; lastSync: string | null };
    news: { count: number; lastSync: string | null };
  }> {
    const listings = await this.getListings();
    const news = await this.getNews();
    
    return {
      listings: {
        count: listings.length,
        lastSync: localStorage.getItem('tz_listings_last_sync')
      },
      news: {
        count: news.length,
        lastSync: localStorage.getItem('tz_news_last_sync')
      }
    };
  },

  // Force refresh all data
  async refreshAllData(): Promise<{ listings: Listing[]; news: NewsArticle[] }> {
    try {
      const [listings, news] = await Promise.all([
        this.getListings(),
        this.getNews()
      ]);
      
      // Update sync timestamps
      localStorage.setItem('tz_listings_last_sync', new Date().toISOString());
      localStorage.setItem('tz_news_last_sync', new Date().toISOString());
      
      return { listings, news };
    } catch (error) {
      console.error('Error refreshing all data:', error);
      throw error;
    }
  }
};

// Add storage event listener helper
export const setupStorageSync = (callback: (key: string) => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'tz_listings_sync' || e.key === 'tz_news_sync') {
      callback(e.key);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default storageService;
