import { useState, useEffect, type ReactNode, type ComponentType } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { useNotifications } from "@/lib/store/notifications";
import { CommandPalette } from "./CommandPalette";
import {
  Bell,
  Moon,
  Search,
  Sun,
  LogOut,
  Settings as SettingsIcon,
  UserCog,
  Receipt,
  PackageSearch,
  FileText,
  Truck,
  BarChart3,
  Factory,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

export function PharmacyAppShell({ children }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const unread = useNotifications((s) => s.notifications.filter((n: any) => !n.read).length);
  const [openPalette, setOpenPalette] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isInventoryActive =
    pathname.startsWith("/pharmacy/inventory") ||
    pathname.startsWith("/pharmacy/manufacturemaster");
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);

  useEffect(() => {
    if (isInventoryActive) {
      setInventoryOpen(true);
    }
  }, [pathname, isInventoryActive]);

  interface TabItem {
    to?: string;
    label: string;
    icon: ComponentType<any>;
    children?: { to: string; label: string }[];
  }

  if (!user) return null;

  const tabs: TabItem[] = [
    { to: "/pharmacy/billing", label: "Billing", icon: Receipt },
    {
      label: "Inventory",
      icon: PackageSearch,
      children: [
        { to: "/pharmacy/inventory", label: "Stock Inventory" },
        { to: "/pharmacy/manufacturemaster", label: "Manufacturer Master" },
      ],
    },
    { to: "/pharmacy/invoices", label: "Invoice", icon: FileText },
    { to: "/pharmacy/orders", label: "Purchase Order", icon: Truck },
    { to: "/pharmacy/reports", label: "Reports", icon: BarChart3 },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-xl overflow-hidden">
            <img src="/logo.png" alt="MediCore Logo" className="h-9 w-9 object-cover" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight">MediCore</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
              Pharmacy Suite
            </span>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          type="button"
          className="rounded-md p-1.5 hover:bg-accent lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setOpenPalette(true);
            setMobileOpen(false);
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-input bg-muted/40 hover:bg-muted px-3 py-2 text-xs text-muted-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search Catalogue…</span>
          <kbd className="rounded border border-border px-1 font-mono text-[9px]">⌘K</kbd>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pharmacy Suite
        </p>
        {tabs.map((tab) => {
          if (tab.children) {
            const Icon = tab.icon;
            const isOpen = inventoryOpen;
            const anyChildActive = tab.children.some((child) => pathname.startsWith(child.to));
            return (
              <div key={tab.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setInventoryOpen(!isOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
                    anyChildActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground/70",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="ml-5 pl-4 border-l border-border/50 space-y-1 mt-1">
                    {tab.children.map((child) => {
                      const childActive = pathname === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            childActive
                              ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = tab.icon;
          // Use exact match to ensure only one tab is active at a time.
          // Prefix match would cause /pharmacy/billing to stay active if a
          // sub-route ever existed beneath it.
          const active = tab.to ? pathname === tab.to : false;
          return (
            <Link
              key={tab.to}
              to={tab.to!}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/profile"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <UserCog className="h-4 w-4 shrink-0" />
            <span>Profile</span>
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <SettingsIcon className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        {/* Theme + Notifications row */}
        <div className="flex items-center gap-1 px-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigate({ to: "/notifications" });
              setMobileOpen(false);
            }}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-destructive px-0.5 text-[8px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-destructive transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — permanent on desktop, drawer on mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar (just the hamburger) */}
        <div className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="menu-btn-reset"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <div className="menu__background">
              <div className="menu__icon">
                <span />
                <span />
                <span />
              </div>
            </div>
          </button>
          <div className="flex items-center gap-2 ml-3">
            <span className="grid h-7 w-7 place-items-center rounded-lg overflow-hidden">
              <img src="/logo.png" alt="MediCore Logo" className="h-7 w-7 object-cover" />
            </span>
            <span className="font-display text-sm font-bold tracking-tight">MediCore</span>
          </div>
        </div>

        {/* Page content */}
        <main className="relative flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
          {/* Watermark */}
          <div
            className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <img
              src="/logo.png"
              alt=""
              className="w-[480px] max-w-[70vw] select-none opacity-[0.65]"
              style={{ filter: "grayscale(30%)" }}
            />
          </div>
          <div className="relative z-10 flex flex-col flex-1">{children}</div>
        </main>
      </div>

      <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
    </div>
  );
}
