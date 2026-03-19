/**
 * Image Routes - Bild-Auslieferung (kein Auth)
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import { getImagePath, imageExists } from '../services/imageService';

const router = Router();

/** GET /api/images/:filename - Bild ausliefern */
router.get('/:filename', (req: Request<{ filename: string }>, res: Response) => {
  const filename = req.params.filename;

  // Pfad-Traversal verhindern
  const safeName = path.basename(filename);
  if (safeName !== filename) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid filename' } });
    return;
  }

  if (!imageExists(safeName)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Image not found' } });
    return;
  }

  res.sendFile(getImagePath(safeName), (err) => {
    if (!err) {
      return;
    }

    console.error('Failed to send image file:', err);

    if (!res.headersSent) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Image not found' } });
    }
  });
});

export default router;
