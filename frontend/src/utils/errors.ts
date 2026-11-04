type ApiErrorBody = {
  error?: string;
  details?: Array<{ message?: string } | string>;
};

export function getApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: ApiErrorBody } })?.response?.data;
  if (!data) {
    return err instanceof Error && err.message ? err.message : fallback;
  }
  if (data.error && data.error !== 'Validation error') {
    return data.error;
  }
  const details = (data.details ?? [])
    .map((item) => (typeof item === 'string' ? item : item.message))
    .filter((message): message is string => Boolean(message));
  if (details.length > 0) {
    return details.join(', ');
  }
  return data.error || fallback;
}
