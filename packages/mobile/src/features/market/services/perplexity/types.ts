/**
 * Perplexity Service Types
 */

export interface MarketValueResult {
  estimatedPrice: string;
  priceRange: string;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  sources: string[];
  summary: string;
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
  maxTokens: 500,
  temperature: 0.1,
};
