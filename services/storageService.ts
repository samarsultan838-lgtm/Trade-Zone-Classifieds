import { Listing, User, AdStatus, NewsArticle, Dealer, ProjectPromotion, InternalMessage } from '../types';

const API_BASE = 'https://trazot.com/api';

export const storageService = {
  // ---------- Listings ----------
  async getListings(): Promise<Listing[]> {
    try {
      const res = await fetch(`${API_BASE}/listings/index.php`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  },

  async getListing(id: string): Promise<Listing | null> {
    try {
      const res = await fetch(`${API_BASE}/listings/read.php?id=${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return { ...data, createdAt: new Date(data.createdAt) };
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

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing)
      });
      return res.ok;
    } catch (error) {
      console.error('Error saving listing:', error);
      return false;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/listings/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  },

  // ---------- News ----------
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`${API_BASE}/news/index.php`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      return data.map((item: any) => ({
        ...item,
        publishedAt: new Date(item.publishedAt)
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  async saveNews(article: NewsArticle): Promise<boolean> {
    const method = article.id ? 'PUT' : 'POST';
    const url = article.id
      ? `${API_BASE}/news/update.php?id=${article.id}`
      : `${API_BASE}/news/create.php`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      return res.ok;
    } catch (error) {
      console.error('Error saving news:', error);
      return false;
    }
  },

  async deleteNews(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/news/delete.php?id=${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting news:', error);
      return false;
    }
  },

  // ---------- Users (temporary – keep localStorage for now) ----------
  async getCurrentUser(): Promise<User> {
    const stored = localStorage.getItem('tz_user');
    return stored ? JSON.parse(stored) : { id: 'guest', name: 'Guest', email: 'guest@trazot.com', credits: 0 };
  },

  // Keep other methods (dealers, promotions, messages) if they exist, but similarly convert them to API calls.
};
