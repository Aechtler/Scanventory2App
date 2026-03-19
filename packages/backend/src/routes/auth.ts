import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  getUserById,
} from '../services/authService';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { ApiResponse } from '../types';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts, please try again later',
    },
  },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts, please try again later',
    },
  },
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number';
  }

  return null;
}

function sendError(res: Response, status: number, code: string, message: string): void {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message },
  };

  res.status(status).json(response);
}

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      sendError(res, 400, 'BAD_REQUEST', 'Email and password are required');
      return;
    }

    if (!isValidEmail(email)) {
      sendError(res, 400, 'BAD_REQUEST', 'Please provide a valid email address');
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      sendError(res, 400, 'BAD_REQUEST', passwordValidationError);
      return;
    }

    const sanitizedName = typeof name === 'string' && name.trim() ? name.trim() : undefined;
    const result = await registerUser(email.trim().toLowerCase(), password, sanitizedName);
    const response: ApiResponse<typeof result> = { success: true, data: result };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      sendError(res, 409, 'CONFLICT', error.message);
      return;
    }

    console.error('Register error:', error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to register user');
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      sendError(res, 400, 'BAD_REQUEST', 'Email and password are required');
      return;
    }

    if (!isValidEmail(email)) {
      sendError(res, 400, 'BAD_REQUEST', 'Please provide a valid email address');
      return;
    }

    const result = await loginUser(email.trim().toLowerCase(), password);
    const response: ApiResponse<typeof result> = { success: true, data: result };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      sendError(res, 401, 'UNAUTHORIZED', error.message);
      return;
    }

    console.error('Login error:', error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to login');
  }
});

/**
 * GET /auth/me
 * Get current user (requires auth)
 */
router.get('/me', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }

    const user = await getUserById(req.user.userId);
    const response: ApiResponse<typeof user> = { success: true, data: user };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      sendError(res, 404, 'NOT_FOUND', error.message);
      return;
    }

    console.error('Get user error:', error);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get user');
  }
});

/**
 * POST /auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (_req, res) => {
  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Logged out successfully' },
  };

  res.json(response);
});

export default router;
