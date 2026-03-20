/**
 * Zentrales Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiResponse } from '../types';
import { buildErrorLogLine } from './errorLogging';
import type { RequestWithRequestId } from './requestId';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestWithId = req as RequestWithRequestId;
  console.error(buildErrorLogLine(err, requestWithId.requestId ?? 'missing'));

  if (err instanceof multer.MulterError) {
    const isUnexpectedFile = err.code === 'LIMIT_UNEXPECTED_FILE';
    const isTooLarge = err.code === 'LIMIT_FILE_SIZE';

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: isTooLarge
          ? 'Image file is too large. Maximum upload size is 5 MB.'
          : isUnexpectedFile
            ? 'Unsupported image file type. Only JPG, PNG, and WEBP are allowed.'
            : err.message || 'Invalid upload request',
      },
    };

    res.status(400).json(response);
    return;
  }

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  };

  res.status(500).json(response);
}
