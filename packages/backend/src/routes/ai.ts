/**
 * AI Routes — KI-gestützte Verkaufsempfehlung
 */

import { Router, Response } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { recommendPlatform, type ItemData } from '../services/aiRecommendationService';
import { ApiResponse } from '../types';

const router = Router();

function err(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

/**
 * POST /api/ai/recommend-platform
 * Gibt KI-Empfehlung für Plattform, Listingtyp und Preis zurück.
 *
 * Body: ItemData (productName, category, condition, brand?, priceStats?, finalPrice?)
 */
router.post('/recommend-platform', jwtAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json(err('UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const { productName, category, condition, brand, priceStats, finalPrice } =
      req.body as ItemData;

    if (!productName || !category || !condition) {
      res.status(400).json(err('BAD_REQUEST', 'productName, category and condition are required'));
      return;
    }

    const recommendation = await recommendPlatform({
      productName,
      category,
      condition,
      brand,
      priceStats,
      finalPrice,
    });

    res.json({ success: true, data: recommendation });
  } catch (e) {
    console.error('[AI] recommend-platform error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to generate recommendation'));
  }
});

export default router;
