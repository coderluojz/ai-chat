import type { UIBlock } from './types/block';

export type User = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  /** 纯文本内容（向后兼容，用于数据库存储） */
  content: string;
  /** 多模态 Block 数组（Generative UI） */
  blocks?: UIBlock[];
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
