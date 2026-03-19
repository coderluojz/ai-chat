import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { User, Message, Session, AuthResponse, LoginCredentials, RegisterData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  code: number;
  timestamp: string;
  path: string;

  constructor(data: { code: number; message: string; timestamp: string; path: string }) {
    super(data.message);
    this.name = 'ApiError';
    this.code = data.code;
    this.timestamp = data.timestamp;
    this.path = data.path;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        code: response.status,
        message: '请求失败',
        timestamp: new Date().toISOString(),
        path,
      }));
      throw new ApiError({
        code: errorData.code || response.status,
        message: errorData.message || `HTTP ${response.status}`,
        timestamp: errorData.timestamp || new Date().toISOString(),
        path: errorData.path || path,
      });
    }

    const result = await response.json();
    return result.data !== undefined ? result.data : result;
  }

  auth = {
    register: (data: RegisterData) =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (credentials: LoginCredentials) =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    getProfile: () =>
      this.request<User>('/auth/me'),

    forgotPassword: (email: string) =>
      this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  };

  sessions = {
    getAll: () =>
      this.request<Session[]>('/sessions'),

    create: (title?: string) =>
      this.request<Session>('/sessions', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),

    update: (id: string, title: string) =>
      this.request<{ id: string; title: string }>(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean }>(`/sessions/${id}`, {
        method: 'DELETE',
      }),

    getMessages: (sessionId: string) =>
      this.request<Message[]>(`/sessions/${sessionId}/messages`),
  };

  chat = {
    stream: async (
      message: string,
      sessionId: string | undefined,
      onChunk: (content: string) => void,
      onDone: () => void,
      onError: (err: Error) => void,
      signal?: AbortSignal,
    ) => {
      const token = this.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        await fetchEventSource(`${API_BASE}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message,
            session_id: sessionId,
          }),
          signal,
          async onopen(response) {
            if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
              return;
            }
            throw new Error(`HTTP ${response.status}`);
          },
          onmessage(msg) {
            if (msg.data === '[DONE]') return;
            try {
              const data = JSON.parse(msg.data);
              if (data.content) {
                onChunk(data.content);
              }
            } catch {
              // ignore parse errors
            }
          },
          onclose() {
            onDone();
          },
          onerror(err) {
            onError(err);
            throw err;
          },
        });
      } catch (error) {
        onError(error as Error);
      }
    },
  };
}

export const api = new ApiClient();
