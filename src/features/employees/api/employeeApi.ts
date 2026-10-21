import type { Employee, EmployeeInput } from '../types/employee';

export interface RequestOptions {
  /** Aborts the request. TanStack Query passes one for every query. */
  signal?: AbortSignal;
}

/**
 * The contract the UI depends on. The mock adapter implements it today;
 * an HTTP adapter can implement it later without touching any component.
 */
export interface EmployeeApi {
  list(options?: RequestOptions): Promise<Employee[]>;
  create(input: EmployeeInput, options?: RequestOptions): Promise<Employee>;
  update(id: string, input: EmployeeInput, options?: RequestOptions): Promise<Employee>;
}
