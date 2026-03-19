import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { ApiResponse } from '../types';

type RequestParams = Record<string, string>;

export interface AuthRequest<P = RequestParams> extends Request<P> {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * JWT Auth middleware - verify JWT token
 */
export function jwtAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      };

      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (_error) {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    };

    res.status(401).json(response);
  }
}

/**
 * Optional JWT auth middleware - doesn't fail if no token
 */
export function optionalJwtAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    }
  } catch (_error) {
    // Token invalid, but that's okay for optional auth
  }

  next();
}
