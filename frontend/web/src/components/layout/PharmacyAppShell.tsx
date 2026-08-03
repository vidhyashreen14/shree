import { useState, type ReactNode, type ComponentType } from 'react';
import { Link, useNavigate, useRouterState, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/lib/store/auth';
import { useTheme } from '@/lib/store/theme';
import { useNotifications } from '@/lib/store/notifications';
import { CommandPalette } from './CommandPalette';
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
  X,
  Menu,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
}

export function PharmacyAppShell({ children }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const unread = useNotifications(
    (s) => s.notifications.filter((n: { read: boolean }) => !n.read).length,
  );
  const [openPalette, setOpenPalette] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await router.invalidate();
      toast.success('Page refreshed successfully');
    } catch {
      toast.error('Failed to refresh page');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  };

  const isInventoryActive =
    pathname.startsWith('/pharmacy/inventory') ||
    pathname.startsWith('/pharmacy/manufacturemaster');
  const [inventoryOpenManual, setInventoryOpenManual] = useState<boolean | null>(null);
  const inventoryOpen = inventoryOpenManual ?? isInventoryActive;

  interface TabItem {
    to?: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    children?: { to: string; label: string }[];
  }

  if (!user) return null;

  const tabs: TabItem[] = [
    { to: '/pharmacy/billing', label: 'Billing', icon: Receipt },
    {
      label: 'Inventory',
      icon: PackageSearch,
      children: [
        { to: '/pharmacy/inventory', label: 'Stock Inventory' },
        { to: '/pharmacy/manufacturemaster', label: 'Manufacturer Master' },
      ],
    },
    { to: '/pharmacy/invoices', label: 'Invoice', icon: FileText },
    { to: '/pharmacy/orders', label: 'Purchase Order', icon: Truck },
    { to: '/pharmacy/reports', label: 'Reports', icon: BarChart3 },
  ];

  const renderSidebarContent = () => {
    const initials = user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div className="flex h-full flex-col">
        {/* Top Brand Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 max-w-[200px]">
            <button
              type="button"
              className="rounded-full p-1.5 hover:bg-sidebar-accent text-sidebar-foreground transition-colors shrink-0"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(false);
                } else {
                  setDesktopOpen(!desktopOpen);
                }
              }}
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground overflow-hidden shrink-0 shadow-sm">
                <img src="/logo.png" alt="MediCore Logo" className="h-5 w-5 object-cover" />
              </span>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-display text-sm font-extrabold tracking-tight text-sidebar-foreground truncate">
                  MediCore
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary truncate">
                  Pharmacy Suite
                </span>
              </div>
            </Link>
          </div>

          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Header */}
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
            Pharmacy Staff
          </div>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setOpenPalette(true);
              setMobileOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/60 hover:bg-sidebar-accent px-3.5 py-2 text-xs text-sidebar-foreground/80 transition-all shadow-xs"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="flex-1 text-left font-medium">Search Catalogue…</span>
            <kbd className="rounded-full border border-sidebar-border bg-sidebar px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4 scrollbar-none">
          <div className="space-y-1.5">
            <p className="px-4 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
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
                      onClick={() => setInventoryOpenManual(!inventoryOpen)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200',
                        anyChildActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            anyChildActive ? 'text-primary-foreground' : 'text-muted-foreground',
                          )}
                        />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-4 pl-3 border-l border-sidebar-border space-y-1.5 mt-1">
                        {tab.children.map((child) => {
                          const childActive = pathname.startsWith(child.to);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex items-center gap-3 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200',
                                childActive
                                  ? 'bg-primary text-primary-foreground shadow-sm font-extrabold'
                                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
              const active = tab.to ? pathname.startsWith(tab.to) : false;
              return (
                <Link
                  key={tab.to}
                  to={tab.to!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200',
                    active
                      ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.02]'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-primary-foreground' : 'text-muted-foreground',
                    )}
                  />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-sidebar-border space-y-1.5">
            <p className="px-4 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200',
                pathname === '/profile'
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.02]'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1',
              )}
            >
              <UserCog
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  pathname === '/profile' ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              />
              <span>Profile</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200',
                pathname === '/settings'
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.02]'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1',
              )}
            >
              <SettingsIcon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  pathname === '/settings' ? 'text-primary-foreground' : 'text-muted-foreground',
                )}
              />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          {/* Theme + Notifications row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-sidebar-foreground transition-all shadow-xs"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigate({ to: '/notifications' });
                setMobileOpen(false);
              }}
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

          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: '/login' });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sidebar-accent px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-xs"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — collapsible on desktop, drawer on mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-all duration-300 ease-in-out p-3 shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          desktopOpen ? 'lg:static lg:translate-x-0' : 'lg:hidden lg:w-0',
        )}
      >
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-sidebar text-sidebar-foreground shadow-2xl border border-sidebar-border">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar with hamburger menu toggle & quick actions */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setDesktopOpen(!desktopOpen);
                }
              }}
              aria-label="Toggle menu"
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
              <span className="grid h-7 w-7 place-items-center rounded-lg overflow-hidden bg-primary/10">
                <img src="/logo.png" alt="MediCore Logo" className="h-5 w-5 object-cover" />
              </span>
              <span className="font-display text-sm font-bold tracking-tight">MediCore Pharmacy</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Refresh page"
              title="Refresh page"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </button>
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
              style={{ filter: 'grayscale(30%)' }}
            />
          </div>
          <div className="relative z-10 flex flex-col flex-1">{children}</div>
        </main>
      </div>

      <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
    </div>
  );
}
