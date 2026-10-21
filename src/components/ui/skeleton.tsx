import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-line/80 motion-reduce:animate-none', className)} />
  );
}
