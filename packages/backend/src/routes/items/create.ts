import multer from 'multer';
import { Response } from 'express';
import * as itemService from '../../services/itemService';
import { saveImage, deleteImage } from '../../services/imageService';
import { ApiResponse, CreateItemBody } from '../../types';
import { AuthRequest } from '../../middleware/jwtAuth';
import {
  cleanupSavedImage,
  getCreateItemBodyValidationError,
  parseCreateItemData,
  requireAuthenticatedUserId,
} from './shared';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Memory storage: Datei liegt im RAM als Buffer (kein Disk-Write)
// Wird direkt an Supabase Storage weitergegeben
export const uploadItemImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
      return;
    }
    cb(null, true);
  },
});

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) return;

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Image file is required' },
    });
    return;
  }

  const parsedData = parseCreateItemData(req.body.data);
  if ('error' in parsedData) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: parsedData.error },
    });
    return;
  }

  const bodyValidationError = getCreateItemBodyValidationError(parsedData.data);
  if (bodyValidationError) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: bodyValidationError },
    });
    return;
  }

  const createItemBody = parsedData.data as CreateItemBody;

  // Bild in Supabase Storage hochladen
  let imageFilename: string;
  try {
    imageFilename = await saveImage(req.file);
  } catch (error) {
    throw error;
  }

  // Item in DB erstellen
  let item;
  try {
    item = await itemService.createItem(userId, createItemBody, imageFilename);
  } catch (error) {
    cleanupSavedImage(imageFilename, 'createItem failure', deleteImage);
    throw error;
  }

  const response: ApiResponse<typeof item> = { success: true, data: item };
  res.status(201).json(response);
}
