/**
 * Hook für Bibliothek-Filterlogik
 * Suche, Kategorie-Filter und Sortierung
 */

import { useState, useMemo, useCallback } from 'react';
import type { HistoryItem } from '../store/historyStore';
import { getLibraryDisplayPrice } from '../utils/historyPricing';

export type SortBy = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';

export interface LibraryFilters {
  searchQuery: string;
  category: string | null;
  sortBy: SortBy;
}

export function useLibraryFilters(items: HistoryItem[]) {
  const [filters, setFilters] = useState<LibraryFilters>({
    searchQuery: '',
    category: null,
    sortBy: 'newest',
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '', category: null, sortBy: 'newest' });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Textsuche
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    // Kategorie
    if (filters.category) {
      result = result.filter((item) => item.category === filters.category);
    }

    // Sortierung
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        case 'oldest':
          return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
        case 'price_asc': {
          const priceA = getLibraryDisplayPrice(a) ?? 0;
          const priceB = getLibraryDisplayPrice(b) ?? 0;
          return priceA - priceB;
        }
        case 'price_desc': {
          const priceA = getLibraryDisplayPrice(a) ?? 0;
          const priceB = getLibraryDisplayPrice(b) ?? 0;
          return priceB - priceA;
        }
        case 'name':
          return a.productName.localeCompare(b.productName, 'de');
        default:
          return 0;
      }
    });

    return result;
  }, [items, filters]);

  const isFiltered = filters.searchQuery.trim() !== '' || filters.category !== null;
  const activeFilterCount =
    (filters.searchQuery.trim() ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.sortBy !== 'newest' ? 1 : 0);

  return {
    filters,
    setSearchQuery,
    setCategory,
    setSortBy,
    resetFilters,
    filteredItems,
    categories,
    isFiltered,
    activeFilterCount,
  };
}
