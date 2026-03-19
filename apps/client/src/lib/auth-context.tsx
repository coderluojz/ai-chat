'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/api';
import { useAuthStore } from './store/auth-store';
import { useLogin, useRegister, useLogout, useProfile } from './queries/use-auth-query';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const profileQuery = useProfile();

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logout = useLogout();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      initializedRef.current = true;
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      profileQuery.refetch().catch((err: unknown) => {
        if (err instanceof ApiError && (err.code === 401 || err.code === 403)) {
          storeLogout();
        }
      });
    }
  }, [token, storeLogout, profileQuery]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success('登录成功');
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw err;
    }
  };

  const handleRegister = async (email: string, password: string, name?: string) => {
    try {
      await registerMutation.mutateAsync({ email, password, name });
      toast.success('账户创建成功');
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('已安全退出登录');
    router.push('/login');
  };

  const isLoading = !initializedRef.current && !!token;

  return (
    <AuthContext.Provider
      value={{
        user: user || profileQuery.data || null,
        isLoading: isLoading || profileQuery.isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext } from 'react';
import type { User } from './types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
