import { UNDERAGE_MESSAGE } from './age';

export function zodErrorResponse(error: { errors?: Array<{ message?: string }> }): {
  error: string;
  details: unknown;
} {
  const details = error.errors ?? [];
  const underage = details.some((item) => item.message === UNDERAGE_MESSAGE);
  return {
    error: underage ? UNDERAGE_MESSAGE : 'Validation error',
    details,
  };
}
