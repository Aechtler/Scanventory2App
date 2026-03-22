import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { jwtAuthMiddleware, AuthRequest } from '../../middleware/jwtAuth';
import { updateUserProfile, isUsernameTaken, validateUsername } from '../../services/userService';
import { ApiResponse } from '../../types';
import { buildAuthErrorResponse } from './shared';

const router = Router();

const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: buildAuthErrorResponse('RATE_LIMITED', 'Too many profile updates, try again later'),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** PATCH /api/auth/profile — Eigenes Profil bearbeiten */
router.patch('/', jwtAuthMiddleware, profileUpdateLimiter, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json(buildAuthErrorResponse('UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    if (!isRecord(req.body)) {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'Invalid request body'));
      return;
    }

    const { username, displayName, bio, avatarUrl, isPublic } = req.body;

    // Typen prüfen
    if (username !== undefined && typeof username !== 'string') {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'username must be a string'));
      return;
    }
    if (displayName !== undefined && typeof displayName !== 'string') {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'displayName must be a string'));
      return;
    }
    if (bio !== undefined && typeof bio !== 'string') {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'bio must be a string'));
      return;
    }
    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'isPublic must be a boolean'));
      return;
    }

    // Username-Format validieren
    if (username !== undefined) {
      const usernameError = validateUsername(username as string);
      if (usernameError) {
        res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', usernameError));
        return;
      }
    }

    const profile = await updateUserProfile(req.user.userId, {
      ...(username !== undefined && { username: (username as string).toLowerCase() }),
      ...(displayName !== undefined && { displayName: (displayName as string).trim() || undefined }),
      ...(bio !== undefined && { bio: (bio as string).trim() || undefined }),
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl as string }),
      ...(isPublic !== undefined && { isPublic: isPublic as boolean }),
    });

    const response: ApiResponse<typeof profile> = { success: true, data: profile };
    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('taken') || error.message.includes('Username')) {
        res.status(409).json(buildAuthErrorResponse('CONFLICT', error.message));
        return;
      }
    }
    console.error('Profile update error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to update profile'));
  }
});

/** GET /api/auth/check-username?q=... — Username-Verfügbarkeit prüfen (kein Auth nötig) */
router.get('/check-username', async (req, res) => {
  try {
    const q = req.query['q'];
    if (typeof q !== 'string' || !q.trim()) {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'Query parameter q is required'));
      return;
    }

    const username = q.trim().toLowerCase();
    const formatError = validateUsername(username);
    if (formatError) {
      res.json({ success: true, data: { available: false, reason: formatError } });
      return;
    }

    const taken = await isUsernameTaken(username);
    res.json({ success: true, data: { available: !taken } });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to check username'));
  }
});

export default router;
