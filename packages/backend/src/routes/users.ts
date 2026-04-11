import { Router } from 'express';
import { jwtAuthMiddleware, optionalJwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { getPublicProfile, searchUsers } from '../services/userService';
import { prisma } from '../services/prismaClient';
import { ApiResponse } from '../types';

const router = Router();

function buildErrorResponse(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

/**
 * PATCH /api/users/me/push-token
 * Expo Push Token registrieren (nach App-Start aufrufen)
 */
router.patch('/me/push-token', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json(buildErrorResponse('UNAUTHORIZED', 'Not authenticated'));
      return;
    }
    const { pushToken } = req.body as { pushToken?: string };

    if (typeof pushToken !== 'string' || !pushToken) {
      res.status(400).json(buildErrorResponse('BAD_REQUEST', 'pushToken is required'));
      return;
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { pushToken },
    });

    res.json({ success: true });
  } catch (e) {
    console.error('Push token update error:', e);
    res.status(500).json(buildErrorResponse('INTERNAL_ERROR', 'Failed to update push token'));
  }
});

/**
 * GET /api/users/search?q=...&limit=20&offset=0
 * Öffentliche User-Suche (nach username + displayName)
 */
router.get('/search', optionalJwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const q = req.query['q'];
    if (typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json(buildErrorResponse('BAD_REQUEST', 'Query must be at least 2 characters'));
      return;
    }

    const limit = Math.min(parseInt(String(req.query['limit'] ?? '20'), 10), 50);
    const offset = Math.max(parseInt(String(req.query['offset'] ?? '0'), 10), 0);

    const users = await searchUsers(q.trim(), req.user?.userId, limit, offset);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json(buildErrorResponse('INTERNAL_ERROR', 'Search failed'));
  }
});

/**
 * GET /api/users/:idOrUsername
 * Öffentliches Profil laden (per UUID oder @username)
 */
router.get('/:idOrUsername', optionalJwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { idOrUsername } = req.params;
    const profile = await getPublicProfile(idOrUsername, req.user?.userId);

    if (!profile) {
      res.status(404).json(buildErrorResponse('NOT_FOUND', 'User not found'));
      return;
    }

    const response: ApiResponse<typeof profile> = { success: true, data: profile };
    res.json(response);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json(buildErrorResponse('INTERNAL_ERROR', 'Failed to load profile'));
  }
});

export default router;
