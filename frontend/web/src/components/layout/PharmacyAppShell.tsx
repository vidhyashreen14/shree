import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { useNotifications } from "@/lib/store/notifications";
import { CommandPalette } from "./CommandPalette";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut,
  Settings as SettingsIcon,
  UserCog,
  Activity,
  Receipt,
  PackageSearch,
  FileText,
  Truck,
  BarChart3,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [openDrawer, setOpenDrawer] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (!user) return null;

  const tabs = [
    { to: "/pharmacy/billing", label: "Billing", icon: Receipt },
    { to: "/pharmacy/inventory", label: "Inventory", icon: PackageSearch },
    { to: "/pharmacy/invoices", label: "Invoice", icon: FileText },
    { to: "/pharmacy/orders", label: "Purchase Order", icon: Truck },
    { to: "/pharmacy/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      {/* Mobile/Desktop Navigation Drawer Backdrop */}
      {openDrawer && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40"
          onClick={() => setOpenDrawer(false)}
          aria-hidden
        />
      )}
      {/* Drawer Side Navigation Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background text-foreground transition-transform duration-200",
          openDrawer ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl overflow-hidden">
              <img src="/logo.png" alt="MediCore Logo" className="h-9 w-9 object-cover" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight">MediCore</span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Pharmacy Suite
              </span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-accent"
            onClick={() => setOpenDrawer(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pharmacy Suite
            </p>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={() => setOpenDrawer(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
          </div>

          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
            <Link
              to="/profile"
              onClick={() => setOpenDrawer(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
              onClick={() => setOpenDrawer(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

        <div className="border-t border-border p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 rounded-lg bg-accent/60 p-3 flex-1 min-w-0">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Horizontal Top Navigation Bar - Matching Project's Soft Teal/Light Theme */}
      <header className="sticky top-0 z-40 bg-background/80 text-foreground flex h-16 items-center px-4 md:px-6 justify-between border-b border-border backdrop-blur-md shadow-xs">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            onClick={() => setOpenDrawer(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

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

          {/* Horizontal Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  {(tab.label === "Billing" || tab.label === "Inventory" || tab.label === "Invoice" || tab.label === "Purchase Order" || tab.label === "Reports") && (
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Controls & Account Dropdown */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            type="button"
            onClick={() => setOpenPalette(true)}
            className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search Catalogue…</span>
            <kbd className="hidden md:inline rounded border border-border px-1 py-0.2 font-mono text-[9px]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate({ to: "/notifications" })}
            className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
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
      </header>

      {/* Mobile Top Navigation Sub-bar */}
      <nav className="flex lg:hidden bg-muted border-b border-border text-foreground overflow-x-auto gap-1 p-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 shrink-0 rounded-lg text-xs font-semibold ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="relative flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {/* Watermark */}
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-[480px] max-w-[70vw] select-none opacity-[0.65]"
            style={{ filter: "grayscale(30%)" }}
          />
        </div>
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </main>

      <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
    </div>
  );
}
