const API_URL = import.meta.env.VITE_API_URL || '/api';

// Default timeout in milliseconds (30 seconds)
const DEFAULT_TIMEOUT = 30000;

/**
 * Custom error for request timeouts
 */
export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(timeout);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(path: string, timeout?: number): Promise<T> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}${path}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
      timeout ?? this.timeout
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async post<T>(path: string, body?: unknown, timeout?: number): Promise<T> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}${path}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      },
      timeout ?? this.timeout
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async delete<T>(path: string, timeout?: number): Promise<T> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}${path}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      },
      timeout ?? this.timeout
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  }

  async uploadFile<T>(path: string, file: File, fieldName = 'image', timeout?: number): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: HeadersInit = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Use longer timeout for file uploads (60 seconds default)
    const uploadTimeout = timeout ?? Math.max(this.timeout, 60000);
    
    const response = await fetchWithTimeout(
      `${this.baseUrl}${path}`,
      {
        method: 'POST',
        headers,
        body: formData,
      },
      uploadTimeout
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  }
}

export const api = new ApiClient(API_URL);
