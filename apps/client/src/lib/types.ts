export type User = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
};

export type Session = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  name?: string;
};

export type ApiErrorResponse = {
  code: number;
  message: string;
  data: null;
  timestamp: string;
  path: string;
};

export type ApiResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
};
