/**
 * Perplexity API
 * Handles communication with Perplexity AI for market value research
 */

import { PERPLEXITY_CONFIG, MarketValueResult, PerplexityError } from '@/features/market/services/perplexity/types';

/** Wird geworfen wenn der API-Token abgelaufen oder ungültig ist (HTTP 401 / 403) */
export class PerplexityTokenError extends Error implements PerplexityError {
  readonly type = 'TOKEN_EXPIRED' as const;
  constructor(public readonly status: number) {
    super(`Perplexity API-Token abgelaufen oder ungültig (HTTP ${status})`);
    this.name = 'PerplexityTokenError';
  }
}
import { SYSTEM_PROMPT, createUserPrompt } from '@/features/market/services/perplexity/prompts';

/**
 * Maps confidence string to typed values
 */
function mapConfidence(value: string): 'hoch' | 'mittel' | 'niedrig' {
  const normalized = value?.toLowerCase() || '';
  if (normalized.includes('hoch')) return 'hoch';
  if (normalized.includes('niedrig')) return 'niedrig';
  return 'mittel';
}

/**
 * Extracts a price from text
 */
function extractPrice(text: string): string | null {
  const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€/);
  if (priceMatch) {
    return `${priceMatch[1]} €`;
  }
  return null;
}

/**
 * Queries Perplexity for the current market value of a product in Germany
 */
export async function getMarketValue(
  productName: string, 
  category?: string
): Promise<MarketValueResult | null> {
  const apiKey = process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.log('[Perplexity] API key not configured');
    return null;
  }
  
  const query = category 
    ? `${productName} (${category})`
    : productName;
  
  console.log('[Perplexity] Searching market value for:', query);
  
  try {
    const response = await fetch(PERPLEXITY_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PERPLEXITY_CONFIG.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: createUserPrompt(query) }
        ],
        max_tokens: PERPLEXITY_CONFIG.maxTokens,
        temperature: PERPLEXITY_CONFIG.temperature,
      }),
    });
    
    console.log('[Perplexity] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Perplexity] API error:', response.status, errorText);
      // Token abgelaufen oder ungültig → spezifische Exception für UI-Feedback
      if (response.status === 401 || response.status === 403) {
        throw new PerplexityTokenError(response.status);
      }
      return null;
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('[Perplexity] Raw response:', content.substring(0, 200));
    
    // Parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          estimatedPrice: parsed.geschaetzterPreis || 'Unbekannt',
          priceRange: parsed.preisspanne || '',
          confidence: mapConfidence(parsed.konfidenz),
          sources: parsed.quellen || [],
          summary: parsed.zusammenfassung || content,
          rawResponse: content,
        };
      }
    } catch (parseError) {
      console.log('[Perplexity] Could not parse JSON, using raw response');
    }
    
    // Fallback: use raw text
    return {
      estimatedPrice: extractPrice(content) || 'Siehe Details',
      priceRange: '',
      confidence: 'mittel',
      sources: [],
      summary: content.substring(0, 300),
      rawResponse: content,
    };
    
  } catch (error) {
    console.error('[Perplexity] Error:', error);
    return null;
  }
}
