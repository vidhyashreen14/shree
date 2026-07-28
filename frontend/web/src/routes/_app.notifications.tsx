import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { useNotifications } from '@/lib/store/notifications';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export const Route = createFileRoute('/_app/notifications')({
  component: Notifications,
});

<<<<<<< HEAD
const tone: Record<Notification["kind"], Parameters<typeof StatusChip>[0]["tone"]> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
=======
const tone: Record<Notification['kind'], Parameters<typeof StatusChip>[0]['tone']> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
>>>>>>> a821a0c (second update)
};

function Notifications() {
  const items = useNotifications((s) => s.items);
  const markAll = useNotifications((s) => s.markAllRead);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="All alerts from across the hospital."
        actions={
          <Button variant="outline" onClick={markAll}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="surface-elevated divide-y divide-border">
        {items.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto h-6 w-6 opacity-60" />
            You're all caught up.
          </div>
        )}
        {items.map((n) => (
<<<<<<< HEAD
          <div key={n.id} className={cn("flex items-start gap-3 p-4", !n.read && "bg-primary/4")}>
            <span
              className={cn(
                "mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
=======
          <div key={n.id} className={cn('flex items-start gap-3 p-4', !n.read && 'bg-primary/4')}>
            <span
              className={cn(
                'mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground',
>>>>>>> a821a0c (second update)
              )}
            >
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{n.title}</p>
                <StatusChip tone={tone[n.kind]}>{n.kind}</StatusChip>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(n.at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
