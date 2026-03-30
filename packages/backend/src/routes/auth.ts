import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, getUserById, refreshUserToken } from '../services/authService';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { ApiResponse } from '../types';
import {
  buildAuthErrorResponse,
  isValidEmail,
  normalizeAuthCredentials,
  validatePassword,
} from './auth/shared';
import profileRouter from './auth/updateProfile';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: buildAuthErrorResponse(
    'RATE_LIMITED',
    'Too many login attempts, please try again later'
  ),
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: buildAuthErrorResponse(
    'RATE_LIMITED',
    'Too many registration attempts, please try again later'
  ),
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const credentials = normalizeAuthCredentials(req.body);
    if (!credentials) {
      res
        .status(400)
        .json(buildAuthErrorResponse('BAD_REQUEST', 'Email and password are required'));
      return;
    }

    if (!isValidEmail(credentials.email)) {
      res
        .status(400)
        .json(buildAuthErrorResponse('BAD_REQUEST', 'Please provide a valid email address'));
      return;
    }

    const passwordValidationError = validatePassword(credentials.password);
    if (passwordValidationError) {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', passwordValidationError));
      return;
    }

    const result = await registerUser(credentials.email, credentials.password, credentials.name);
    const response: ApiResponse<typeof result> = { success: true, data: result };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json(buildAuthErrorResponse('CONFLICT', error.message));
      return;
    }

    console.error('Register error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to register user'));
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const credentials = normalizeAuthCredentials(req.body);
    if (!credentials) {
      res
        .status(400)
        .json(buildAuthErrorResponse('BAD_REQUEST', 'Email and password are required'));
      return;
    }

    if (!isValidEmail(credentials.email)) {
      res
        .status(400)
        .json(buildAuthErrorResponse('BAD_REQUEST', 'Please provide a valid email address'));
      return;
    }

    const result = await loginUser(credentials.email, credentials.password);
    const response: ApiResponse<typeof result> = { success: true, data: result };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      res.status(401).json(buildAuthErrorResponse('UNAUTHORIZED', error.message));
      return;
    }

    console.error('Login error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to login'));
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json(buildAuthErrorResponse('BAD_REQUEST', 'Refresh token is required'));
      return;
    }

    const result = await refreshUserToken(refreshToken);
    const response: ApiResponse<typeof result> = { success: true, data: result };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired')) {
      res.status(401).json(buildAuthErrorResponse('UNAUTHORIZED', error.message));
      return;
    }

    console.error('Token refresh error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to refresh token'));
  }
});

router.get('/me', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json(buildAuthErrorResponse('UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const user = await getUserById(req.user.userId);
    const response: ApiResponse<typeof user> = { success: true, data: user };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json(buildAuthErrorResponse('NOT_FOUND', error.message));
      return;
    }

    console.error('Get user error:', error);
    res.status(500).json(buildAuthErrorResponse('INTERNAL_ERROR', 'Failed to get user'));
  }
});

router.post('/logout', (_req, res) => {
  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Logged out successfully' },
  };

  res.json(response);
});

// Profil-Routen: PATCH /api/auth/profile, GET /api/auth/check-username
router.use('/profile', profileRouter);

export default router;
