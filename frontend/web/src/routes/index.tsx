import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";
import { ROLE_HOME } from "@/lib/rbac";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // SSR-safe: only redirect on the client after auth hydrates
    if (typeof window === "undefined") return;
    const user = useAuth.getState().user;
    if (user) throw redirect({ to: ROLE_HOME[user.role] });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
