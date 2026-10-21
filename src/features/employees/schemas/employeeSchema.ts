import { z } from 'zod';
import { DEPARTMENTS, EMPLOYMENT_STATUSES, type EmployeeInput } from '../types/employee';

export const EMAIL_CONFLICT_MESSAGE = 'Another employee already uses this email address';


export const employeeInputSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or fewer'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or fewer'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address'),
  department: z.enum(DEPARTMENTS, {
    errorMap: () => ({ message: 'Select a department' }),
  }),
  status: z.enum(EMPLOYMENT_STATUSES, {
    errorMap: () => ({ message: 'Select an employment status' }),
  }),
}) satisfies z.ZodType<EmployeeInput>;


export const storedEmployeeSchema = employeeInputSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const storedEmployeesSchema = z.array(storedEmployeeSchema);
