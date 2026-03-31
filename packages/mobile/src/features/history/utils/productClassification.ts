/**
 * Klassifiziert Inventar-Produkte für Händler
 * Fast Seller: Günstig, hohe Nachfrage → schnell verkaufen
 * High Value: Wertvoll/Rarität → auf den richtigen Käufer warten
 */

import type { HistoryItem } from '../store/historyStore';

export type ProductType = 'fast_seller' | 'high_value' | 'normal';

const FAST_SELLER_MAX_PRICE = 30;   // Unter 30€ = Schnellverkäufer
const HIGH_VALUE_MIN_PRICE = 100;   // Über 100€ = High Value

export function classifyProduct(item: HistoryItem): ProductType {
  const avg = item.priceStats?.avgPrice ?? 0;
  if (avg <= 0) return 'normal';
  if (avg >= HIGH_VALUE_MIN_PRICE) return 'high_value';
  if (avg <= FAST_SELLER_MAX_PRICE) return 'fast_seller';
  return 'normal';
}
