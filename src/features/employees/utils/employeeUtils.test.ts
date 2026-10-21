import { describe, expect, it } from 'vitest';
import { buildManyEmployees, TEST_EMPLOYEES } from '@/test/fixtures';
import type { EmployeeFilters } from '../types/table';
import { findEmailConflict } from './employee';
import { filterEmployees } from './filterEmployees';
import { paginate } from './paginate';
import { sortEmployees } from './sortEmployees';
import { getEmployeeStats } from './stats';

const NO_FILTERS: EmployeeFilters = { search: '', department: 'all', status: 'all' };
const names = (employees: readonly { firstName: string }[]) => employees.map((e) => e.firstName);

describe('filterEmployees', () => {
  it('returns everyone when no filter is set', () => {
    expect(filterEmployees(TEST_EMPLOYEES, NO_FILTERS)).toHaveLength(7);
  });

  it('matches first name, last name, full name and email case-insensitively', () => {
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'ADA' }))).toEqual(['Ada']);
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'hopper' }))).toEqual(['Grace']);
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'maya patel' }))).toEqual(['Maya']);
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'patel maya' }))).toEqual(['Maya']);
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'liam@EXAMPLE' }))).toEqual(['Liam']);
  });

  it('ignores extra whitespace in the query', () => {
    expect(names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: '   noah    kim ' }))).toEqual(['Noah']);
  });

  it('filters by department and status, alone and combined', () => {
    expect(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, department: 'Engineering' })).toHaveLength(2);
    expect(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, status: 'On Leave' })).toHaveLength(2);
    expect(
      names(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, department: 'Engineering', status: 'On Leave' })),
    ).toEqual(['Grace']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterEmployees(TEST_EMPLOYEES, { ...NO_FILTERS, search: 'zzz' })).toEqual([]);
  });
});

describe('sortEmployees', () => {
  it('sorts by name ascending and descending without mutating the input', () => {
    const before = [...TEST_EMPLOYEES];
    const asc = sortEmployees(TEST_EMPLOYEES, { key: 'name', direction: 'asc' });
    const desc = sortEmployees(TEST_EMPLOYEES, { key: 'name', direction: 'desc' });

    expect(asc[0]?.lastName).toBe('Chen');
    expect(desc[0]?.lastName).toBe('Rossi');
    expect([...TEST_EMPLOYEES]).toEqual(before);
  });

  it('sorts status by lifecycle order, not alphabetically', () => {
    const sorted = sortEmployees(TEST_EMPLOYEES, { key: 'status', direction: 'asc' });
    expect(sorted.map((e) => e.status)).toEqual([
      'Active', 'Active', 'Active', 'Active', 'On Leave', 'On Leave', 'Inactive',
    ]);
  });
});

describe('paginate', () => {
  const items = buildManyEmployees(25);

  it('returns the requested slice and range', () => {
    const page = paginate(items, 2, 10);
    expect(page.items).toHaveLength(10);
    expect([page.from, page.to, page.totalPages]).toEqual([11, 20, 3]);
  });

  it('clamps a page number that is out of range', () => {
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items.slice(0, 4), 3, 10).items).toHaveLength(4);
  });

  it('handles an empty list', () => {
    const page = paginate([], 1, 10);
    expect([page.items.length, page.from, page.to, page.totalPages]).toEqual([0, 0, 0, 1]);
  });
});

describe('getEmployeeStats', () => {
  it('derives counts from the data', () => {
    expect(getEmployeeStats(TEST_EMPLOYEES)).toEqual({ total: 7, active: 4, onLeave: 2, inactive: 1 });
    expect(getEmployeeStats([])).toEqual({ total: 0, active: 0, onLeave: 0, inactive: 0 });
  });
});

describe('findEmailConflict', () => {
  it('compares case-insensitively and ignores surrounding whitespace', () => {
    expect(findEmailConflict(TEST_EMPLOYEES, '  ADA@Example.com ')?.id).toBe('1');
    expect(findEmailConflict(TEST_EMPLOYEES, 'new@example.com')).toBeUndefined();
  });

  it('lets an employee keep their own email when editing', () => {
    expect(findEmailConflict(TEST_EMPLOYEES, 'ada@example.com', '1')).toBeUndefined();
    expect(findEmailConflict(TEST_EMPLOYEES, 'ada@example.com', '2')?.id).toBe('1');
  });
});
