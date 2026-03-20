import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';
const REQUEST_ID_MAX_LENGTH = 200;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export interface RequestWithRequestId extends Request {
  requestId?: string;
}

function normalizeRequestId(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return normalizeRequestId(value[0]);
  }

  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  if (
    normalized.length > REQUEST_ID_MAX_LENGTH
    || !REQUEST_ID_PATTERN.test(normalized)
  ) {
    return undefined;
  }

  return normalized;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestWithId = req as RequestWithRequestId;
  const requestId = normalizeRequestId(req.headers[REQUEST_ID_HEADER]) ?? randomUUID();

  requestWithId.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
