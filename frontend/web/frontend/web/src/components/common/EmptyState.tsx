import type { ComponentType, ReactNode } from 'react';

interface Props {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-background text-muted-foreground shadow-sm">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
