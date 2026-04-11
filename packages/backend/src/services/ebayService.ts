/**
 * eBay Sell API Service
 * OAuth Authorization Code Flow + Inventory/Offer API für direkte Listing-Erstellung
 */

import { config } from '../config';
import { prisma } from './prismaClient';

// ─── Konstanten ────────────────────────────────────────────────────────────────

const EBAY_API_BASE = 'https://api.ebay.com';
const EBAY_AUTH_URL = 'https://auth.ebay.com/oauth2/authorize';
const EBAY_TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const MARKETPLACE_ID = 'EBAY_DE';
const CATEGORY_TREE_ID = '77'; // Deutschland

const SELL_SCOPES = [
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.item',
].join(' ');

// ─── Condition Mapping ─────────────────────────────────────────────────────────

const CONDITION_MAP: Record<string, string> = {
  neu: '1000',
  new: '1000',
  'sehr gut': '3000',
  very_good: '3000',
  'wie neu': '2750',
  gut: '3000',
  good: '3000',
  akzeptabel: '5000',
  acceptable: '5000',
  defekt: '7000',
  for_parts: '7000',
};

function mapCondition(condition: string): string {
  const key = condition.toLowerCase().trim();
  return CONDITION_MAP[key] ?? '3000'; // Default: Used
}

// ─── Auth Helpers ──────────────────────────────────────────────────────────────

function getBasicAuth(): string {
  return Buffer.from(`${config.ebay.appId}:${config.ebay.certId}`).toString('base64');
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

export function getAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: config.ebay.appId,
    redirect_uri: config.ebay.ruName,
    response_type: 'code',
    scope: SELL_SCOPES,
    state: userId,
  });
  return `${EBAY_AUTH_URL}?${params}`;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export async function exchangeCode(code: string): Promise<TokenData> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.ebay.ruName,
  });

  const res = await fetch(EBAY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

async function doRefreshToken(refreshToken: string): Promise<TokenData> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    scope: SELL_SCOPES,
  });

  const res = await fetch(EBAY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay token refresh failed: ${res.status} ${text}`);
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in,
  };
}

/** Gibt einen gültigen Access Token zurück, refresht automatisch wenn nötig */
export async function getValidAccessToken(userId: string): Promise<string> {
  const conn = await prisma.ebayConnection.findUnique({ where: { userId } });
  if (!conn) throw new Error('eBay not connected for this user');

  const now = new Date();
  const expiryBuffer = new Date(conn.tokenExpiry.getTime() - 5 * 60 * 1000); // 5 min buffer

  if (now < expiryBuffer) {
    return conn.accessToken;
  }

  // Token abgelaufen → refreshen
  const refreshed = await doRefreshToken(conn.refreshToken);
  const newExpiry = new Date(Date.now() + refreshed.expiresIn * 1000);

  await prisma.ebayConnection.update({
    where: { userId },
    data: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      tokenExpiry: newExpiry,
    },
  });

  return refreshed.accessToken;
}

// ─── Business Policies ────────────────────────────────────────────────────────

interface Policies {
  fulfillmentPolicyId: string;
  paymentPolicyId: string;
  returnPolicyId: string;
}

async function fetchFirstPolicy(
  token: string,
  endpoint: string,
  resultKey: string,
  idField: string,
): Promise<string> {
  const res = await fetch(
    `${EBAY_API_BASE}/sell/account/v1/${endpoint}?marketplace_id=${MARKETPLACE_ID}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch eBay ${endpoint}: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as Record<string, unknown[]>;
  const items = data[resultKey];

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      `No ${endpoint} found. Please create at least one in eBay Seller Hub → Business Policies.`,
    );
  }

  return (items[0] as Record<string, string>)[idField];
}

export async function fetchPolicies(token: string): Promise<Policies> {
  const [fulfillmentPolicyId, paymentPolicyId, returnPolicyId] = await Promise.all([
    fetchFirstPolicy(token, 'fulfillment_policy', 'fulfillmentPolicies', 'fulfillmentPolicyId'),
    fetchFirstPolicy(token, 'payment_policy', 'paymentPolicies', 'paymentPolicyId'),
    fetchFirstPolicy(token, 'return_policy', 'returnPolicies', 'returnPolicyId'),
  ]);
  return { fulfillmentPolicyId, paymentPolicyId, returnPolicyId };
}

