export function friendlyHttpError(e: any): string {
  // Angular HttpErrorResponse shape varies; normalize
  const msg =
    e?.error?.message || e?.error?.error || e?.message || 'Request failed';

  // If backend sends array of messages
  if (Array.isArray(msg)) return msg.join(', ');

  return String(msg);
}
