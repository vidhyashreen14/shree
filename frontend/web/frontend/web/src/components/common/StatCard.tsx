import * as React from 'react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Props {
  label?: string;
  title?: string;
  value: string | number;
  icon: any;
  trend?: number; // % change
  hint?: string;
  description?: string;
  tone?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  className?: string;
}

const toneMap: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  info: 'bg-info/10 text-info',
  neutral: 'bg-muted text-muted-foreground',
  danger: 'bg-destructive/10 text-destructive',
};

export function StatCard({
  label,
  title,
  value,
  icon,
  trend,
  hint,
  description,
  tone = 'primary',
  className,
}: Props) {
  const displayLabel = label || title || '';
  const displayHint = hint || description;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as ComponentType<any>;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className={cn('surface-elevated relative overflow-hidden p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {displayLabel}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
          {(trend !== undefined || displayHint) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold',
                    trend >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {trend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              {displayHint && <span className="text-muted-foreground">{displayHint}</span>}
            </div>
          )}
        </div>
        <span
          className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', toneMap[tone])}
        >
          {renderIcon()}
        </span>
      </div>
    </div>
  );
}
