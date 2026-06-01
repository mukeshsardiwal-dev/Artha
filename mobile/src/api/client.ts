import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
  timeoutMs?: number;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? REQUEST_TIMEOUT_MS);

  try {
    const headers = new Headers(options.headers ?? {});
    headers.set('Accept', 'application/json');

    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      const detailMessage =
        typeof payload === 'object' &&
        payload !== null &&
        'detail' in payload &&
        typeof (payload as { detail?: unknown }).detail === 'string'
          ? (payload as { detail: string }).detail
          : `Request failed with status ${response.status}`;

      throw new ApiError(detailMessage, response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }

    throw new ApiError('Unable to connect to the backend server.', 0, error);
  } finally {
    clearTimeout(timeoutHandle);
  }
}