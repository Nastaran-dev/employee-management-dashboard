import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProviders } from '@/app/providers';
import type { EmployeeApi } from '@/features/employees/api';
import { createMockEmployeeApi, type MockEmployeeApiOptions } from '@/features/employees/api/mockEmployeeApi';
import { createQueryClient } from '@/lib/queryClient';
import { TEST_EMPLOYEES } from './fixtures';

export function createTestApi(options: MockEmployeeApiOptions = {}): EmployeeApi {
  return createMockEmployeeApi({ storage: null, latencyMs: 0, seed: TEST_EMPLOYEES, ...options });
}

export function renderWithProviders(ui: ReactElement, api: EmployeeApi = createTestApi()) {
  const user = userEvent.setup();
  const result = render(
    <AppProviders api={api} queryClient={createQueryClient({ retry: false })}>
      {ui}
    </AppProviders>,
  );
  return { user, ...result };
}
