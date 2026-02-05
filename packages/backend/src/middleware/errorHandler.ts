/**
 * Zentrales Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message, err.stack);

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  };

  res.status(500).json(response);
}
