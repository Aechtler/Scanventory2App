import type { VisionMatch } from '@/features/scan/services/visionService';

const DEFAULT_PRODUCT_IMAGE_TIMEOUT_MS = 3500;

function createTimeoutError(timeoutMs: number, context: string): Error {
  return new Error(`${context} timed out after ${timeoutMs}ms`);
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  context = 'Operation'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(createTimeoutError(timeoutMs, context)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function loadMatchImages(
  matches: VisionMatch[],
  resolveImage: (query: string) => Promise<string | null>,
  timeoutMs = DEFAULT_PRODUCT_IMAGE_TIMEOUT_MS
): Promise<VisionMatch[]> {
  const imageResults = await Promise.allSettled(
    matches.map(async (match) => {
      const searchQuery = match.searchQueries?.ebay || match.searchQuery;

      if (!searchQuery?.trim()) {
        return match;
      }

      const imageUrl = await withTimeout(
        resolveImage(searchQuery),
        timeoutMs,
        `Product image lookup for "${searchQuery}"`
      );

      return { ...match, imageUrl };
    })
  );

  return imageResults.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    console.warn('[useAnalysis] Product image lookup failed:', result.reason);
    return matches[index];
  });
}

export { DEFAULT_PRODUCT_IMAGE_TIMEOUT_MS };
