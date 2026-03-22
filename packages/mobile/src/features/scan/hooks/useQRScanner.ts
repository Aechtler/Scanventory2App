import { useCallback, useRef, useState } from 'react';

export interface BarcodeScanEvent {
  type: string;
  data: string;
}

export type QRScanResultType = 'barcode' | 'url' | 'text';

export interface QRScanResult {
  type: QRScanResultType;
  rawData: string;
  gtin?: string;
  searchQuery: string;
  label: string; // Anzeigename für den User
}

// Barcode-Typen die als Produkt-Identifier (GTIN) gelten
const GTIN_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'itf14', 'codabar'];

/**
 * Extrahiert einen Suchbegriff aus einer Produkt-URL
 * Unterstützt Amazon, eBay und generische URLs
 */
function extractQueryFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Amazon: /dp/ASIN oder Suchanfrage
    if (urlObj.hostname.includes('amazon')) {
      const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1]
        || url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1];
      if (asin) return asin;
      const q = urlObj.searchParams.get('k') || urlObj.searchParams.get('field-keywords');
      if (q) return q;
    }

    // eBay: Artikel-ID oder Suchanfrage
    if (urlObj.hostname.includes('ebay')) {
      const q = urlObj.searchParams.get('_nkw');
      if (q) return q;
      const itemId = url.match(/\/itm\/(\d+)/)?.[1];
      if (itemId) return `eBay Artikel ${itemId}`;
    }

    // Idealo
    if (urlObj.hostname.includes('idealo')) {
      const productName = urlObj.pathname.split('/').filter(Boolean).pop();
      if (productName && productName.length > 3) {
        return decodeURIComponent(productName.replace(/-/g, ' '));
      }
    }

    // Generisch: letztes Pfadsegment als Suchbegriff
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments.pop();
    if (lastSegment && lastSegment.length > 3 && !/^\d+$/.test(lastSegment)) {
      return decodeURIComponent(lastSegment.replace(/[-_]/g, ' '));
    }

    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Verarbeitet ein gescanntes Barcode-Event und gibt ein strukturiertes Ergebnis zurück
 */
function parseBarcodeScanEvent(event: BarcodeScanEvent): QRScanResult {
  const { type, data } = event;

  // EAN/UPC-Barcodes → direkt als GTIN verwenden
  if (GTIN_BARCODE_TYPES.includes(type.toLowerCase())) {
    return {
      type: 'barcode',
      rawData: data,
      gtin: data,
      searchQuery: data,
      label: `Barcode: ${data}`,
    };
  }

  // QR-Code mit URL
  const isUrl = data.startsWith('http://') || data.startsWith('https://');
  if (isUrl) {
    const query = extractQueryFromUrl(data);
    return {
      type: 'url',
      rawData: data,
      searchQuery: query,
      label: query,
    };
  }

  // QR-Code mit Text (z.B. Produktname direkt)
  return {
    type: 'text',
    rawData: data,
    searchQuery: data,
    label: data,
  };
}

/**
 * Hook für QR/Barcode-Scanner Logik
 * Verhindert mehrfaches Scannen durch einen Lock-Mechanismus
 */
export function useQRScanner() {
  const [scanned, setScanned] = useState(false);
  const lockRef = useRef(false);

  const handleScan = useCallback((event: BarcodeScanEvent): QRScanResult | null => {
    // Doppel-Scans verhindern
    if (lockRef.current) return null;
    lockRef.current = true;
    setScanned(true);

    return parseBarcodeScanEvent(event);
  }, []);

  const reset = useCallback(() => {
    lockRef.current = false;
    setScanned(false);
  }, []);

  return { scanned, handleScan, reset };
}
