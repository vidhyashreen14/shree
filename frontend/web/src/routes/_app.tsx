import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PharmacyAppShell } from "@/components/layout/PharmacyAppShell";
import { useAuth } from "@/lib/store/auth";
import { canAccess, ROLE_HOME } from "@/lib/rbac";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
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

  const isPharmacy = pathname.startsWith("/pharmacy");

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
