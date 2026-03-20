const URL_CREDENTIALS_PATTERN = /([a-z][a-z0-9+.-]*:\/\/)([^/\s:@]+):([^@\s/]+)@/gi;

function sanitizeErrorMessage(message: string | undefined): string {
  const normalized = message?.trim() || 'Internal server error';
  return normalized.replace(URL_CREDENTIALS_PATTERN, '$1[redacted]@');
}

export function buildErrorLogLine(error: Error, requestId: string): string {
  const name = error.name?.trim() || 'Error';
  const message = sanitizeErrorMessage(error.message);

  return `[Error] req=${requestId} name=${name} message=${message}`;
}
