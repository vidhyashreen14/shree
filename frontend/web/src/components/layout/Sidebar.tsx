import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { NAV, SHARED_NAV } from "./nav-config";
import { useAuth } from "@/lib/store/auth";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { cn } from "@/lib/utils";
import { X, LogOut } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    desktopOpen?: boolean;
}

export function Sidebar({ open, onClose, desktopOpen = true }: Props) {
    const user = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const navigate = useNavigate();
    const pathname = useRouterState({ select: (r) => r.location.pathname });
    const { logoUrl, name } = useHospitalSettings();
    
    if (!user) return null;
    const items = NAV[user.role];
    const groups = Array.from(new Set(items.map((i) => i.group ?? "Menu")));

    const isActive = (to: string) =>
        pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

    const displayLogo = logoUrl || "/logo.svg";
    const isCustomLogo = !!logoUrl;

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
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
                    open ? "translate-x-0" : "-translate-x-full",
                    desktopOpen ? "lg:static lg:translate-x-0" : "lg:hidden lg:w-0"
                )}
            >
                {/* ── Logo ── */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
                    <Link to="/" className="flex items-center gap-2 max-w-[200px]" title={name}>
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary overflow-hidden shrink-0">
                            <img
                                src={displayLogo}
                                alt={`${name} Logo`}
                                className="h-6 w-6 object-contain"
                                style={!isCustomLogo ? { filter: "invert(1)" } : undefined}
                            />
                        </span>
                        <span className="flex flex-col leading-tight min-w-0">
                            <span className="font-display text-sm font-bold tracking-tight truncate">
                                {name}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
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

                {/* ── Navigation ── */}
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

                    {/* Shared nav */}
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

                {/* ── User footer ── */}
                <div className="border-t border-sidebar-border p-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3 flex-1 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            navigate({ to: "/login" });
                        }}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors shrink-0"
                        title="Sign out"
                        aria-label="Sign out"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </aside>
        </>
    );
}
