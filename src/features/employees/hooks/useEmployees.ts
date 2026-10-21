import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEmployeeApi } from '../api/context';
import type { EmployeeInput } from '../types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  list: () => [...employeeKeys.all, 'list'] as const,
};

/** Server state. Passing `signal` lets TanStack Query cancel superseded requests. */
export function useEmployeesQuery() {
  const api = useEmployeeApi();

  return useQuery({
    queryKey: employeeKeys.list(),
    queryFn: ({ signal }) => api.list({ signal }),
  });
}

/**
 * Mutation strategy: pessimistic. The cache is only touched after the server
 * confirms, then the list is refetched. Returning the invalidation promise keeps
 * the mutation pending until fresh data is in, so the UI never closes a dialog
 * on top of stale rows.
 */
export function useCreateEmployee() {
  const api = useEmployeeApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EmployeeInput) => api.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

interface UpdateEmployeeVariables {
  id: string;
  input: EmployeeInput;
}

export function useUpdateEmployee() {
  const api = useEmployeeApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateEmployeeVariables) => api.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}
