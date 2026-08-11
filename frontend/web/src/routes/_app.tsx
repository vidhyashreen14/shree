import { Outlet, createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PharmacyAppShell } from '@/components/layout/PharmacyAppShell';
import { useAuth, splashState } from '@/lib/store/auth';
import { canAccess, ROLE_HOME } from '@/lib/rbac';
import { SplashScreen } from '@/components/common/SplashScreen';

export const Route = createFileRoute('/_app')({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // If splash was already shown (e.g. at login), skip it here
  const [splashDone, setSplashDone] = useState(splashState.shown);

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' });
      return;
    }
    if (!canAccess(user.role, pathname)) {
      navigate({ to: ROLE_HOME[user.role] });
    }
  }, [user, pathname, navigate]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  // Show branded splash before first dashboard render
  if (!splashDone) {
    return (
      <SplashScreen
        onDone={() => {
          splashState.shown = true;
          setSplashDone(true);
        }}
      />
    );
  }

  const isPharmacy = pathname.startsWith('/pharmacy');

  if (isPharmacy) {
    return (
      <PharmacyAppShell>
        <Outlet />
      </PharmacyAppShell>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
