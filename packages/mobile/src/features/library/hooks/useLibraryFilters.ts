/**
 * Hook für Bibliothek-Filterlogik
 * Suche, Kategorie-Filter und Sortierung
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { LibraryItem } from '../utils/libraryRows';
import { getLibraryDisplayPrice } from '@/features/history/utils/historyPricing';
import { classifyProduct, type ProductType } from '@/features/history/utils/productClassification';

export type SortBy = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';

export interface LibraryFilters {
  searchQuery: string;
  selectedCategories: string[];
  sortBy: SortBy;
  productType: ProductType | null;
}

export function useLibraryFilters(items: LibraryItem[]) {
  const [filters, setFilters] = useState<LibraryFilters>({
    searchQuery: '',
    selectedCategories: [],
    sortBy: 'newest',
    productType: null,
  });

  // Suche debounced: Filter erst 200ms nach letzter Eingabe anwenden
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.searchQuery), 200);
    return () => clearTimeout(t);
  }, [filters.searchQuery]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setCategories = useCallback((selectedCategories: string[]) => {
    setFilters((prev) => ({ ...prev, selectedCategories }));
  }, []);

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setProductType = useCallback((productType: ProductType | null) => {
    setFilters((prev) => ({ ...prev, productType }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '', selectedCategories: [], sortBy: 'newest', productType: null });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [items]);

  // Datums-Timestamps einmal parsen, nicht bei jedem Sort-Vergleich
  const itemsWithTime = useMemo(
    () => items.map((item) => ({ item, t: new Date(item.scannedAt).getTime() })),
    [items]
  );

  const filteredItems = useMemo(() => {
    let result = itemsWithTime;

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(
        ({ item }) =>
          item.productName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q))
      );
    }

    if (filters.selectedCategories.length > 0) {
      result = result.filter(({ item }) => filters.selectedCategories.includes(item.category));
    }

    if (filters.productType !== null) {
      const type = filters.productType;
      result = result.filter(({ item }) => classifyProduct(item) === type);
    }

    const sorted = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':  return b.t - a.t;
        case 'oldest':  return a.t - b.t;
        case 'price_asc':  return (getLibraryDisplayPrice(a.item) ?? 0) - (getLibraryDisplayPrice(b.item) ?? 0);
        case 'price_desc': return (getLibraryDisplayPrice(b.item) ?? 0) - (getLibraryDisplayPrice(a.item) ?? 0);
        case 'name': return a.item.productName.localeCompare(b.item.productName, 'de');
        default: return 0;
      }
    });

    return sorted.map(({ item }) => item);
  }, [itemsWithTime, debouncedQuery, filters.selectedCategories, filters.sortBy, filters.productType]);

  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.selectedCategories.length > 0 ||
    filters.productType !== null;
  const activeFilterCount =
    (filters.searchQuery.trim() ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.sortBy !== 'newest' ? 1 : 0) +
    (filters.productType !== null ? 1 : 0);

  return {
    filters,
    setSearchQuery,
    setCategories,
    setSortBy,
    setProductType,
    resetFilters,
    filteredItems,
    categories,
    isFiltered,
    activeFilterCount,
  };
}
