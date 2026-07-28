import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useRouterState, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/lib/store/auth';
import { useTheme } from '@/lib/store/theme';
import { useNotifications } from '@/lib/store/notifications';
import {
  Building2,
  BadgeCheck,
  PackageSearch,
  Users,
  Inbox,
  FileText,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  children: ReactNode;
}

export function SuperAdminAppShell({ children }: Props) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const unread = useNotifications(
    (s) => s.notifications.filter((n: { read: boolean }) => !n.read).length,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  if (!user) return null;

  const tabs = [
    { to: '/superadmin/hospitals', label: 'Hospitals', icon: Building2, group: 'Hospitals' },
    { to: '/superadmin/subscriptions', label: 'Subscriptions', icon: BadgeCheck, group: 'Subscriptions' },
    { to: '/superadmin/modules', label: 'Modules', icon: PackageSearch, group: 'System' },
    { to: '/superadmin/notifications', label: 'Notifications', icon: Bell, group: 'System' },
    { to: '/superadmin/users', label: 'Company Users', icon: Users, group: 'Users' },
    { to: '/superadmin/support', label: 'Support', icon: Inbox, group: 'Support' },
    { to: '/superadmin/reports', label: 'Reports', icon: FileText, group: 'Reports' },
    { to: '/superadmin/settings', label: 'System Settings', icon: Settings, group: 'Settings' },
  ];

  const groups = Array.from(new Set(tabs.map((t) => t.group)));

  const isActive = (to: string) =>
    pathname === to || (to !== '/' && pathname.startsWith(to + '/'));

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      {/* Backdrop overlay for drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Side Drawer ────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out shadow-xl',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary overflow-hidden shrink-0">
              <img
                src="/logo.svg"
                alt="MediCore Logo"
                className="h-6 w-6 object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-display text-sm font-bold tracking-tight">MediCore</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Super Admin
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-sidebar-accent text-muted-foreground"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group}
              </p>
              <ul className="space-y-0.5">
                {tabs
                  .filter((t) => t.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            active
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.label === 'Notifications' && unread > 0 && (
                            <span className="ml-auto grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                              {unread}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Drawer user footer */}
        <div className="border-t border-sidebar-border p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3 flex-1 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
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
              navigate({ to: '/login' });
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* ── Top Navbar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/80 text-foreground flex h-16 items-center justify-between border-b border-border backdrop-blur-md shadow-xs px-4 sm:px-6">

        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 text-foreground shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary overflow-hidden shrink-0">
              <img
                src="/logo.svg"
                alt="MediCore Logo"
                className="h-6 w-6 object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </span>
            <div className="flex flex-col leading-tight hidden sm:flex">
              <span className="font-display text-sm font-bold tracking-tight">MediCore</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Super Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Current page breadcrumb on desktop */}
        <div className="hidden md:flex items-center">
          {tabs.find((t) => isActive(t.to)) && (() => {
            const current = tabs.find((t) => isActive(t.to))!;
            const Icon = current.icon;
            return (
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Icon className="h-4 w-4 text-primary" />
                {current.label}
              </span>
            );
          })()}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Refresh page"
            title="Refresh page"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications shortcut */}
          <button
            type="button"
            onClick={() => navigate({ to: '/superadmin/notifications' })}
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

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-accent focus:outline-hidden">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <span className="hidden md:inline-block text-sm font-medium pr-1 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-65 hidden md:block shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1.5">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                onClick={() => {
                  logout();
                  navigate({ to: '/login' });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="relative flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {/* Watermark */}
        <div
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <img
            src="/logo.svg"
            alt=""
            className="w-[440px] max-w-[70vw] select-none"
            style={{
              opacity: 0.04,
              filter: 'var(--watermark-filter, grayscale(1) brightness(0))',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </main>
    </div>
  );
}
