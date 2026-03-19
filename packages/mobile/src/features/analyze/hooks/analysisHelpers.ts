import type { PlatformQueries } from '@/features/market/services/quicklinks';
import type { VisionMatch, VisionResult } from '@/features/scan/services/visionService';

export function createManualVisionMatch(query: string): VisionMatch {
  return {
    productName: query,
    category: 'Gefunden via Suche',
    brand: null,
    condition: 'Gut',
    description: `Manuelle Suche nach: ${query}`,
    confidence: 0,
    isManual: true,
    searchQuery: query,
    searchQueries: {
      ebay: query,
      generic: query,
    },
  };
}

export function buildPlatformQueryInput(match: VisionMatch): PlatformQueries {
  const fallback = match.searchQuery;

  return {
    ebay: match.searchQueries?.ebay || fallback,
    amazon: match.searchQueries?.amazon || fallback,
    idealo: match.searchQueries?.idealo || fallback,
    generic: match.searchQueries?.generic || fallback,
  };
}

export function getAutoSelectMatchIndex(result: VisionResult): number | null {
  if (result.matches.length !== 1) {
    return null;
  }

  return result.matches[0].confidence >= 0.95 ? 0 : null;
}
