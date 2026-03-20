import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from './jwtAuth';

interface RequestLogDetails {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
}

export function buildRequestLogLine({
  method,
  path,
  statusCode,
  durationMs,
  userId,
}: RequestLogDetails): string {
  return `[Request] ${method} ${path} status=${statusCode} durationMs=${durationMs} user=${userId ?? 'anonymous'}`;
}

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / BigInt(1_000_000));
    const authReq = req as AuthRequest;

    console.info(
      buildRequestLogLine({
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
        userId: authReq.user?.userId,
      })
    );
  });

  next();
}
