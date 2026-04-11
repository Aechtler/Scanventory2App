/**
 * Expo Push Notification Service
 * Sendet Push-Notifications an Nutzer via Expo Push API.
 */

import { config } from '../config';

interface PushMessage {
  to: string; // Expo Push Token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
}

interface ExpoTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (!pushToken.startsWith('ExponentPushToken[') && !pushToken.startsWith('ExpoPushToken[')) {
    console.warn('[Push] Invalid token format, skipping:', pushToken.slice(0, 20));
    return;
  }

  const message: PushMessage = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: data ?? {},
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (config.expo.accessToken) {
    headers['Authorization'] = `Bearer ${config.expo.accessToken}`;
  }

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      console.error('[Push] Expo API error:', res.status, await res.text());
      return;
    }

    const result = await res.json() as { data: ExpoTicket };
    if (result.data?.status === 'error') {
      console.error('[Push] Ticket error:', result.data.message, result.data.details);
    }
  } catch (e) {
    console.error('[Push] Failed to send notification:', e);
  }
}

export async function sendSoldNotification(
  pushToken: string,
  productName: string,
  soldPrice: number,
  buyerName?: string,
  buyerAddress?: string,
): Promise<void> {
  const title = `Verkauft: ${productName}`;
  const lines = [`Für ${soldPrice.toFixed(2)} € verkauft!`];
  if (buyerName) lines.push(`Käufer: ${buyerName}`);
  if (buyerAddress) lines.push(`Adresse: ${buyerAddress}`);

  await sendPushNotification(pushToken, title, lines.join('\n'), {
    type: 'sold',
    soldPrice,
    buyerName,
    buyerAddress,
  });
}
