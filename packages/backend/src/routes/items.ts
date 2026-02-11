/**
 * Items Routes - CRUD fuer ScannedItems
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import os from 'os';
import { ApiResponse, CreateItemBody, UpdatePricesBody, UpdateKleinanzeigenPricesBody, UpdateMarketValueBody } from '../types';
import * as itemService from '../services/itemService';
import { saveImage, deleteImage } from '../services/imageService';
import { AuthRequest } from '../middleware/jwtAuth';

const router = Router();
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 5 * 1024 * 1024 } });

type IdParams = { id: string };

/** GET /api/items - Alle Items paginiert */
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  const result = await itemService.getItems(userId, page, limit);
  const response: ApiResponse<typeof result> = { success: true, data: result };
  res.json(response);
});

/** GET /api/items/:id - Einzelnes Item */
router.get('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
  const item = await itemService.getItemById(req.params.id, userId);

  if (!item) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  const response: ApiResponse<typeof item> = { success: true, data: item };
  res.json(response);
});

/** POST /api/items - Neues Item (Multipart: image + data) */
router.post('/', upload.single('image'), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Image file is required' },
    });
    return;
  }

  let data: CreateItemBody;
  try {
    data = JSON.parse(req.body.data);
  } catch {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid JSON in data field' },
    });
    return;
  }

  const imageFilename = saveImage(req.file);
  let item;
  try {
    item = await itemService.createItem(userId, data, imageFilename);
  } catch (err) {
    deleteImage(imageFilename);
    throw err;
  }

  const response: ApiResponse<typeof item> = { success: true, data: item };
  res.status(201).json(response);
});

/** PUT /api/items/:id - Item aktualisieren */
router.put('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
  const result = await itemService.updateItem(req.params.id, userId, req.body);

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
});

/** DELETE /api/items/:id - Item + Bild loeschen */
router.delete('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
  const deleted = await itemService.deleteItem(req.params.id, userId);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  try {
    deleteImage(deleted.imageFilename);
  } catch (err) {
    console.error('Failed to delete image:', err);
  }
  res.json({ success: true, data: { deleted: true } });
});

/** PATCH /api/items/:id/prices - Preisdaten aktualisieren */
router.patch('/:id/prices', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
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
});

/** PATCH /api/items/:id/kleinanzeigen-prices - Kleinanzeigen-Preisdaten aktualisieren */
router.patch('/:id/kleinanzeigen-prices', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
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
});

/** PATCH /api/items/:id/market-value - Marktwert aktualisieren */
router.patch('/:id/market-value', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = req.user!.userId;
  const body: UpdateMarketValueBody = req.body;

  if (!body.marketValue) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'marketValue is required' },
    });
    return;
  }

  const result = await itemService.updateMarketValue(
    req.params.id,
    userId,
    body.marketValue
  );

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  res.json({ success: true, data: { updated: result.count } });
});

export default router;
