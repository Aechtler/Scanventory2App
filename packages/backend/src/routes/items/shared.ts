import fs from 'fs';

type JsonResponse = {
  status(code: number): JsonResponse;
  json(body: unknown): void;
};

type QueryParams = {
  page?: string | string[];
  limit?: string | string[];
};

type AuthenticatedRequestLike = {
  user?: {
    userId: string;
  };
};

type CreateItemBodyLike = {
  productName?: unknown;
  category?: unknown;
  condition?: unknown;
  searchQuery?: unknown;
  confidence?: unknown;
  scannedAt?: unknown;
};

export type IdParams = { id: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSingleQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function cleanupTempUpload(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to clean up temp upload:', error);
  }
}

export function getPaginationParams(query: QueryParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(getSingleQueryValue(query.page) ?? '', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(getSingleQueryValue(query.limit) ?? '', 10) || 20)
  );

  return { page, limit };
}

export function cleanupSavedImage(
  imageFilename: string,
  context: string,
  deleteImage: (filename: string) => void
): void {
  try {
    deleteImage(imageFilename);
  } catch (error) {
    console.error(`Failed to clean up saved image after ${context}:`, error);
  }
}

export function requireAuthenticatedUserId(
  req: AuthenticatedRequestLike,
  res: JsonResponse
): string | null {
  const userId = req.user?.userId;

  if (!userId || !uuidPattern.test(userId)) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid authenticated user context' },
    });
    return null;
  }

  return userId;
}

export function validateItemId(id: string, res: JsonResponse): boolean {
  if (!uuidPattern.test(id)) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid item id format' },
    });
    return false;
  }

  return true;
}

export function parseCreateItemData(rawData: unknown):
  | { data: CreateItemBodyLike }
  | { error: string } {
  if (typeof rawData !== 'string') {
    return { error: 'Invalid JSON in data field' };
  }

  try {
    return { data: JSON.parse(rawData) as CreateItemBodyLike };
  } catch {
    return { error: 'Invalid JSON in data field' };
  }
}

export function getCreateItemBodyValidationError(
  data: CreateItemBodyLike | null | undefined
): string | null {
  if (!data || typeof data !== 'object') {
    return 'Item payload is required';
  }

  if (!data.productName || typeof data.productName !== 'string') {
    return 'productName is required';
  }

  if (!data.category || typeof data.category !== 'string') {
    return 'category is required';
  }

  if (!data.condition || typeof data.condition !== 'string') {
    return 'condition is required';
  }

  if (!data.searchQuery || typeof data.searchQuery !== 'string') {
    return 'searchQuery is required';
  }

  if (typeof data.confidence !== 'number' || Number.isNaN(data.confidence)) {
    return 'confidence must be a valid number';
  }

  if (!data.scannedAt || Number.isNaN(Date.parse(data.scannedAt))) {
    return 'scannedAt must be a valid ISO date string';
  }

  return null;
}
