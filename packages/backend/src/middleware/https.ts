/**
 * HTTPS enforcement middleware for production deployments.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

function getFirstForwardedValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const firstValue = value.split(',')[0]?.trim().toLowerCase();
  return firstValue || null;
}

function getRequestHost(req: Request): string | null {
  const forwardedHost = getFirstForwardedValue(req.header('x-forwarded-host'));
  return forwardedHost || req.header('host') || null;
}

function getHttpsRedirectUrl(req: Request): string | null {
  const host = getRequestHost(req);
  if (!host) {
    return null;
  }

  return `https://${host}${req.originalUrl}`;
}

function isSecureRequest(req: Request): boolean {
  if (req.secure) {
    return true;
  }

  return getFirstForwardedValue(req.header('x-forwarded-proto')) === 'https';
}

export function enforceHttpsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldEnforceHttps = process.env.ENFORCE_HTTPS !== 'false';

  if (!isProduction || !shouldEnforceHttps) {
    next();
    return;
  }

  if (isSecureRequest(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
    return;
  }

  const redirectUrl = getHttpsRedirectUrl(req);
  if (redirectUrl && (req.method === 'GET' || req.method === 'HEAD')) {
    res.redirect(308, redirectUrl);
    return;
  }

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'HTTPS_REQUIRED',
      message: 'HTTPS is required in production.',
    },
  };

  res.status(426).json(response);
}
