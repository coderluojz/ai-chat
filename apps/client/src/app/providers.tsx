'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Toaster } from 'sonner';
import { PageLoader } from '@/components/chat/page-loader';

function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthLoadingGuard>
        {children}
      </AuthLoadingGuard>
      <Toaster position="top-center" richColors theme="system" />
    </AuthProvider>
  );
}
