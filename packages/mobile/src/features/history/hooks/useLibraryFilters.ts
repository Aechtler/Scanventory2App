/**
 * Hook für Bibliothek-Filterlogik
 * Suche, Kategorie-Filter und Sortierung
 */

import { useState, useMemo, useCallback } from 'react';
import type { HistoryItem } from '../store/historyStore';
import { getLibraryDisplayPrice } from '../utils/historyPricing';
import { classifyProduct, type ProductType } from '../utils/productClassification';

export type SortBy = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name';

export interface LibraryFilters {
  searchQuery: string;
  selectedCategories: string[];
  sortBy: SortBy;
  productType: ProductType | null;
}

export function useLibraryFilters(items: HistoryItem[]) {
  const [filters, setFilters] = useState<LibraryFilters>({
    searchQuery: '',
    selectedCategories: [],
    sortBy: 'newest',
    productType: null,
  });

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

    // Kategorie (multiselect, leer = alle)
    if (filters.selectedCategories.length > 0) {
      result = result.filter((item) => filters.selectedCategories.includes(item.category));
    }

    // Produkttyp-Filter (Fast Seller / High Value)
    if (filters.productType !== null) {
      result = result.filter((item) => classifyProduct(item) === filters.productType);
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
