/**
 * API Client - HTTP-Client mit API-Key Auth + Multipart Upload
 * Kommuniziert mit dem ScanApp Backend
 */

import * as FileSystem from 'expo-file-system/legacy';
import { API_CONFIG } from '@/shared/constants';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

function headers(): Record<string, string> {
  return {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  };
}

/** GET Request */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'GET',
    headers: headers(),
  });
  return res.json();
}

/** POST Request (JSON) */
export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** PUT Request */
export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** PATCH Request */
export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

/** DELETE Request */
export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method: 'DELETE',
    headers: headers(),
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
      headers: {
        'X-API-Key': API_KEY,
      },
    }
  );

  return JSON.parse(uploadResult.body);
}
