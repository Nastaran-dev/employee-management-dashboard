import { QueryClient } from '@tanstack/react-query';

interface QueryClientOptions {
  /** Pass `false` in tests so failures surface immediately. */
  retry?: number | false;
}

export function createQueryClient(options: QueryClientOptions = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: options.retry ?? 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  });
}
