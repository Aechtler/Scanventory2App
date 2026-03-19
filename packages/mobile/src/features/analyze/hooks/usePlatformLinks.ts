import { useCallback } from 'react';

import { generatePlatformLinks } from '@/features/market/services/quicklinks';
import type { PlatformLink } from '@/features/market/services/quicklinks';
import type { VisionMatch } from '@/features/scan/services/visionService';

import { buildPlatformQueryInput } from './analysisHelpers';

export function usePlatformLinks(): (match: VisionMatch) => PlatformLink[] {
  return useCallback(
    (match: VisionMatch) => generatePlatformLinks(buildPlatformQueryInput(match)),
    [],
  );
}
