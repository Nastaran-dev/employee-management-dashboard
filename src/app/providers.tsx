import { useState, type ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { createBrowserEmployeeApi, EmployeeApiContext, type EmployeeApi } from '@/features/employees/api';
import { createQueryClient } from '@/lib/queryClient';

interface AppProvidersProps {
  children: ReactNode;
  api?: EmployeeApi;
  queryClient?: QueryClient;
}

export function AppProviders({ children, api, queryClient }: AppProvidersProps) {
  const [resolvedApi] = useState(() => api ?? createBrowserEmployeeApi());
  const [resolvedClient] = useState(() => queryClient ?? createQueryClient());

  return (
    <QueryClientProvider client={resolvedClient}>
      <EmployeeApiContext.Provider value={resolvedApi}>
        {children}
        <Toaster position="bottom-right" theme="light" closeButton />
      </EmployeeApiContext.Provider>
    </QueryClientProvider>
  );
}
