/**
 * Image Routes - Bild-Auslieferung via Redirect auf Supabase Storage
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import { getImageUrl } from '../services/imageService';

const router = Router();

/** GET /api/images/:filename - Redirect zur Supabase Storage URL */
router.get('/:filename', (req: Request<{ filename: string }>, res: Response) => {
  const filename = req.params.filename;

  // Pfad-Traversal verhindern
  const safeName = path.basename(filename);
  if (safeName !== filename) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid filename' } });
    return;
  }

  const url = getImageUrl(safeName);
  res.redirect(301, url);
});

export default router;
