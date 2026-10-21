import { EmployeesPage } from '@/features/employees/pages/EmployeesPage';
import { AppProviders } from './providers';

export function App() {
  return (
    <AppProviders>
      <EmployeesPage />
    </AppProviders>
  );
}
