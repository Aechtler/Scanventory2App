import path from 'path';
import multer from 'multer';
import os from 'os';
import { Response } from 'express';
import * as itemService from '../../services/itemService';
import { saveImage, deleteImage } from '../../services/imageService';
import { ApiResponse, CreateItemBody } from '../../types';
import { AuthRequest } from '../../middleware/jwtAuth';
import {
  cleanupSavedImage,
  cleanupTempUpload,
  getCreateItemBodyValidationError,
  parseCreateItemData,
  requireAuthenticatedUserId,
} from './shared';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const uploadItemImage = multer({
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

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
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

  const parsedData = parseCreateItemData(req.body.data);
  if ('error' in parsedData) {
    cleanupTempUpload(req.file.path);
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: parsedData.error },
    });
    return;
  }

  const bodyValidationError = getCreateItemBodyValidationError(parsedData.data);
  if (bodyValidationError) {
    cleanupTempUpload(req.file.path);
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: bodyValidationError },
    });
    return;
  }

  const createItemBody = parsedData.data as CreateItemBody;

  let imageFilename: string;
  try {
    imageFilename = saveImage(req.file);
  } catch (error) {
    cleanupTempUpload(req.file.path);
    throw error;
  }

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
