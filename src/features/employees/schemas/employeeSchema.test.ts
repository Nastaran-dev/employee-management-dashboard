import { describe, expect, it } from 'vitest';
import { employeeInputSchema } from './employeeSchema';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  department: 'Engineering',
  status: 'Active',
};

function messagesFor(input: unknown): Record<string, string | undefined> {
  const result = employeeInputSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}

describe('employeeInputSchema', () => {
  it('accepts valid input and trims whitespace', () => {
    const result = employeeInputSchema.safeParse({
      ...valid,
      firstName: '  Ada ',
      email: ' ada@example.com  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('Ada');
      expect(result.data.email).toBe('ada@example.com');
    }
  });

  it('requires first name, last name and email, including whitespace-only values', () => {
    const messages = messagesFor({ ...valid, firstName: '   ', lastName: '', email: '' });
    expect(messages.firstName).toBe('First name is required');
    expect(messages.lastName).toBe('Last name is required');
    expect(messages.email).toBe('Email is required');
  });

  it('rejects an invalid email address', () => {
    expect(messagesFor({ ...valid, email: 'not-an-email' }).email).toBe('Enter a valid email address');
  });

  it('requires a department from the allowed list', () => {
    expect(messagesFor({ ...valid, department: '' }).department).toBe('Select a department');
    expect(messagesFor({ ...valid, department: 'Legal' }).department).toBe('Select a department');
  });
});
