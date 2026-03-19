const API_BASE = 'http://localhost:3001';

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
      const error = await response.json().catch(() => ({ message: '请求失败' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // === Auth ===
  async register(email: string, password: string, name?: string) {
    return this.request<{
      user: { id: string; email: string; name: string };
      access_token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string; name: string };
      access_token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      created_at: string;
    }>('/auth/me');
  }

  // === Sessions ===
  async getSessions() {
    return this.request<
      Array<{
        id: string;
        title: string;
        created_at: string;
        updated_at: string;
      }>
    >('/sessions');
  }

  async createSession(title?: string) {
    return this.request<{
      id: string;
      title: string;
      created_at: string;
    }>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async updateSession(id: string, title: string) {
    return this.request<{ id: string; title: string }>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  async deleteSession(id: string) {
    return this.request<{ success: boolean }>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async getMessages(sessionId: string) {
    return this.request<
      Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        created_at: string;
      }>
    >(`/sessions/${sessionId}/messages`);
  }

  // === Chat (SSE Streaming) ===
  async streamChat(
    message: string,
    sessionId?: string,
    onChunk: (content: string) => void = () => {},
    onDone: () => void = () => {},
    onError: (err: Error) => void = () => {},
    signal?: AbortSignal,
  ) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取流');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // 最后一行可能不完整，保留到 buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                onChunk(data.content);
              }
            } catch {
              // ignore parse errors for partial/invalid pieces
            }
          }
        }
      }

      onDone();
    } catch (error) {
      onError(error as Error);
    }
  }
}

export const api = new ApiClient();
