/**
 * Types for PriceEditSheet
 */

export interface PriceEditSheetProps {
  visible: boolean;
  currentPrice?: number;
  currentNote?: string;
  onSave: (price: number | undefined, note: string) => void;
  onClose: () => void;
}
