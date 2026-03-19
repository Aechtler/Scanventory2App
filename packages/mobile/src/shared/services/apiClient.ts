/**
 * API Client - HTTP-Client mit JWT Auth + Multipart Upload
 * Kommuniziert mit dem ScanApp Backend
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';

const TOKEN_KEY = 'auth_token';

function warnSecureStoreFailure(operation: string, error: unknown): void {
  console.warn(`[apiClient] SecureStore ${operation} failed. Continuing without persisted auth token.`, error);
}

/** Get auth token from secure storage */
async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    warnSecureStoreFailure('read', error);
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
  data: Record<string, unknown>
): Promise<ApiResponse<{ id: string }>> {
  const token = await getAuthToken();

  const uploadResult = await FileSystem.uploadAsync(
    `${API_CONFIG.BASE_URL}/api/items`,
    imageUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
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
