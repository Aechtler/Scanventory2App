/**
 * Perplexity Service Types
 */

export type PerplexityErrorType = 'TOKEN_EXPIRED' | 'NETWORK' | 'UNKNOWN';

export interface PerplexityError {
  type: PerplexityErrorType;
  status?: number;
}

export interface MarketValueResult {
  estimatedPrice: string;
  priceRange: string;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  sources: string[];
  summary: string;
  facts?: string[];
  rawResponse: string;
}

export interface PerplexityConfig {
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const PERPLEXITY_CONFIG: PerplexityConfig = {
  apiUrl: 'https://api.perplexity.ai/chat/completions',
  model: 'sonar',
  maxTokens: 800,
  temperature: 0.1,
};
