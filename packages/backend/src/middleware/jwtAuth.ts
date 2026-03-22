/**
 * JWT Auth Middleware - verifiziert Supabase JWT Tokens
 * Ersetzt jsonwebtoken.verify() durch supabase.auth.getUser()
 */

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
 * JWT Auth middleware - verifiziert den Supabase Bearer Token
 */
export function jwtAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
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

  // Async-Verifizierung via Supabase
  verifyToken(token)
    .then((payload) => {
      req.user = payload;
      next();
    })
    .catch(() => {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
      };
      res.status(401).json(response);
    });
}

/**
 * Optional JWT auth middleware - schlägt nicht fehl wenn kein Token vorhanden
 */
export function optionalJwtAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  verifyToken(token)
    .then((payload) => {
      req.user = payload;
      next();
    })
    .catch(() => {
      // Token ungültig, aber optional → trotzdem weitermachen
      next();
    });
}
