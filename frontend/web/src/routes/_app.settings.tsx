import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/store/theme';
import { Moon, Sun, Monitor, Bell, Languages, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/settings')({
  component: Settings,
});

function Settings() {
  const { theme, set } = useTheme();
  return (
    <>
      <PageHeader title="Settings" description="Personalize your workspace and notifications." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Appearance</h3>
          <p className="text-xs text-muted-foreground">Choose how MediCore looks to you.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                { v: 'light', label: 'Light', icon: Sun },
                { v: 'dark', label: 'Dark', icon: Moon },
                { v: 'light', label: 'System', icon: Monitor },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.v && opt.label !== 'System';
              return (
                <button
                  key={opt.label}
                  onClick={() => set(opt.v)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Notifications</h3>
          <div className="mt-4 space-y-4">
            {[
              { icon: Bell, label: 'Appointment reminders', desc: 'Before patient consults' },
              { icon: Bell, label: 'Lab report ready', desc: 'When investigations complete' },
              { icon: Bell, label: 'Low stock alerts', desc: 'Pharmacy items below threshold' },
              { icon: Bell, label: 'Daily digest email', desc: 'Sent at 8 AM' },
            ].map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="flex items-center gap-2 font-display font-semibold">
            <Languages className="h-4 w-4" /> Locale & format
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="font-semibold">English (India)</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Timezone</p>
              <p className="font-semibold">Asia/Kolkata</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Date format</p>
              <p className="font-semibold">DD MMM YYYY</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="font-semibold">INR (₹)</p>
            </div>
          </div>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="flex items-center gap-2 font-display font-semibold">
            <Lock className="h-4 w-4" /> Security
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Use an authenticator app</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Session timeout</p>
                <p className="text-xs text-muted-foreground">Auto-logout after 30 min idle</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
