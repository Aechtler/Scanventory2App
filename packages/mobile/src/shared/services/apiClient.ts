/**
 * API Client - HTTP-Client mit JWT Auth + Multipart Upload
 * Kommuniziert mit dem ScanApp Backend
 */

import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PriceStats, MarketListing } from '@/features/market/services/ebay';
import { MarketValueResult } from '@/features/market/services/perplexity';
import { API_CONFIG, UPLOAD_CONFIG } from '@/shared/constants';

const TOKEN_KEY = 'auth_token';

type SearchQueries = {
  ebay?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
};

export interface UploadItemPayload {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  gtin?: string | null;
  searchQuery: string;
  searchQueries?: SearchQueries;
  originalUri?: string;
  priceStats?: PriceStats;
  ebayListings?: MarketListing[];
  ebayListingsFetchedAt?: string;
  marketValue?: MarketValueResult;
  marketValueFetchedAt?: string;
  scannedAt: string;
}


function getFileExtension(uri: string): string {
  const sanitizedUri = uri.split('?')[0];
  const lastDotIndex = sanitizedUri.lastIndexOf('.');
  const lastSlashIndex = Math.max(sanitizedUri.lastIndexOf('/'), sanitizedUri.lastIndexOf('\\'));

  if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
    return '';
  }

  return sanitizedUri.slice(lastDotIndex).toLowerCase();
}

function inferMimeTypeFromUri(uri: string): string | null {
  const extension = getFileExtension(uri);

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return null;
  }
}

async function validateUploadImage(imageUri: string): Promise<void> {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Image URI is required for upload.');
  }

  const normalizedUri = imageUri.trim();
  if (!normalizedUri) {
    throw new Error('Image URI is empty.');
  }

  const hasSupportedScheme = /^(file|content|ph):/i.test(normalizedUri);
  if (!hasSupportedScheme) {
    throw new Error('Unsupported image URI. Expected a local file URI.');
  }

  const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
  if (!fileInfo.exists) {
    throw new Error('Selected image file does not exist anymore.');
  }

  if (typeof fileInfo.size === 'number' && fileInfo.size > UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error(`Selected image is too large. Maximum upload size is ${Math.round(UPLOAD_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB.`);
  }

  const extension = getFileExtension(normalizedUri);
  if (extension && !UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension as typeof UPLOAD_CONFIG.ALLOWED_EXTENSIONS[number])) {
    throw new Error('Unsupported image file type. Please use JPG, PNG, or WEBP.');
  }

  const inferredMimeType = inferMimeTypeFromUri(normalizedUri);
  if (inferredMimeType && !UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(inferredMimeType as typeof UPLOAD_CONFIG.ALLOWED_MIME_TYPES[number])) {
    throw new Error('Unsupported image MIME type. Please use JPG, PNG, or WEBP.');
  }
}

/** Get auth token from AsyncStorage (same storage as authStore) */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('[apiClient] AsyncStorage read failed. Continuing without auth token.', error);
    return null;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function headers(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

/** Fetch with timeout using AbortController */
async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** Handle response: check status and parse JSON safely */
async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    try {
      return await res.json();
    } catch {
      return {
        success: false,
        error: { code: 'HTTP_ERROR', message: `HTTP ${res.status}: ${res.statusText}` },
      };
    }
  }
  return res.json();
}

/** GET Request */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'GET',
    headers: await headers(),
  });
  return handleResponse<T>(res);
}

/** POST Request (JSON) */
export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** PUT Request */
export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PUT',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** PATCH Request */
export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PATCH',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** DELETE Request */
export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetchWithTimeout(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await headers(),
  });
  return handleResponse<T>(res);
}

/**
 * Multipart Upload - Bild + JSON-Daten
 * Nutzt expo-file-system fuer nativen Upload
 */
export async function apiUploadItem(
  imageUri: string,
  data: UploadItemPayload
): Promise<ApiResponse<{ id: string }>> {
  await validateUploadImage(imageUri);

  const token = await getAuthToken();
  const mimeType = inferMimeTypeFromUri(imageUri) || 'image/jpeg';

  const uploadResult = await FileSystem.uploadAsync(
    `${API_CONFIG.BASE_URL}/api/items`,
    imageUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType,
      parameters: {
        data: JSON.stringify(data),
      },
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }
  );

  try {
    return JSON.parse(uploadResult.body);
  } catch {
    return {
      success: false,
      error: { code: 'PARSE_ERROR', message: 'Failed to parse upload response' },
    };
  }
}
