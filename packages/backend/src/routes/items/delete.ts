import { Response } from 'express';
import * as itemService from '../../services/itemService';
import { deleteImage } from '../../services/imageService';
import { AuthRequest } from '../../middleware/jwtAuth';
import { IdParams, requireAuthenticatedUserId, validateItemId } from './shared';

export async function deleteItemById(req: AuthRequest<IdParams>, res: Response): Promise<void> {
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
}
