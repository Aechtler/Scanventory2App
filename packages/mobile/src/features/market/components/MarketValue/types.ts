/**
 * Market Value Component Types
 */

import { MarketValueResult, PerplexityErrorType } from '../../services/perplexity';

export interface MarketValueCardProps {
  result: MarketValueResult | null;
  isLoading: boolean;
  error?: PerplexityErrorType | null;
  onRefresh?: () => void;
}

export type ConfidenceLevel = 'hoch' | 'mittel' | 'niedrig';

export interface ConfidenceColors {
  bg: string;
  text: string;
  border: string;
}
