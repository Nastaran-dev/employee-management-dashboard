import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover',
        outline: 'border border-line bg-surface text-ink hover:bg-canvas',
        ghost: 'text-muted hover:bg-canvas hover:text-ink',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
