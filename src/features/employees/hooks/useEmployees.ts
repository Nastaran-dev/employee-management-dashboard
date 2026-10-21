import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEmployeeApi } from '../api/context';
import type { EmployeeInput } from '../types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  list: () => [...employeeKeys.all, 'list'] as const,
};

export function useEmployeesQuery() {
  const api = useEmployeeApi();

  return useQuery({
    queryKey: employeeKeys.list(),
    queryFn: ({ signal }) => api.list({ signal }),
  });
}

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
