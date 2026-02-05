// Scan Feature - Type Definitions

/**
 * Ergebnis einer Bilderkennung
 */
export interface RecognitionResult {
  id: string;
  label: string;
  confidence: number;
  category: string;
  thumbnailUrl?: string;
}

/**
 * Scan-Ergebnis mit allen erkannten Möglichkeiten
 */
export interface ScanResult {
  imageUri: string;
  recognitions: RecognitionResult[];
  selectedRecognition?: RecognitionResult;
  scannedAt: Date;
}

/**
 * Status des Scan-Vorgangs
 */
export type ScanStatus =
  | 'idle'
  | 'capturing'
  | 'processing'
  | 'selecting'
  | 'complete'
  | 'error';
