import { useCallback } from 'react';

import { loadMatchImages } from '@/features/analyze/utils/productImageLoading';
import { getProductImage } from '@/features/market/services/ebay/images';
import type { VisionMatch } from '@/features/scan/services/visionService';

export function useProductImages() {
  return useCallback(
    (matches: VisionMatch[]) => loadMatchImages(matches, getProductImage),
    [],
  );
}
