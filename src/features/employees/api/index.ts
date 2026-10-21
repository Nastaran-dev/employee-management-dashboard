import type { EmployeeApi } from './employeeApi';
import { parseMockConfig } from './mockConfig';
import { createMockEmployeeApi, type StorageLike } from './mockEmployeeApi';

function getLocalStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    // Access can throw when storage is blocked (some privacy modes).
    return null;
  }
}

/**
 * The single place that decides which adapter the app uses.
 * To go live, return an HTTP implementation of `EmployeeApi` from here.
 */
export function createBrowserEmployeeApi(): EmployeeApi {
  return createMockEmployeeApi({
    storage: getLocalStorage(),
    ...parseMockConfig(window.location.search),
  });
}

export { EmployeeApiContext, useEmployeeApi } from './context';
export type { EmployeeApi } from './employeeApi';
export { ApiError, getErrorMessage, isApiError } from './errors';
