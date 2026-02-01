/**
 * eBay OAuth Authentication
 * Handles Client Credentials Flow for Browse API access
 */

import { EBAY_CONFIG } from './types';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Base64 encoding for React Native (btoa may not be available)
 */
function base64Encode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const byte1 = str.charCodeAt(i);
    const byte2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const byte3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    
    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = byte3 & 63;
    
    output += chars.charAt(enc1) + chars.charAt(enc2);
    output += i + 1 < str.length ? chars.charAt(enc3) : '=';
    output += i + 2 < str.length ? chars.charAt(enc4) : '=';
  }
  return output;
}

/**
 * Checks if current credentials are sandbox credentials
 */
export function isSandboxMode(): boolean {
  const appId = process.env.EXPO_PUBLIC_EBAY_APP_ID;
  const certId = process.env.EXPO_PUBLIC_EBAY_CERT_ID;
  return Boolean(appId?.includes('-SBX-') || certId?.startsWith('SBX-'));
}

/**
 * Clears the cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Gets an OAuth Application Token from eBay for the Browse API
 * Uses Client Credentials Flow (App ID + Cert ID)
 *
 * NOTE: User Access Tokens (v^1.1#...) do NOT work for Browse API.
 * The Browse API requires Application Tokens via Client Credentials Flow.
 */
export async function getEbayAccessToken(): Promise<string | null> {
  const appId = process.env.EXPO_PUBLIC_EBAY_APP_ID;
  const certId = process.env.EXPO_PUBLIC_EBAY_CERT_ID;

  if (!appId || !certId) {
    console.log('[eBay Auth] No App ID or Cert ID configured');
    return null;
  }

  if (isSandboxMode()) {
    console.log('[eBay Auth] Sandbox credentials detected');
    console.log('[eBay Auth] Note: Sandbox API has limited/no real product data');
  }

  // Check cached token
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    console.log('[eBay Auth] Using cached application token');
    return cachedToken;
  }

  try {
    const credentials = base64Encode(`${appId}:${certId}`);
    console.log('[eBay Auth] Requesting Application Token (Client Credentials Flow)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(EBAY_CONFIG.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('[eBay Auth] OAuth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay Auth] OAuth failed:', response.status, errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error('[eBay Auth] Error details:', errorJson);
      } catch {
        // Text is not JSON
      }

      return null;
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    console.log('[eBay Auth] Application Token obtained successfully');
    console.log('[eBay Auth] Token expires in', data.expires_in, 'seconds');
    return cachedToken;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[eBay Auth] OAuth timeout - request took too long');
    } else {
      console.error('[eBay Auth] OAuth error:', error);
    }
    return null;
  }
}