// ─── Category Suggestion ──────────────────────────────────────────────────────

export async function suggestCategory(token: string, query: string): Promise<string> {
  try {
    const res = await fetch(
      `${EBAY_API_BASE}/commerce/taxonomy/v1/category_tree/${CATEGORY_TREE_ID}/get_category_suggestions?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!res.ok) throw new Error('Category suggestion failed');

    const data = await res.json() as {
      categorySuggestions?: { category: { categoryId: string } }[];
    };

    return data.categorySuggestions?.[0]?.category?.categoryId ?? '99'; // 99 = Everything Else
  } catch {
    return '99';
  }
}

// ─── Merchant Location ────────────────────────────────────────────────────────

const DEFAULT_LOCATION_KEY = 'scandirwas_default';

export async function ensureMerchantLocation(token: string): Promise<string> {
  // Prüfen ob Location schon existiert
  const checkRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/location/${DEFAULT_LOCATION_KEY}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (checkRes.ok) return DEFAULT_LOCATION_KEY;

  // Location anlegen
  const createRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/location/${DEFAULT_LOCATION_KEY}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: {
          address: {
            country: 'DE',
          },
        },
        locationInstructions: 'Abholung nach Absprache',
        name: 'Standard-Standort',
        merchantLocationStatus: 'ENABLED',
        locationTypes: ['WAREHOUSE'],
      }),
    },
  );

  if (!createRes.ok && createRes.status !== 204) {
    const text = await createRes.text();
    console.warn('[eBay] Location create warning:', text);
  }

  return DEFAULT_LOCATION_KEY;
}

// ─── Listing erstellen ────────────────────────────────────────────────────────

export interface CreateListingData {
  sku: string;           // = our listing ID
  title: string;
  description: string;
  condition: string;
  imageUrls: string[];
  price: number;
  currency: string;
  listingType: 'FIXED_PRICE' | 'AUCTION';
  startingPrice?: number;
  quantity: number;
}

export interface ListingResult {
  listingId: string;
  listingUrl: string;
}

export async function createEbayListing(
  userId: string,
  data: CreateListingData,
): Promise<ListingResult> {
  const token = await getValidAccessToken(userId);

  const [policies, categoryId, locationKey] = await Promise.all([
    fetchPolicies(token),
    suggestCategory(token, data.title),
    ensureMerchantLocation(token),
  ]);

  // 1. Inventory Item anlegen / updaten
  const inventoryRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(data.sku)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Language': 'de-DE',
      },
      body: JSON.stringify({
        availability: {
          shipToLocationAvailability: {
            quantity: data.quantity,
          },
        },
        condition: mapCondition(data.condition),
        product: {
          title: data.title.slice(0, 80),
          description: data.description || data.title,
          imageUrls: data.imageUrls.slice(0, 12),
        },
      }),
    },
  );

  if (!inventoryRes.ok && inventoryRes.status !== 204) {
    const text = await inventoryRes.text();
    throw new Error(`eBay inventory_item failed: ${inventoryRes.status} ${text}`);
  }

  // 2. Offer anlegen
  const isAuction = data.listingType === 'AUCTION';

  const offerBody: Record<string, unknown> = {
    sku: data.sku,
    marketplaceId: MARKETPLACE_ID,
    format: isAuction ? 'AUCTION' : 'FIXED_PRICE',
    availableQuantity: data.quantity,
    categoryId,
    listingDescription: data.description || data.title,
    listingPolicies: {
      fulfillmentPolicyId: policies.fulfillmentPolicyId,
      paymentPolicyId: policies.paymentPolicyId,
      returnPolicyId: policies.returnPolicyId,
    },
    merchantLocationKey: locationKey,
    pricingSummary: isAuction
      ? {
          auctionStartPrice: {
            currency: data.currency,
            value: String(data.startingPrice ?? 0),
          },
        }
      : {
          price: {
            currency: data.currency,
            value: String(data.price),
          },
        },
  };

  const offerRes = await fetch(`${EBAY_API_BASE}/sell/inventory/v1/offer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Language': 'de-DE',
    },
    body: JSON.stringify(offerBody),
  });

  if (!offerRes.ok) {
    const text = await offerRes.text();
    throw new Error(`eBay create offer failed: ${offerRes.status} ${text}`);
  }

  const offerData = await offerRes.json() as { offerId: string };
  const offerId = offerData.offerId;

  // 3. Offer publishen → wird live
  const publishRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/offer/${offerId}/publish`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!publishRes.ok) {
    const text = await publishRes.text();
    throw new Error(`eBay publish offer failed: ${publishRes.status} ${text}`);
  }

  const publishData = await publishRes.json() as { listingId: string };
  const listingId = publishData.listingId;

  return {
    listingId,
    listingUrl: `https://www.ebay.de/itm/${listingId}`,
  };
}

