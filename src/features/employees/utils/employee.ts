import type { Employee } from '../types/employee';

type NameFields = Pick<Employee, 'firstName' | 'lastName'>;

export function getFullName({ firstName, lastName }: NameFields): string {
  return `${firstName} ${lastName}`;
}

export function getInitials({ firstName, lastName }: NameFields): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}


export function findEmailConflict(
  employees: readonly Employee[],
  email: string,
  excludeId?: string,
): Employee | undefined {
  const target = normalizeEmail(email);
  return employees.find(
    (employee) => employee.id !== excludeId && normalizeEmail(employee.email) === target,
  );
}
