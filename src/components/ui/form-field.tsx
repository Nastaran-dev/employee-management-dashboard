import type { ReactNode } from 'react';
import { Label } from './label';

export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  className?: string; 
  children: (control: FieldControlProps) => ReactNode;
}

export function FormField({ id, label, error, className, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">
        {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
