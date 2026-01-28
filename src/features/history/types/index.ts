// History Feature - Type Definitions

import type { ScanResult } from '@/features/scan';
import type { MarketAnalysis } from '@/features/market';

/**
 * Einzelner Eintrag im Scan-Verlauf
 */
export interface HistoryEntry {
  id: string;
  scan: ScanResult;
  analysis?: MarketAnalysis;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  notes?: string;
}

/**
 * Sortier-Optionen für Verlauf
 */
export type HistorySortBy = 'date' | 'value' | 'name';
export type HistorySortOrder = 'asc' | 'desc';

/**
 * Filter-Optionen für Verlauf
 */
export interface HistoryFilters {
  favorites?: boolean;
  category?: string;
  minValue?: number;
  maxValue?: number;
}
