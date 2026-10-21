import { SEED_EMPLOYEES } from '@/mocks/employees';
import { employeeInputSchema, storedEmployeesSchema } from '../schemas/employeeSchema';
import type { Employee, EmployeeInput } from '../types/employee';
import { findEmailConflict } from '../utils/employee';
import { delay } from './delay';
import type { EmployeeApi, RequestOptions } from './employeeApi';
import { ApiError } from './errors';

export type MockOperation = 'list' | 'create' | 'update';


export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface MockEmployeeApiOptions {
  
  storage?: StorageLike | null;
  storageKey?: string;
  seed?: readonly Employee[];
  
  latencyMs?: number;
  
  failures?: Partial<Record<MockOperation, number>>;
  now?: () => Date;
  generateId?: () => string;
}

export const DEFAULT_STORAGE_KEY = 'roster:employees:v1';

let fallbackIdCounter = 0;

function defaultGenerateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  fallbackIdCounter += 1;
  return `emp-${Date.now()}-${fallbackIdCounter}`;
}

function copy(employee: Employee): Employee {
  return { ...employee };
}

export function createMockEmployeeApi(options: MockEmployeeApiOptions = {}): EmployeeApi {
  const {
    storage = null,
    storageKey = DEFAULT_STORAGE_KEY,
    seed = SEED_EMPLOYEES,
    latencyMs = 500,
    now = () => new Date(),
    generateId = defaultGenerateId,
  } = options;

  const remainingFailures: Partial<Record<MockOperation, number>> = { ...options.failures };
  let store: Employee[] | null = null;

  function readFromStorage(): Employee[] | null {
    if (!storage) return null;
    try {
      const raw = storage.getItem(storageKey);
      if (raw === null) return null;
      const parsed = storedEmployeesSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
     
      return null;
    }
  }

  function load(): Employee[] {
    if (store === null) {
      store = readFromStorage() ?? seed.map(copy);
    }
    return store;
  }

  function persist(employees: Employee[]): void {
    store = employees;
    if (!storage) return;
    try {
      storage.setItem(storageKey, JSON.stringify(employees));
    } catch {
      // Quota 
    }
  }

  async function simulateRequest(operation: MockOperation, signal?: AbortSignal): Promise<void> {
    await delay(latencyMs, signal);

    const remaining = remainingFailures[operation] ?? 0;
    if (remaining > 0) {
      remainingFailures[operation] = remaining - 1;
      throw new ApiError('NETWORK', `Simulated ${operation} failure`);
    }
  }

  function validate(input: EmployeeInput): EmployeeInput {
    const result = employeeInputSchema.safeParse(input);
    if (!result.success) {
      throw new ApiError('VALIDATION', result.error.issues.map((issue) => issue.message).join('; '));
    }
    return result.data;
  }

  return {
    async list({ signal }: RequestOptions = {}) {
      await simulateRequest('list', signal);
      return load().map(copy);
    },

    async create(input, { signal }: RequestOptions = {}) {
      await simulateRequest('create', signal);

      const data = validate(input);
      const employees = load();

      if (findEmailConflict(employees, data.email)) {
        throw new ApiError('DUPLICATE_EMAIL', `Email already in use: ${data.email}`);
      }

      const timestamp = now().toISOString();
      const employee: Employee = { ...data, id: generateId(), createdAt: timestamp, updatedAt: timestamp };
      persist([...employees, employee]);
      return copy(employee);
    },

    async update(id, input, { signal }: RequestOptions = {}) {
      await simulateRequest('update', signal);

      const data = validate(input);
      const employees = load();
      const existing = employees.find((employee) => employee.id === id);

      if (!existing) {
        throw new ApiError('NOT_FOUND', `Employee not found: ${id}`);
      }
      if (findEmailConflict(employees, data.email, id)) {
        throw new ApiError('DUPLICATE_EMAIL', `Email already in use: ${data.email}`);
      }

  
      const updated: Employee = { ...existing, ...data, updatedAt: now().toISOString() };
      persist(employees.map((employee) => (employee.id === id ? updated : employee)));
      return copy(updated);
    },
  };
}
