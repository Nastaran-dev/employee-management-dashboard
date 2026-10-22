import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { Employee } from '../types/employee';
import { EmployeeForm } from './EmployeeForm';

export type FormDialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; employee: Employee };

interface EmployeeFormDialogProps {
  state: FormDialogState;
  employees: readonly Employee[];
  onClose: () => void;
}

export function EmployeeFormDialog({ state, employees, onClose }: EmployeeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = state.mode === 'edit';
  const employee = state.mode === 'edit' ? state.employee : undefined;

  return (
    <Dialog
      open={state.mode !== 'closed'}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        className={[
          
          'inset-x-0 bottom-0 flex max-h-[calc(100dvh-1.5rem)] animate-sheet-up flex-col overflow-hidden rounded-t-2xl',
         
          'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:animate-fade-in sm:rounded-xl',
        ].join(' ')}
      >
       
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <DialogTitle>{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update this employee’s details.' : 'Add a new person to the directory.'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close" disabled={isSubmitting} className="-mr-2 -mt-2 shrink-0">
              <X aria-hidden="true" className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
          {state.mode !== 'closed' ? (
            <EmployeeForm
              key={employee?.id ?? 'new'}
              employee={employee}
              employees={employees}
              onDone={onClose}
              onCancel={onClose}
              onSubmittingChange={setIsSubmitting}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}