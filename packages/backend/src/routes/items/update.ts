import { Response } from 'express';
import * as itemService from '../../services/itemService';
import {
  UpdateKleinanzeigenPricesBody,
  UpdateMarketValueBody,
  UpdatePricesBody,
} from '../../types';
import { AuthRequest } from '../../middleware/jwtAuth';
import { IdParams, requireAuthenticatedUserId, validateItemId } from './shared';

export async function updateItem(req: AuthRequest<IdParams>, res: Response): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

  const result = await itemService.updateItem(req.params.id, userId, req.body);

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
}

export async function updateItemPrices(req: AuthRequest<IdParams>, res: Response): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

  const body: UpdatePricesBody = req.body;
  if (!body.priceStats) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'priceStats is required' },
    });
    return;
  }

  const result = await itemService.updatePrices(
    req.params.id,
    userId,
    body.priceStats,
    body.ebayListings
  );

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
}

export async function updateKleinanzeigenItemPrices(
  req: AuthRequest<IdParams>,
  res: Response
): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

  const body: UpdateKleinanzeigenPricesBody = req.body;
  if (!body.kleinanzeigenListings) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'kleinanzeigenListings is required' },
    });
    return;
  }

  const result = await itemService.updateKleinanzeigenPrices(
    req.params.id,
    userId,
    body.kleinanzeigenListings
  );

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
}

export async function updateItemMarketValue(
  req: AuthRequest<IdParams>,
  res: Response
): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

  const body: UpdateMarketValueBody = req.body;
  if (!body.marketValue) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'marketValue is required' },
    });
    return;
  }

  const result = await itemService.updateMarketValue(req.params.id, userId, body.marketValue);

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
}
