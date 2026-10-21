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
      // Escape, overlay clicks and the X button are ignored mid-request.
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="inset-x-0 bottom-0 max-h-[90dvh] animate-sheet-up overflow-y-auto rounded-t-xl p-5 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:animate-fade-in sm:rounded-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
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

        {state.mode !== 'closed' ? (
          <EmployeeForm
            // A fresh form per employee guarantees create/edit never share stale values.
            key={employee?.id ?? 'new'}
            employee={employee}
            employees={employees}
            onDone={onClose}
            onCancel={onClose}
            onSubmittingChange={setIsSubmitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
