/**
 * Export Service
 * Exportiert Verlaufsdaten als CSV oder zum Teilen
 */

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { HistoryItem } from '../store/historyStore';

/**
 * Exportiert Verlaufsdaten als CSV-String
 */
export function generateCSV(items: HistoryItem[]): string {
  const headers = [
    'Produkt',
    'Kategorie',
    'Marke',
    'Zustand',
    'Ø Preis',
    'Min. Preis',
    'Max. Preis',
    'Datum',
  ];

  const rows = items.map((item) => [
    `"${item.productName.replace(/"/g, '""')}"`,
    item.category,
    item.brand || '-',
    item.condition,
    item.priceStats.avgPrice.toFixed(2),
    item.priceStats.minPrice.toFixed(2),
    item.priceStats.maxPrice.toFixed(2),
    new Date(item.scannedAt).toLocaleDateString('de-DE'),
  ]);

  return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
}

/**
 * Exportiert und teilt CSV-Datei
 */
export async function exportAndShareCSV(items: HistoryItem[]): Promise<void> {
  const csv = generateCSV(items);
  const filename = `scanapp_export_${Date.now()}.csv`;
  const filepath = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(filepath, csv, {
    encoding: 'utf8',
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(filepath, {
      mimeType: 'text/csv',
      dialogTitle: 'Verlauf exportieren',
    });
  } else {
    throw new Error('Teilen nicht verfügbar');
  }
}

/**
 * Berechnet den Gesamtwert aller Items
 */
export function calculateTotalValue(items: HistoryItem[]): number {
  return items.reduce((sum, item) => sum + item.priceStats.avgPrice, 0);
}
