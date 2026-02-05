/**
 * API-Key Authentifizierung Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ApiResponse } from '../types';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey || apiKey !== config.apiKey) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      },
    };
    res.status(401).json(response);
    return;
  }

  next();
}
