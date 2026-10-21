import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ title, description, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      <Button className="mt-5" variant="outline" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Trying again…' : 'Try again'}
      </Button>
    </div>
  );
}
