import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'primary';

const map: Record<Tone, string> = {
  success:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-800/50 dark:bg-emerald-950/40',
  warning:
    'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300/60 dark:border-amber-800/50 dark:bg-amber-950/40',
  info: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-300/60 dark:border-cyan-800/50 dark:bg-cyan-950/40',
  danger:
    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/60 dark:border-rose-800/50 dark:bg-rose-950/40',
  primary:
    'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-300/60 dark:border-teal-800/50 dark:bg-teal-950/40',
  neutral: 'bg-muted text-muted-foreground border border-border',
};

export function StatusChip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        map[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
