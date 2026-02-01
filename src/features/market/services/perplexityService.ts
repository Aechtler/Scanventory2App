/**
 * Perplexity Market Value Service
 * Nutzt Perplexity AI für Marktwert-Recherche mit Web-Suche
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export interface MarketValueResult {
  estimatedPrice: string;
  priceRange: string;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  sources: string[];
  summary: string;
  rawResponse: string;
}

/**
 * Fragt Perplexity nach dem aktuellen Marktwert eines Produkts in Deutschland
 */
export async function getMarketValue(productName: string, category?: string): Promise<MarketValueResult | null> {
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
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Experte für Produktbewertungen und Marktpreise in Deutschland. 
Antworte immer auf Deutsch und in folgendem JSON-Format:
{
  "geschaetzterPreis": "XX €",
  "preisspanne": "XX € - XX €",
  "konfidenz": "hoch|mittel|niedrig",
  "zusammenfassung": "Kurze Erklärung zum Marktwert",
  "quellen": ["quelle1", "quelle2"]
}
Recherchiere aktuelle Preise auf deutschen Marktplätzen (eBay, Amazon, Kleinanzeigen, Idealo).
Berücksichtige den Zustand (neu vs. gebraucht) und gib realistische Preise an.`
          },
          {
            role: 'user',
            content: `Was ist der aktuelle Marktwert für "${query}" in Deutschland? Suche auf eBay Kleinanzeigen, eBay, Amazon und Idealo nach aktuellen Preisen.`
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });
    
    console.log('[Perplexity] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Perplexity] API error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('[Perplexity] Raw response:', content.substring(0, 200));
    
    // Parse JSON response
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
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

/**
 * Mappt Konfidenz-String auf typisierte Werte
 */
function mapConfidence(value: string): 'hoch' | 'mittel' | 'niedrig' {
  const normalized = value?.toLowerCase() || '';
  if (normalized.includes('hoch')) return 'hoch';
  if (normalized.includes('niedrig')) return 'niedrig';
  return 'mittel';
}

/**
 * Extrahiert einen Preis aus einem Text
 */
function extractPrice(text: string): string | null {
  const priceMatch = text.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€/);
  if (priceMatch) {
    return `${priceMatch[1]} €`;
  }
  return null;
}
