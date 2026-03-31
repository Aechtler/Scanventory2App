/**
 * Image Routes - Bild-Auslieferung via Supabase Storage
 * Proxied Bilder aus Supabase Storage zum Client
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import { supabaseAdmin } from '../services/supabaseClient';

const router = Router();
const BUCKET = 'item-images';

/** GET /api/images/:filename - Bild aus Supabase Storage ausliefern */
router.get('/:filename', async (req: Request<{ filename: string }>, res: Response) => {
  const filename = req.params.filename;

  // Pfad-Traversal verhindern
  const safeName = path.basename(filename);
  if (safeName !== filename) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid filename' } });
    return;
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(safeName);

  if (error || !data) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Image not found' } });
    return;
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  const contentType = contentTypeMap[ext] ?? 'application/octet-stream';

  const buffer = Buffer.from(await data.arrayBuffer());
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(buffer);
});

export default router;
