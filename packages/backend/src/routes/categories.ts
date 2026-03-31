/**
 * Categories Routes
 *
 * GET  /categories          → vollständiger Baum (für Mobile-Cache)
 * GET  /categories/:id/children → direkte Kinder
 * POST /categories          → neue Kategorie anlegen
 * PATCH /categories/:id     → Kategorie umbenennen / deaktivieren
 */

import { Request, Response, Router } from 'express';
import * as categoryService from '../services/categoryService';
import { ApiResponse, CreateCategoryBody, UpdateCategoryBody } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const tree = await categoryService.getCategoryTree();
  const response: ApiResponse<typeof tree> = { success: true, data: tree };
  res.json(response);
});

router.get('/:id/children', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const children = await categoryService.getChildren(req.params.id);
  const response: ApiResponse<typeof children> = { success: true, data: children };
  res.json(response);
});

router.post('/', async (req: Request<object, object, CreateCategoryBody>, res: Response): Promise<void> => {
  const { name, parentId, iconName, sortOrder } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'name ist erforderlich' },
    });
    return;
  }

  try {
    const created = await categoryService.createCategory({ name, parentId, iconName, sortOrder });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err instanceof Error && err.message === 'PARENT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Eltern-Kategorie nicht gefunden' },
      });
      return;
    }
    throw err;
  }
});

router.patch('/:id', async (req: Request<{ id: string }, object, UpdateCategoryBody>, res: Response): Promise<void> => {
  const updated = await categoryService.updateCategory(req.params.id, req.body);

  if (!updated) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Kategorie nicht gefunden' },
    });
    return;
  }

  const response: ApiResponse<typeof updated> = { success: true, data: updated };
  res.json(response);
});

export default router;
