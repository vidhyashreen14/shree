import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { NAV, SHARED_NAV } from "./nav-config";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { useNotifications } from "@/lib/store/notifications";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { cn } from "@/lib/utils";
import { X, LogOut, Search, Moon, Sun, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";

interface Props {
    open: boolean;
    onClose: () => void;
    desktopOpen?: boolean;
    onToggleDesktop?: () => void;
}

export function Sidebar({ open, onClose, desktopOpen = true, onToggleDesktop }: Props) {
    const user = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const navigate = useNavigate();
    const location = useRouterState({ select: (r) => r.location });
    const { logoUrl, name } = useHospitalSettings();
    const { theme, toggleTheme } = useTheme();
    const unread = useNotifications((s) => s.notifications.filter((n: any) => !n.read).length);
    const [openPalette, setOpenPalette] = useState(false);

    if (!user) return null;
    const items = NAV[user.role];
    const groups = Array.from(new Set(items.map((i) => i.group ?? "Menu")));

    const displayLogo = logoUrl || "/logo.svg";
    const isCustomLogo = !!logoUrl;
    const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

    const isActive = (to: string) => {
        const href = decodeURIComponent(location.href);
        const target = decodeURIComponent(to);
        if (target.includes("?")) {
            return href === target || href.startsWith(target + "&");
        }
        return location.pathname === target;
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs lg:hidden transition-opacity duration-200"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            {/* Floating Card Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-all duration-300 ease-in-out p-3 shrink-0",
                    open ? "translate-x-0" : "-translate-x-full",
                    desktopOpen ? "lg:static lg:translate-x-0" : "lg:hidden lg:w-0"
                )}
            >
                <div className="flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-sidebar text-sidebar-foreground shadow-2xl border border-sidebar-border">
                    
                    {/* Top Brand & Hamburger Toggle */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2 max-w-[200px]">
                            {/* Hamburger Menu button inside sidebar */}
                            <button
                                type="button"
                                className="rounded-full p-1.5 hover:bg-sidebar-accent text-sidebar-foreground transition-colors shrink-0"
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        onClose();
                                    } else if (onToggleDesktop) {
                                        onToggleDesktop();
                                    }
                                }}
                                title="Toggle Sidebar"
                                aria-label="Toggle Sidebar"
                            >
                                <Menu className="h-4 w-4" />
                            </button>

                            <Link to="/" className="flex items-center gap-2.5 min-w-0" title={name}>
                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground overflow-hidden shrink-0 shadow-sm">
                                    <img
                                        src={displayLogo}
                                        alt={`${name} Logo`}
                                        className="h-5 w-5 object-contain"
                                        style={!isCustomLogo ? { filter: "invert(1)" } : undefined}
                                    />
                                </span>
                                <span className="flex flex-col leading-tight min-w-0">
                                    <span className="font-display text-sm font-extrabold tracking-tight text-sidebar-foreground truncate">
                                        {name}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary truncate">
                                        Hospital Suite
                                    </span>
                                </span>
                            </Link>
                        </div>

                        {/* Close button — mobile only */}
                        <button
                            type="button"
                            className="rounded-full p-1.5 hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors lg:hidden"
                            onClick={onClose}
                            aria-label="Close sidebar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Profile Header (Reflects screenshot: Circle Avatar, Name, Email, Role Pill) */}
                    <div className="relative flex flex-col items-center justify-center px-4 pt-4 pb-5 text-center border-b border-sidebar-border bg-sidebar-accent/30">
                        <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full p-1 ring-2 ring-primary/40 bg-primary/10 shadow-md transition-transform duration-300 hover:scale-105">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xl font-extrabold text-primary-foreground tracking-wider">
                                {initials}
                            </div>
                        </div>
                        <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-sidebar-foreground truncate max-w-[200px]">
                            {user.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground font-medium truncate max-w-[200px] lowercase">
                            {user.email || `${user.role}@medicore.io`}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {user.role} STAFF
                        </div>
                    </div>

                    {/* Search Input (Matches screenshot: Search Catalogue… ⌘K) */}
                    <div className="px-4 pt-4">
                        <button
                            type="button"
                            onClick={() => { setOpenPalette(true); onClose(); }}
                            className="flex w-full items-center justify-between rounded-full border border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent px-3.5 py-2 text-xs text-sidebar-foreground/80 transition-all shadow-xs"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Search className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span className="truncate font-medium">Search Catalogue…</span>
                            </div>
                            <kbd className="rounded-full border border-sidebar-border bg-sidebar px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground shrink-0">⌘K</kbd>
                        </button>
                    </div>

                    {/* Navigation Items (Pill-shaped items) */}
                    <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4 scrollbar-none">
                        {groups.map((g) => (
                            <div key={g} className="space-y-2">
                                <p className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                                    {g}
                                </p>
                                <ul className="space-y-1.5">
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
                                                            "flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200",
                                                            active
                                                                ? "bg-primary text-primary-foreground shadow-md transform scale-[1.02]"
                                                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                                                        )}
                                                    >
                                                        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary-foreground" : "text-muted-foreground")} />
                                                        <span className="truncate">{item.label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        ))}

                        {/* Shared Nav (Account) */}
                        <div className="space-y-2 pt-2 border-t border-sidebar-border">
                            <p className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                                Account
                            </p>
                            <ul className="space-y-1.5">
                                {SHARED_NAV.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.to);
                                    return (
                                        <li key={item.to}>
                                            <Link
                                                to={item.to}
                                                onClick={onClose}
                                                className={cn(
                                                    "flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200",
                                                    active
                                                        ? "bg-primary text-primary-foreground shadow-md transform scale-[1.02]"
                                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                                                )}
                                            >
                                                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary-foreground" : "text-muted-foreground")} />
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </nav>

                    {/* Footer Controls (Matches screenshot: DARK / Theme button + Notifications Bell, then SIGN OUT) */}
                    <div className="p-4 pt-2 border-t border-sidebar-border space-y-2">
                        {/* Row 1: Theme Button + Notification Bell */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-sidebar-foreground transition-all shadow-xs"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
                                <span>{theme === "dark" ? "Light" : "Dark"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { navigate({ to: "/notifications" }); onClose(); }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground transition-all shadow-xs"
                                aria-label="Notifications"
                            >
                                <Bell className="h-4 w-4 text-primary" />
                                {unread > 0 && (
                                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-extrabold text-destructive-foreground shadow-xs">
                                        {unread}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Row 2: Full-Width Sign Out Button */}
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate({ to: "/login" });
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-sidebar-accent px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-xs"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>

                </div>
            </aside>

            {/* Command Palette Modal */}
            <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
        </>
    );
}
