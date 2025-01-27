import api from './api';
import { mockLocations, mockCategories } from './mockData';

export interface SearchFilters {
  query?: string;
  date?: string;
  location?: string;
  category?: string;
  priceRange?: string;
  sortBy?: string;
}

export interface SearchResults {
  events: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PriceRange {
  min: number;
  max: number | null;
  label: string;
}

class SearchService {
  async searchEvents(filters: SearchFilters): Promise<SearchResults> {
    try {
      const response = await api.get('/api/search/events', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const response = await api.get('/api/search/locations');
      return response.data;
    } catch (error) {
      console.warn('Using mock locations in development');
      return mockLocations;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await api.get('/api/search/categories');
      return response.data;
    } catch (error) {
      console.warn('Using mock categories in development');
      return mockCategories;
    }
  }

  async getPriceRanges(): Promise<PriceRange[]> {
    try {
      const response = await api.get('/api/search/price-ranges');
      return response.data;
    } catch (error) {
      console.warn('Using mock price ranges in development');
      return [
        { min: 0, max: 50, label: 'Under GHS 50' },
        { min: 50, max: 100, label: 'GHS 50 - 100' },
        { min: 100, max: 200, label: 'GHS 100 - 200' },
        { min: 200, max: null, label: 'GHS 200+' }
      ];
    }
  }

  async getPopularSearches(): Promise<string[]> {
    try {
      const response = await api.get('/api/search/popular');
      return response.data;
    } catch (error) {
      console.warn('Using mock popular searches in development');
      return [
        'Music Festivals',
        'Sports Events',
        'Cultural Events',
        'Art Exhibitions',
        'Comedy Shows'
      ];
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await api.get('/api/search/suggestions', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock suggestions in development');
      return mockCategories.filter(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
}

export const searchService = new SearchService();