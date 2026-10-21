export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Finance',
  'Sales',
  'Operations',
] as const;

export const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Inactive'] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];


export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  status: EmploymentStatus;
}

export interface Employee extends EmployeeInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export function isDepartment(value: string): value is Department {
  return DEPARTMENTS.some((department) => department === value);
}

export function isEmploymentStatus(value: string): value is EmploymentStatus {
  return EMPLOYMENT_STATUSES.some((status) => status === value);
}
