/**
 * Items Routes - CRUD fuer ScannedItems
 */

import fs from 'fs';
import path from 'path';
import { Router, Response } from 'express';
import multer from 'multer';
import os from 'os';
import { validate as isUuid } from 'uuid';
import { ApiResponse, CreateItemBody, UpdatePricesBody, UpdateKleinanzeigenPricesBody, UpdateMarketValueBody } from '../types';
import * as itemService from '../services/itemService';
import { saveImage, deleteImage } from '../services/imageService';
import { AuthRequest } from '../middleware/jwtAuth';

const router = Router();
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const hasAllowedMimeType = allowedMimeTypes.has(file.mimetype);
    const hasAllowedExtension = !extension || allowedExtensions.has(extension);

    if (!hasAllowedMimeType || !hasAllowedExtension) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
      return;
    }

    cb(null, true);
  },
});

type IdParams = { id: string };

function cleanupTempUpload(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to clean up temp upload:', error);
  }
}

function cleanupSavedImage(imageFilename: string, context: string): void {
  try {
    deleteImage(imageFilename);
  } catch (error) {
    console.error(`Failed to clean up saved image after ${context}:`, error);
  }
}

function requireAuthenticatedUserId(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.userId;

  if (!userId || !isUuid(userId)) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid authenticated user context' },
    });
    return null;
  }

  return userId;
}

function validateItemId(id: string, res: Response): boolean {
  if (!isUuid(id)) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid item id format' },
    });
    return false;
  }

  return true;
}

function validateCreateItemBody(data: CreateItemBody): string | null {
  if (!data || typeof data !== 'object') {
    return 'Item payload is required';
  }

  if (!data.productName || typeof data.productName !== 'string') {
    return 'productName is required';
  }

  if (!data.category || typeof data.category !== 'string') {
    return 'category is required';
  }

  if (!data.condition || typeof data.condition !== 'string') {
    return 'condition is required';
  }

  if (!data.searchQuery || typeof data.searchQuery !== 'string') {
    return 'searchQuery is required';
  }

  if (typeof data.confidence !== 'number' || Number.isNaN(data.confidence)) {
    return 'confidence must be a valid number';
  }

  if (!data.scannedAt || Number.isNaN(Date.parse(data.scannedAt))) {
    return 'scannedAt must be a valid ISO date string';
  }

  return null;
}

/** GET /api/items - Alle Items paginiert */
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  const result = await itemService.getItems(userId, page, limit);
  const response: ApiResponse<typeof result> = { success: true, data: result };
  res.json(response);
});

/** GET /api/items/:id - Einzelnes Item */
router.get('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

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
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) {
    if (req.file?.path) {
      cleanupTempUpload(req.file.path);
    }
    return;
  }

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
    cleanupTempUpload(req.file.path);
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid JSON in data field' },
    });
    return;
  }

  const bodyValidationError = validateCreateItemBody(data);
  if (bodyValidationError) {
    cleanupTempUpload(req.file.path);
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: bodyValidationError },
    });
    return;
  }

  let imageFilename: string;
  try {
    imageFilename = saveImage(req.file);
  } catch (error) {
    cleanupTempUpload(req.file.path);
    throw error;
  }

  let item;
  try {
    item = await itemService.createItem(userId, data, imageFilename);
  } catch (error) {
    cleanupSavedImage(imageFilename, 'createItem failure');
    throw error;
  }

  const response: ApiResponse<typeof item> = { success: true, data: item };
  res.status(201).json(response);
});

/** PUT /api/items/:id - Item aktualisieren */
router.put('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
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
});

/** DELETE /api/items/:id - Item + Bild loeschen */
router.delete('/:id', async (req: AuthRequest<IdParams>, res: Response) => {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId || !validateItemId(req.params.id, res)) {
    return;
  }

  const deleted = await itemService.deleteItem(req.params.id, userId);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' },
    });
    return;
  }

  let imageDeleted = true;
  try {
    deleteImage(deleted.imageFilename);
  } catch (error) {
    imageDeleted = false;
    console.error('Failed to delete image after item deletion:', error);
  }

  res.json({ success: true, data: { deleted: true, imageDeleted } });
});

/** PATCH /api/items/:id/prices - Preisdaten aktualisieren */
router.patch('/:id/prices', async (req: AuthRequest<IdParams>, res: Response) => {
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
});

/** PATCH /api/items/:id/kleinanzeigen-prices - Kleinanzeigen-Preisdaten aktualisieren */
router.patch('/:id/kleinanzeigen-prices', async (req: AuthRequest<IdParams>, res: Response) => {
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
});

/** PATCH /api/items/:id/market-value - Marktwert aktualisieren */
router.patch('/:id/market-value', async (req: AuthRequest<IdParams>, res: Response) => {
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
