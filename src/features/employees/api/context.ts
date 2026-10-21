import { createContext, useContext } from 'react';
import type { EmployeeApi } from './employeeApi';

export const EmployeeApiContext = createContext<EmployeeApi | null>(null);

export function useEmployeeApi(): EmployeeApi {
  const api = useContext(EmployeeApiContext);
  if (!api) {
    throw new Error('useEmployeeApi must be used inside an EmployeeApiContext provider');
  }
  return api;
}
