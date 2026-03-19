import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';

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
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    // Add user to request
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional JWT auth middleware - doesn't fail if no token
 */
export function optionalJwtAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Token invalid, but that's okay for optional auth
  }

  next();
}
