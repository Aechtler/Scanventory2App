import { Router } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../services/followService';
import { ApiResponse } from '../types';

const router = Router();

function err(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

/**
 * POST /api/users/:id/follow — Einem User folgen
 */
router.post('/:id/follow', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await followUser(req.user.userId, req.params.id);
    res.json({ success: true, data: { following: true } });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json(err('NOT_FOUND', error.message)); return;
    }
    if (error instanceof Error && error.message === 'Cannot follow yourself') {
      res.status(400).json(err('BAD_REQUEST', error.message)); return;
    }
    console.error('Follow error:', error);
    res.status(500).json(err('INTERNAL_ERROR', 'Follow failed'));
  }
});

/**
 * DELETE /api/users/:id/follow — Entfolgen
 */
router.delete('/:id/follow', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await unfollowUser(req.user.userId, req.params.id);
    res.json({ success: true, data: { following: false } });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json(err('INTERNAL_ERROR', 'Unfollow failed'));
  }
});

/**
 * GET /api/users/:id/followers — Follower-Liste
 */
router.get('/:id/followers', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query['limit'] ?? '30'), 10), 100);
    const offset = Math.max(parseInt(String(req.query['offset'] ?? '0'), 10), 0);
    const followers = await getFollowers(req.params.id, limit, offset);
    res.json({ success: true, data: followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load followers'));
  }
});

/**
 * GET /api/users/:id/following — Following-Liste
 */
router.get('/:id/following', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query['limit'] ?? '30'), 10), 100);
    const offset = Math.max(parseInt(String(req.query['offset'] ?? '0'), 10), 0);
    const following = await getFollowing(req.params.id, limit, offset);
    res.json({ success: true, data: following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load following'));
  }
});

export default router;
