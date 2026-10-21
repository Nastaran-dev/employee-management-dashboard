import { describe, expect, it } from 'vitest';
import { TEST_EMPLOYEES } from '@/test/fixtures';
import { ApiError } from './errors';
import { parseMockConfig } from './mockConfig';
import { createMockEmployeeApi, type StorageLike } from './mockEmployeeApi';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const newEmployee = {
  firstName: 'Jamie',
  lastName: 'Rivera',
  email: 'jamie@example.com',
  department: 'Finance',
  status: 'Active',
} as const;

function createApi(options: Parameters<typeof createMockEmployeeApi>[0] = {}) {
  return createMockEmployeeApi({ latencyMs: 0, seed: TEST_EMPLOYEES, ...options });
}

describe('mock employee API', () => {
  it('lists the seed data', async () => {
    expect(await createApi().list()).toHaveLength(7);
  });

  it('creates an employee with an id and timestamps', async () => {
    const api = createApi({ generateId: () => 'new-id', now: () => new Date('2025-02-03T04:05:06.000Z') });
    const created = await api.create({ ...newEmployee, firstName: '  Jamie ' });

    expect(created).toMatchObject({
      id: 'new-id',
      firstName: 'Jamie',
      createdAt: '2025-02-03T04:05:06.000Z',
      updatedAt: '2025-02-03T04:05:06.000Z',
    });
    expect(await api.list()).toHaveLength(8);
  });

  it('rejects duplicate emails case-insensitively on create', async () => {
    await expect(createApi().create({ ...newEmployee, email: 'ADA@example.com' })).rejects.toMatchObject({
      code: 'DUPLICATE_EMAIL',
    });
  });

  it('updates an employee while preserving id and createdAt', async () => {
    const api = createApi({ now: () => new Date('2025-06-01T00:00:00.000Z') });
    const updated = await api.update('1', { ...newEmployee, email: 'ada@example.com', lastName: 'King' });

    expect(updated).toMatchObject({
      id: '1',
      lastName: 'King',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2025-06-01T00:00:00.000Z',
    });
  });

  it('rejects an update that collides with another employee’s email', async () => {
    await expect(createApi().update('1', { ...newEmployee, email: 'grace@example.com' })).rejects.toMatchObject({
      code: 'DUPLICATE_EMAIL',
    });
  });

  it('reports NOT_FOUND when updating an unknown id', async () => {
    await expect(createApi().update('missing', newEmployee)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects invalid input on the server side too', async () => {
    await expect(createApi().create({ ...newEmployee, email: 'nope' })).rejects.toMatchObject({
      code: 'VALIDATION',
    });
  });

  it('fails deterministically for the configured number of calls, then recovers', async () => {
    const api = createApi({ failures: { list: 1 } });

    await expect(api.list()).rejects.toBeInstanceOf(ApiError);
    await expect(api.list()).resolves.toHaveLength(7);
  });

  it('persists to storage and restores it in a new instance', async () => {
    const storage = createMemoryStorage();
    await createApi({ storage }).create(newEmployee);

    expect(await createApi({ storage }).list()).toHaveLength(8);
  });

  it('falls back to the seed when stored data is corrupted', async () => {
    const key = 'roster:employees:v1';

    const invalidJson = createMemoryStorage({ [key]: '{not json' });
    expect(await createApi({ storage: invalidJson }).list()).toHaveLength(7);

    const wrongShape = createMemoryStorage({ [key]: JSON.stringify([{ id: 1 }]) });
    expect(await createApi({ storage: wrongShape }).list()).toHaveLength(7);
  });

  it('rejects with an AbortError when the request is cancelled', async () => {
    const controller = new AbortController();
    const request = createApi({ latencyMs: 50 }).list({ signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('parseMockConfig', () => {
  it('reads latency and failure switches from the query string', () => {
    expect(parseMockConfig('?latency=0&simulate=list-once,create')).toEqual({
      latencyMs: 0,
      failures: { list: 1, create: Infinity },
    });
  });

  it('ignores unknown or invalid values', () => {
    expect(parseMockConfig('?latency=abc&simulate=bogus')).toEqual({ failures: {} });
    expect(parseMockConfig('')).toEqual({});
  });
});
