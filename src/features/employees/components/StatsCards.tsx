import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { EmployeeStats } from '../utils/stats';

interface StatsCardsProps {
  stats: EmployeeStats | undefined;
  isLoading: boolean;
}

interface Cell {
  label: string;
  value: (stats: EmployeeStats) => number;
  dot?: string;
  segment?: string;
}

const CELLS: Cell[] = [
  { label: 'Total employees', value: (s) => s.total },
  { label: 'Active', value: (s) => s.active, dot: 'bg-status-active', segment: 'bg-status-active' },
  { label: 'On leave', value: (s) => s.onLeave, dot: 'bg-status-leave', segment: 'bg-status-leave' },
  { label: 'Inactive', value: (s) => s.inactive, dot: 'bg-status-inactive', segment: 'bg-status-inactive' },
];


export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const ariaLabel = stats
    ? `Headcount split: ${stats.active} active, ${stats.onLeave} on leave, ${stats.inactive} inactive`
    : undefined;

  return (
    <section aria-label="Employee summary" className="overflow-hidden rounded-lg border border-line bg-surface">
      <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {CELLS.map((cell) => (
          <div key={cell.label} className="bg-surface p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-sm text-muted">
              {cell.dot ? <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', cell.dot)} /> : null}
              {cell.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {stats ? cell.value(stats) : isLoading ? <Skeleton className="h-8 w-12" /> : '—'}
            </dd>
          </div>
        ))}
      </dl>

      {stats && stats.total > 0 ? (
        <div role="img" aria-label={ariaLabel} className="flex h-1.5 w-full bg-line">
          {CELLS.filter((cell) => cell.segment).map((cell) => (
            <div
              key={cell.label}
              className={cell.segment}
              style={{ width: `${(cell.value(stats) / stats.total) * 100}%` }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
