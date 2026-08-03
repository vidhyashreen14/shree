import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'primary';

const map: Record<Tone, string> = {
  success: 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
  warning: 'bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/30',
  info: 'bg-info/10 text-info ring-1 ring-inset ring-info/20',
  danger: 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20',
  primary: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
  neutral: 'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
};

export function StatusChip({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
