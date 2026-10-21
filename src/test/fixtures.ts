import type { Department, Employee, EmploymentStatus } from '@/features/employees/types/employee';

export function buildEmployee(overrides: Partial<Employee> & Pick<Employee, 'id'>): Employee {
  return {
    firstName: 'Test',
    lastName: 'Person',
    email: `${overrides.id}@example.com`,
    department: 'Engineering',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function person(
  id: string,
  firstName: string,
  lastName: string,
  department: Department,
  status: EmploymentStatus,
): Employee {
  return buildEmployee({ id, firstName, lastName, email: `${firstName}@example.com`.toLowerCase(), department, status });
}


export const TEST_EMPLOYEES: readonly Employee[] = [
  person('1', 'Ada', 'Lovelace', 'Engineering', 'Active'),
  person('2', 'Grace', 'Hopper', 'Engineering', 'On Leave'),
  person('3', 'Maya', 'Patel', 'Marketing', 'Active'),
  person('4', 'Liam', 'Chen', 'Finance', 'Inactive'),
  person('5', 'Sofia', 'Rossi', 'Sales', 'Active'),
  person('6', 'Noah', 'Kim', 'Operations', 'On Leave'),
  person('7', 'Eva', 'Novak', 'Human Resources', 'Active'),
];


export function buildManyEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');
    return buildEmployee({
      id: `bulk-${number}`,
      firstName: 'Test',
      lastName: `User ${number}`,
      email: `user${number}@example.com`,
    });
  });
}
