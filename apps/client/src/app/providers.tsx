'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Toaster } from 'sonner';
import { PageLoader } from '@/components/chat/page-loader';
import { useState } from 'react';

function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthLoadingGuard>{children}</AuthLoadingGuard>
        <Toaster position="top-center" richColors theme="system" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
