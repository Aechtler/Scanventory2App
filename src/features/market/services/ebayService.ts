/**
 * eBay Market Service
 * Sucht nach Produkten und berechnet Preisstatistiken
 * 
 * Verwendet die eBay Browse API mit Client Credentials OAuth Flow
 */

export interface MarketListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  sold: boolean;
}

export interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalListings: number;
  soldListings: number;
}

export interface MarketResult {
  query: string;
  platform: 'ebay' | 'kleinanzeigen' | 'amazon' | 'idealo';
  priceStats: PriceStats;
  listings: MarketListing[];
  fetchedAt: Date;
}

// eBay API Configuration
const EBAY_SANDBOX_AUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
const EBAY_SANDBOX_API_URL = 'https://api.sandbox.ebay.com/buy/browse/v1';

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
 * Holt einen OAuth Access Token von eBay (Client Credentials Flow)
 */
async function getEbayAccessToken(): Promise<string | null> {
  const appId = process.env.EXPO_PUBLIC_EBAY_APP_ID;
  const certId = process.env.EXPO_PUBLIC_EBAY_CERT_ID;
  
  console.log('[eBay] Checking credentials...', { appId: appId?.substring(0, 10), certId: certId?.substring(0, 10) });
  
  if (!appId || !certId) {
    console.log('[eBay] Credentials not configured');
    return null;
  }
  
  // Check cached token
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    console.log('[eBay] Using cached token');
    return cachedToken;
  }
  
  try {
    const credentials = base64Encode(`${appId}:${certId}`);
    console.log('[eBay] Requesting OAuth token...');
    
    const response = await fetch(EBAY_SANDBOX_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });
    
    console.log('[eBay] OAuth response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay] OAuth failed:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    console.log('[eBay] OAuth token obtained, expires in', data.expires_in, 'seconds');
    return cachedToken;
  } catch (error) {
    console.error('[eBay] OAuth error:', error);
    return null;
  }
}

/**
 * Sucht nach Produkten auf eBay
 */
async function searchEbayReal(query: string): Promise<MarketResult | null> {
  console.log('[eBay] Starting search for:', query);
  
  const token = await getEbayAccessToken();
  if (!token) {
    console.log('[eBay] No token available, skipping search');
    return null;
  }
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${EBAY_SANDBOX_API_URL}/item_summary/search?q=${encodedQuery}&limit=50`;
    
    console.log('[eBay] Search URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[eBay] Search response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[eBay] Search failed:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('[eBay] Search results:', data.total, 'items found');
    
    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      console.log('[eBay] No items in response');
      return null;
    }
    
    // Parse items and extract prices
    const listings: MarketListing[] = [];
    const prices: number[] = [];
    
    for (const item of data.itemSummaries) {
      const priceValue = parseFloat(item.price?.value || '0');
      if (priceValue > 0) {
        prices.push(priceValue);
        listings.push({
          id: item.itemId,
          title: item.title,
          price: priceValue,
          currency: item.price?.currency || 'EUR',
          condition: item.condition || 'Unbekannt',
          imageUrl: item.thumbnailImages?.[0]?.imageUrl || '',
          itemUrl: item.itemWebUrl || '',
          sold: false, // Browse API shows active listings
        });
      }
    }
    
    if (prices.length === 0) {
      return null;
    }
    
    prices.sort((a, b) => a - b);
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];
    
    return {
      query,
      platform: 'ebay',
      priceStats: {
        minPrice: prices[0],
        maxPrice: prices[prices.length - 1],
        avgPrice: Math.round(avgPrice * 100) / 100,
        medianPrice,
        totalListings: listings.length,
        soldListings: 0, // Browse API shows active listings only
      },
      listings,
      fetchedAt: new Date(),
    };
  } catch (error) {
    console.error('eBay search error:', error);
    return null;
  }
}

/**
 * Sucht nach Produkten auf dem Markt
 * Versucht zuerst die echte eBay API, fällt bei Fehler auf null zurück
 */
export async function searchMarket(
  query: string,
  _category: string = 'Sonstiges'
): Promise<MarketResult | null> {
  // Try real eBay API
  const result = await searchEbayReal(query);
  return result;
}

/**
 * Formatiert einen Preis für die Anzeige
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formatiert eine Preisspanne für die Anzeige
 */
export function formatPriceRange(min: number, max: number, currency: string = 'EUR'): string {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
