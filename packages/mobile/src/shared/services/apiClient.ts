/**
 * API Client - HTTP-Client mit JWT Auth + Multipart Upload
 * Kommuniziert mit dem ScanApp Backend
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';

const TOKEN_KEY = 'auth_token';

/** Get auth token from secure storage */
async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
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

/** GET Request */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'GET',
    headers: await headers(),
  });
  return res.json();
}

/** POST Request (JSON) */
export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** PUT Request */
export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PUT',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** PATCH Request */
export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PATCH',
    headers: await headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** DELETE Request */
export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'DELETE',
    headers: await headers(),
  });
  return res.json();
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

  return JSON.parse(uploadResult.body);
}
