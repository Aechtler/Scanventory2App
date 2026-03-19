import { useCallback } from 'react';

import {
  analyzeImage,
  analyzeImageMock,
  type VisionResult,
} from '@/features/scan/services/visionService';

import { getAutoSelectMatchIndex } from './analysisHelpers';
import { useProductImages } from './useProductImages';

export interface CompletedVisionAnalysis {
  result: VisionResult;
  autoSelectIndex: number | null;
}

export function useVisionAnalysis() {
  const loadProductImages = useProductImages();

  return useCallback(async (imageUri: string): Promise<CompletedVisionAnalysis> => {
    const decodedImageUri = decodeURIComponent(imageUri);
    const hasApiKey = Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    const vision = hasApiKey
      ? await analyzeImage(decodedImageUri)
      : await analyzeImageMock(decodedImageUri);

    console.log('[useAnalysis] Loading product images for', vision.matches.length, 'matches...');

    const result = {
      ...vision,
      matches: await loadProductImages(vision.matches),
    };

    return {
      result,
      autoSelectIndex: getAutoSelectMatchIndex(result),
    };
  }, [loadProductImages]);
}
