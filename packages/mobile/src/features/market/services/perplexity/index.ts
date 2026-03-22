/**
 * Perplexity Service
 * 
 * AI-powered market value research using Perplexity's web search capabilities.
 */

export type { MarketValueResult, PerplexityConfig, PerplexityError, PerplexityErrorType } from '@/features/market/services/perplexity/types';
export { PERPLEXITY_CONFIG } from '@/features/market/services/perplexity/types';
export { SYSTEM_PROMPT, createUserPrompt } from '@/features/market/services/perplexity/prompts';
export { getMarketValue } from '@/features/market/services/perplexity/api';
