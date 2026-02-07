/**
 * useAnalysis Hook
 * 
 * Manages the image analysis flow: vision API, match selection, product identification.
 * Extracted from analyze.tsx for better testability and separation of concerns.
 */

import { useState, useCallback } from 'react';
import { 
  analyzeImage, 
  analyzeImageMock, 
  VisionResult, 
  VisionMatch, 
  identifyProductIdentifier 
} from '@/features/scan/services/visionService';
import { getProductImage } from '@/features/market/services/ebay/images';
import { generatePlatformLinks, PlatformLink } from '@/features/market/services/quicklinks';

export type AnalysisState = 'idle' | 'analyzing' | 'selecting' | 'complete' | 'error';

export interface UseAnalysisOptions {
  onMatchSelected?: (match: VisionMatch, platformLinks: PlatformLink[]) => void;
  onIdentifierFound?: (gtin: string) => void;
}

export interface UseAnalysisReturn {
  // State
  state: AnalysisState;
  visionResult: VisionResult | null;
  selectedMatch: VisionMatch | null;
  platformLinks: PlatformLink[];
  error: string | null;
  
  // Actions
  runAnalysis: (imageUri: string) => Promise<void>;
  handleMatchSelect: (index: number, result?: VisionResult) => void;
  handleManualSearch: (query: string) => void;
  reset: () => void;
}

/**
 * Hook for managing image analysis workflow
 */
export function useAnalysis(options?: UseAnalysisOptions): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>('idle');
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<VisionMatch | null>(null);
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Store imageUri for identifier lookup
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

  /**
   * Run vision analysis on an image
   */
  const runAnalysis = useCallback(async (imageUri: string) => {
    try {
      setState('analyzing');
      setError(null);
      setCurrentImageUri(imageUri);

      const hasApiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const vision = hasApiKey
        ? await analyzeImage(decodeURIComponent(imageUri))
        : await analyzeImageMock(decodeURIComponent(imageUri));

      // Load product images for all matches in parallel
      console.log('[useAnalysis] Loading product images for', vision.matches.length, 'matches...');
      const matchesWithImages = await Promise.all(
        vision.matches.map(async (match) => {
          const searchQuery = match.searchQueries?.ebay || match.searchQuery;
          const imageUrl = await getProductImage(searchQuery);
          return { ...match, imageUrl };
        })
      );

      const visionWithImages = { ...vision, matches: matchesWithImages };
      setVisionResult(visionWithImages);

      // Auto-select if high confidence single match
      if (visionWithImages.matches.length === 1 && visionWithImages.matches[0].confidence >= 0.95) {
        handleMatchSelectInternal(0, visionWithImages, imageUri);
      } else {
        setState('selecting');
      }
    } catch (err) {
      console.error('[useAnalysis] Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setState('error');
    }
  }, []);

  /**
   * Internal match selection handler
   */
  const handleMatchSelectInternal = useCallback((
    index: number, 
    result: VisionResult, 
    imageUri: string
  ) => {
    const match = result.matches[index];
    setSelectedMatch(match);

    // Generate quicklinks
    const ebayQuery = match.searchQueries?.ebay || match.searchQuery;
    const links = generatePlatformLinks(ebayQuery);
    setPlatformLinks(links);

    setState('complete');
    
    // Notify callback
    options?.onMatchSelected?.(match, links);

    // Try to find product identifier if not present
    if (!match.gtin) {
      console.log('[useAnalysis] Attempting to identify product identifier...');
      identifyProductIdentifier(match.productName, decodeURIComponent(imageUri))
        .then(gtin => {
          if (gtin) {
            console.log('[useAnalysis] Found identifier:', gtin);
            setSelectedMatch(prev => prev ? { ...prev, gtin } : null);
            options?.onIdentifierFound?.(gtin);
          }
        });
    }
  }, [options]);

  /**
   * Handle user selecting a match
   */
  const handleMatchSelect = useCallback((index: number, result?: VisionResult) => {
    const vision = result || visionResult;
    if (!vision || !currentImageUri) return;
    
    handleMatchSelectInternal(index, vision, currentImageUri);
  }, [visionResult, currentImageUri, handleMatchSelectInternal]);

  /**
   * Handle manual search query
   */
  const handleManualSearch = useCallback((query: string) => {
    const manualMatch: VisionMatch = {
      productName: query,
      category: 'Gefunden via Suche',
      brand: null,
      condition: 'Gut',
      description: `Manuelle Suche nach: ${query}`,
      confidence: 1.0,
      searchQuery: query,
      searchQueries: {
        ebay: query,
        generic: query
      }
    };
    
    const updatedResult: VisionResult = {
      matches: visionResult ? [...visionResult.matches, manualMatch] : [manualMatch],
      selectedIndex: visionResult ? visionResult.matches.length : 0
    };
    
    setVisionResult(updatedResult);

    if (currentImageUri) {
      handleMatchSelectInternal(
        visionResult?.matches.length || 0, 
        updatedResult, 
        currentImageUri
      );
    }
  }, [visionResult, currentImageUri, handleMatchSelectInternal]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState('idle');
    setVisionResult(null);
    setSelectedMatch(null);
    setPlatformLinks([]);
    setError(null);
    setCurrentImageUri(null);
  }, []);

  return {
    state,
    visionResult,
    selectedMatch,
    platformLinks,
    error,
    runAnalysis,
    handleMatchSelect,
    handleManualSearch,
    reset,
  };
}
