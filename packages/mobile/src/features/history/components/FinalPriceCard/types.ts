/**
 * Types for FinalPriceCard
 */

export interface PriceComparison {
  aiPrice?: number | string;
  ebayAvg?: number;
  kleinanzeigenAvg?: number;
}

export interface FinalPriceCardProps {
  finalPrice?: number;
  finalPriceNote?: string;
  comparison?: PriceComparison;
  onSavePrice: (price: number | undefined) => void;
  onSaveNote: (note: string) => void;
}
