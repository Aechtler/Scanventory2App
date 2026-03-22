import { Router } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { shareItem, unshareItem, getSharedWithMe, getGroupLibrary } from '../services/sharingService';
import { ApiResponse } from '../types';

const router = Router();

function err(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/**
 * POST /api/items/:id/share — Item teilen
 */
router.post('/:id/share', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    if (!isRecord(req.body)) { res.status(400).json(err('BAD_REQUEST', 'Invalid body')); return; }

    const { targetType, targetId, permission } = req.body;
    if (targetType !== 'user' && targetType !== 'group') {
      res.status(400).json(err('BAD_REQUEST', 'targetType must be "user" or "group"')); return;
    }
    if (typeof targetId !== 'string' || !targetId) {
      res.status(400).json(err('BAD_REQUEST', 'targetId is required')); return;
    }

    const result = await shareItem(req.params.id, req.user.userId, {
      targetType: targetType as 'user' | 'group',
      targetId: targetId as string,
      permission: permission === 'COMMENT' ? 'COMMENT' : 'VIEW',
    });
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes('not yours') || e.message.includes('not found')) {
        res.status(404).json(err('NOT_FOUND', e.message)); return;
      }
      if (e.message.includes('mutual') || e.message.includes('member')) {
        res.status(403).json(err('FORBIDDEN', e.message)); return;
      }
    }
    console.error('Share item error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to share item'));
  }
});

/**
 * DELETE /api/items/:id/share/:shareId — Sharing aufheben
 */
router.delete('/:id/share/:shareId', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await unshareItem(req.params.shareId, req.user.userId);
    res.json({ success: true, data: { unshared: true } });
  } catch (e) {
    if (e instanceof Error && e.message === 'Share not found') {
      res.status(404).json(err('NOT_FOUND', e.message)); return;
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to remove share'));
  }
});

/**
 * GET /api/shared/with-me — Items die mit mir geteilt wurden
 */
export const sharedWithMeRouter = Router();
sharedWithMeRouter.get('/with-me', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    const items = await getSharedWithMe(req.user.userId);
    res.json({ success: true, data: items });
  } catch (e) {
    console.error('Get shared with me error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load shared items'));
  }
});

/**
 * GET /api/groups/:id/library — Geteilte Items einer Gruppe
 */
export const groupLibraryRouter = Router();
groupLibraryRouter.get('/:id/library', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    const items = await getGroupLibrary(req.params.id, req.user.userId);
    res.json({ success: true, data: items });
  } catch (e) {
    if (e instanceof Error && e.message === 'Not a group member') {
      res.status(403).json(err('FORBIDDEN', e.message)); return;
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load group library'));
  }
});

export default router;