export function isEbayConfigured(): boolean {
  return !!(config.ebay.appId && config.ebay.certId && config.ebay.ruName);
}

// ─── Order API ───────────────────────────────────────────────────────────────

export interface BuyerAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  zip: string;
  country: string;
}

export interface EbayOrder {
  orderId: string;
  buyerName: string;
  buyerAddress: BuyerAddress;
  paymentStatus: 'paid' | 'pending' | 'failed';
  totalAmount: number;
  currency: string;
  lineItems: { itemId: string; title: string; quantity: number; soldPrice: number }[];
  createdAt: string;
}

/** Alle offenen/neuen Bestellungen des Users abrufen (letzte 30 Tage) */
export async function fetchRecentOrders(userId: string): Promise<EbayOrder[]> {
  const token = await getValidAccessToken(userId);

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url =
    `${EBAY_API_BASE}/sell/fulfillment/v1/order` +
    `?filter=creationdate:[${since}..],orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}` +
    `&limit=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': MARKETPLACE_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay orders fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json() as {
    orders?: RawEbayOrder[];
  };

  return (data.orders ?? []).map(parseOrder);
}

/** Eine spezifische Bestellung per Order-ID abrufen */
export async function fetchOrder(userId: string, orderId: string): Promise<EbayOrder> {
  const token = await getValidAccessToken(userId);

  const res = await fetch(`${EBAY_API_BASE}/sell/fulfillment/v1/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': MARKETPLACE_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay order fetch failed: ${res.status} ${text}`);
  }

  return parseOrder(await res.json() as RawEbayOrder);
}

interface RawEbayOrder {
  orderId: string;
  buyer?: {
    username?: string;
    buyerRegistrationAddress?: {
      fullName?: string;
      contactAddress?: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        postalCode?: string;
        countryCode?: string;
      };
    };
  };
  paymentSummary?: {
    payments?: { paymentStatus?: string }[];
    totalDueSeller?: { value?: string; currency?: string };
  };
  lineItems?: {
    legacyItemId?: string;
    title?: string;
    quantity?: number;
    lineItemCost?: { value?: string };
  }[];
  creationDate?: string;
}

function parseOrder(raw: RawEbayOrder): EbayOrder {
  const addr = raw.buyer?.buyerRegistrationAddress;
  const contact = addr?.contactAddress;
  const payment = raw.paymentSummary?.payments?.[0];
  const rawStatus = payment?.paymentStatus?.toLowerCase() ?? '';

  let paymentStatus: 'paid' | 'pending' | 'failed';
  if (rawStatus === 'paid') paymentStatus = 'paid';
  else if (rawStatus === 'failed' || rawStatus === 'declined') paymentStatus = 'failed';
  else paymentStatus = 'pending';

  return {
    orderId: raw.orderId,
    buyerName: addr?.fullName ?? raw.buyer?.username ?? 'Unbekannt',
    buyerAddress: {
      name: addr?.fullName ?? raw.buyer?.username ?? '',
      line1: contact?.addressLine1 ?? '',
      line2: contact?.addressLine2,
      city: contact?.city ?? '',
      zip: contact?.postalCode ?? '',
      country: contact?.countryCode ?? 'DE',
    },
    paymentStatus,
    totalAmount: parseFloat(raw.paymentSummary?.totalDueSeller?.value ?? '0'),
    currency: raw.paymentSummary?.totalDueSeller?.currency ?? 'EUR',
    lineItems: (raw.lineItems ?? []).map((li) => ({
      itemId: li.legacyItemId ?? '',
      title: li.title ?? '',
      quantity: li.quantity ?? 1,
      soldPrice: parseFloat(li.lineItemCost?.value ?? '0'),
    })),
    createdAt: raw.creationDate ?? new Date().toISOString(),
  };
}
