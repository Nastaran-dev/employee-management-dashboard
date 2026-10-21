import type { EmployeeApi } from './employeeApi';
import { parseMockConfig } from './mockConfig';
import { createMockEmployeeApi, type StorageLike } from './mockEmployeeApi';

function getLocalStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {

    return null;
  }
}


export function createBrowserEmployeeApi(): EmployeeApi {
  return createMockEmployeeApi({
    storage: getLocalStorage(),
    ...parseMockConfig(window.location.search),
  });
}

export { EmployeeApiContext, useEmployeeApi } from './context';
export type { EmployeeApi } from './employeeApi';
export { ApiError, getErrorMessage, isApiError } from './errors';
