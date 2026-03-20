import type { ApiResponse } from '../../types';

export interface NormalizedAuthCredentials {
  email: string;
  password: string;
  name?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
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

export function normalizeAuthCredentials(body: unknown): NormalizedAuthCredentials | null {
  if (!isRecord(body)) {
    return null;
  }

  const { email, password, name } = body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = typeof name === 'string' && name.trim() ? name.trim() : undefined;

  return {
    email: normalizedEmail,
    password,
    name: normalizedName,
  };
}

export function buildAuthErrorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message },
  };
}
