import { Response } from 'express';
import * as itemService from '../../services/itemService';
import { ApiResponse } from '../../types';
import { AuthRequest } from '../../middleware/jwtAuth';
import { IdParams, getPaginationParams, requireAuthenticatedUserId, validateItemId } from './shared';

export async function listItems(req: AuthRequest, res: Response): Promise<void> {
  const userId = requireAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const { page, limit } = getPaginationParams(req.query);
  const result = await itemService.getItems(userId, page, limit);
  const response: ApiResponse<typeof result> = { success: true, data: result };
  res.json(response);
}

export async function getItem(req: AuthRequest<IdParams>, res: Response): Promise<void> {
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
}
