import { cn } from '@/lib/utils';
import type { EmploymentStatus } from '../types/employee';

const STYLES: Record<EmploymentStatus, { badge: string; dot: string }> = {
  Active: { badge: 'bg-status-active-bg text-status-active', dot: 'bg-status-active' },
  'On Leave': { badge: 'bg-status-leave-bg text-status-leave', dot: 'bg-status-leave' },
  Inactive: { badge: 'bg-status-inactive-bg text-status-inactive', dot: 'bg-status-inactive' },
};

export function StatusBadge({ status }: { status: EmploymentStatus }) {
  const styles = STYLES[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', styles.badge)}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {status}
    </span>
  );
}
