import { useEffect, useId } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getErrorMessage, isApiError } from '../api/errors';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import { EMAIL_CONFLICT_MESSAGE, employeeInputSchema } from '../schemas/employeeSchema';
import { DEPARTMENTS, EMPLOYMENT_STATUSES, type Employee, type EmployeeInput } from '../types/employee';
import { findEmailConflict, getFullName } from '../utils/employee';

interface EmployeeFormProps {
  /** Present when editing; absent when creating. */
  employee?: Employee;
  /** Used for an instant duplicate-email check. The API remains authoritative. */
  employees: readonly Employee[];
  onDone: () => void;
  onCancel: () => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
}

function getDefaultValues(employee: Employee | undefined) {
  if (employee) {
    const { firstName, lastName, email, department, status } = employee;
    return { firstName, lastName, email, department, status };
  }
  // `department` is intentionally unset so the placeholder option is selected.
  return { firstName: '', lastName: '', email: '', status: 'Active' as const };
}

export function EmployeeForm({ employee, employees, onDone, onCancel, onSubmittingChange }: EmployeeFormProps) {
  const isEdit = employee !== undefined;
  const uid = useId();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeInputSchema),
    defaultValues: getDefaultValues(employee),
  });

  // Lets the dialog refuse to close while a request is in flight.
  useEffect(() => {
    onSubmittingChange(isSubmitting);
    return () => onSubmittingChange(false);
  }, [isSubmitting, onSubmittingChange]);

  const onSubmit: SubmitHandler<EmployeeInput> = async (values) => {
    if (findEmailConflict(employees, values.email, employee?.id)) {
      setError('email', { type: 'conflict', message: EMAIL_CONFLICT_MESSAGE });
      return;
    }

    try {
      const saved = employee
        ? await updateEmployee.mutateAsync({ id: employee.id, input: values })
        : await createEmployee.mutateAsync(values);

      toast.success(isEdit ? 'Changes saved' : 'Employee added', {
        description: `${getFullName(saved)} · ${saved.department}`,
      });
      onDone();
    } catch (error) {
      if (isApiError(error) && error.code === 'DUPLICATE_EMAIL') {
        setError('email', { type: 'conflict', message: EMAIL_CONFLICT_MESSAGE });
        return;
      }
      // Keep the dialog open so the person can retry without retyping.
      toast.error(isEdit ? 'Couldn’t save changes' : 'Couldn’t add employee', {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${uid}-first-name`} label="First name" error={errors.firstName?.message}>
          {(control) => <Input {...control} autoComplete="given-name" {...register('firstName')} />}
        </FormField>
        <FormField id={`${uid}-last-name`} label="Last name" error={errors.lastName?.message}>
          {(control) => <Input {...control} autoComplete="family-name" {...register('lastName')} />}
        </FormField>
      </div>

      <FormField id={`${uid}-email`} label="Email" error={errors.email?.message}>
        {(control) => <Input {...control} type="email" autoComplete="off" {...register('email')} />}
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${uid}-department`} label="Department" error={errors.department?.message}>
          {(control) => (
            <Select {...control} {...register('department')}>
              <option value="">Select a department</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField id={`${uid}-status`} label="Status" error={errors.status?.message}>
          {(control) => (
            <Select {...control} {...register('status')}>
              {EMPLOYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add employee'}
        </Button>
      </div>
    </form>
  );
}
