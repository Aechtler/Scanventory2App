/**
 * Perplexity Service
 * 
 * AI-powered market value research using Perplexity's web search capabilities.
 */

export type { MarketValueResult, PerplexityConfig } from './types';
export { PERPLEXITY_CONFIG } from './types';
export { SYSTEM_PROMPT, createUserPrompt } from './prompts';
export { getMarketValue } from './api';
