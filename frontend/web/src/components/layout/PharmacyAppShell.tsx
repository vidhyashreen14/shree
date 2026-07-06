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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      {/* Horizontal Top Navigation Bar - Matching Project's Soft Teal/Light Theme */}
      <header className="sticky top-0 z-40 bg-background/80 text-foreground flex h-16 items-center px-4 md:px-6 justify-between border-b border-border backdrop-blur-md shadow-xs">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
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

          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-0.5 hover:bg-accent"
                aria-label="Account menu"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs font-normal capitalize text-muted-foreground">
                    {user.role} · {user.department}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <UserCog className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {children}
      </main>

      <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
    </div>
  );
}
