// Scan Feature - Public API

// Types
export type {
  RecognitionResult,
  ScanResult,
  ScanStatus,
} from './types/scan.types';

// Components
export { QRScannerOverlay } from './components/QRScannerOverlay';
export { MatchSelectionSheet } from './components/MatchSelectionSheet';

// Hooks
export { useQRScanner } from './hooks';
export type { QRScanResult, QRScanResultType } from './hooks';

// Services
export { analyzeImage } from './services/visionService';
export type { VisionMatch, VisionResult, VisionError } from './services/visionService';
