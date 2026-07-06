import { Link, useRouterState } from "@tanstack/react-router";
import { NAV, SHARED_NAV } from "./nav-config";
import { useAuth } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { Activity, X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
    const user = useAuth((s) => s.user);
    const pathname = useRouterState({ select: (r) => r.location.pathname });
    if (!user) return null;
    const items = NAV[user.role];
    const groups = Array.from(new Set(items.map((i) => i.group ?? "Menu")));

    const isActive = (to: string) =>
        pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
                    onClick={onClose}
                    aria-hidden
                />
            )}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                            <Activity className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="font-display text-base font-bold tracking-tight">MediCore</span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Hospital Suite
                            </span>
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="rounded-md p-1.5 hover:bg-sidebar-accent lg:hidden"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                    {groups.map((g) => (
                        <div key={g}>
                            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {g}
                            </p>
                            <ul className="space-y-0.5">
                                {items
                                    .filter((i) => (i.group ?? "Menu") === g)
                                    .map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.to);
                                        return (
                                            <li key={item.to}>
                                                <Link
                                                    to={item.to}
                                                    onClick={onClose}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                        active
                                                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Account
                        </p>
                        <ul className="space-y-0.5">
                            {SHARED_NAV.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.to);
                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                active
                                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>

                <div className="border-t border-sidebar-border p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
