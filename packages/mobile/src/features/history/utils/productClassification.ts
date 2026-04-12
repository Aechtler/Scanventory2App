/**
 * Klassifiziert Inventar-Produkte für Händler
 * Fast Seller: Günstig, hohe Nachfrage → schnell verkaufen
 * High Value: Wertvoll/Rarität → auf den richtigen Käufer warten
 */

import type { HistoryItem } from '../store/historyStore';
import { getLibraryDisplayPrice } from './historyPricing.ts';

export type ProductType = 'fast_seller' | 'high_value' | 'normal';

const FAST_SELLER_MAX_PRICE = 30;   // Unter 30€ = Schnellverkäufer
const HIGH_VALUE_MIN_PRICE = 100;   // Über 100€ = High Value

export function classifyProduct(item: HistoryItem): ProductType {
  const price = getLibraryDisplayPrice(item) ?? 0;
  if (price <= 0) return 'normal';
  if (price >= HIGH_VALUE_MIN_PRICE) return 'high_value';
  if (price <= FAST_SELLER_MAX_PRICE) return 'fast_seller';
  return 'normal';
}
