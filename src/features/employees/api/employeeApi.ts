import type { Employee, EmployeeInput } from '../types/employee';

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface EmployeeApi {
  list(options?: RequestOptions): Promise<Employee[]>;
  create(input: EmployeeInput, options?: RequestOptions): Promise<Employee>;
  update(id: string, input: EmployeeInput, options?: RequestOptions): Promise<Employee>;
}
