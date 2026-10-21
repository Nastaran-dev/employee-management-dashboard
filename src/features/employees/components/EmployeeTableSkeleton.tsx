import { Skeleton } from '@/components/ui/skeleton';

const ROWS = 8;

export function EmployeeTableSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading employees
      </p>
      <div className="divide-y divide-line">
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="hidden h-4 w-52 md:block" />
            <Skeleton className="hidden h-4 w-28 md:block" />
            <Skeleton className="ml-auto h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
