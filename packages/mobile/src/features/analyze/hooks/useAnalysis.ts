import { useState, useCallback } from 'react';
import {
  type VisionResult,
  type VisionMatch,
  identifyProductIdentifier,
} from '@/features/scan/services/visionService';
import type { PlatformLink } from '@/features/market/services/quicklinks';

import { createManualVisionMatch } from './analysisHelpers';
import { usePlatformLinks } from './usePlatformLinks';
import { useVisionAnalysis } from './useVisionAnalysis';

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
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  const analyzeVision = useVisionAnalysis();
  const createPlatformLinks = usePlatformLinks();

  const runAnalysis = useCallback(async (imageUri: string) => {
    try {
      setState('analyzing');
      setError(null);
      setCurrentImageUri(imageUri);

      const { result, autoSelectIndex } = await analyzeVision(imageUri);
      setVisionResult(result);

      if (autoSelectIndex !== null) {
        handleMatchSelectInternal(autoSelectIndex, result, imageUri);
        return;
      }

      setState('selecting');
    } catch (err) {
      console.error('[useAnalysis] Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setState('error');
    }
  }, [analyzeVision]);

  const handleMatchSelectInternal = useCallback((
    index: number,
    result: VisionResult,
    imageUri: string,
  ) => {
    const match = result.matches[index];
    setSelectedMatch(match);

    const links = createPlatformLinks(match);
    setPlatformLinks(links);
    setState('complete');
    options?.onMatchSelected?.(match, links);

    if (!match.gtin) {
      console.log('[useAnalysis] Attempting to identify product identifier...');
      identifyProductIdentifier(match.productName, decodeURIComponent(imageUri))
        .then((gtin) => {
          if (gtin) {
            console.log('[useAnalysis] Found identifier:', gtin);
            setSelectedMatch((prev) => (prev ? { ...prev, gtin } : null));
            options?.onIdentifierFound?.(gtin);
          }
        });
    }
  }, [createPlatformLinks, options]);

  const handleMatchSelect = useCallback((index: number, result?: VisionResult) => {
    const vision = result || visionResult;
    if (!vision || !currentImageUri) return;

    handleMatchSelectInternal(index, vision, currentImageUri);
  }, [visionResult, currentImageUri, handleMatchSelectInternal]);

  const handleManualSearch = useCallback((query: string) => {
    const manualMatch = createManualVisionMatch(query);
    const updatedResult: VisionResult = {
      matches: visionResult ? [...visionResult.matches, manualMatch] : [manualMatch],
      selectedIndex: visionResult ? visionResult.matches.length : 0,
    };

    setVisionResult(updatedResult);

    if (currentImageUri) {
      handleMatchSelectInternal(
        visionResult?.matches.length || 0,
        updatedResult,
        currentImageUri,
      );
    }
  }, [visionResult, currentImageUri, handleMatchSelectInternal]);

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
