import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Users,
  Pill,
  FlaskConical,
  HeartPulse,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, splashState } from '@/lib/store/auth';
import { ROLE_HOME } from '@/lib/rbac';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SplashScreen } from '@/components/common/SplashScreen';

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Sign in · MediCore' },
      { name: 'description', content: 'Sign in to the MediCore hospital management platform.' },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email('Enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

// ── Role order: Administrator first, then staff roles ──
const roleConfig: {
  value: Role;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}[] = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full hospital access',
    icon: Shield,
    color: 'text-primary bg-primary/5 border-primary/20',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    description: 'Patient care & prescriptions',
    icon: Stethoscope,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    value: 'frontdesk',
    label: 'Front Desk',
    description: 'Registration & appointments',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    value: 'nurse',
    label: 'Nurse',
    description: 'Vitals & observations',
    icon: HeartPulse,
    color: 'text-pink-600 bg-pink-50 border-pink-200',
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
    description: 'Inventory & dispensing',
    icon: Pill,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    value: 'lab',
    label: 'Laboratory',
    description: 'Test orders & reports',
    icon: FlaskConical,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);

  // Start with no role selected — shows "Sign in as…" placeholder
  const [role, setRole] = useState<Role | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [initialSplashDone, setInitialSplashDone] = useState(splashState.shown);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: 'demo1234' },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selectedRole = role ? (roleConfig.find((r) => r.value === role) ?? null) : null;

  const handleRoleSelect = (r: (typeof roleConfig)[0]) => {
    setRole(r.value);
    form.setValue('email', `${r.value}@medicore.io`);
    setDropdownOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    if (!role) {
      toast.error('Please select a role first');
      return;
    }
    const u = await signIn(values.email, values.password, role);
    toast.success(`Welcome, ${u.name.split(' ')[0]}`);
    // Show branded splash before navigating
    setPendingNav(ROLE_HOME[u.role]);
    setShowSplash(true);
  };

  // Show branded splash on initial site load if not shown yet
  if (!initialSplashDone) {
    return (
      <SplashScreen
        onDone={() => {
          splashState.shown = true;
          setInitialSplashDone(true);
        }}
      />
    );
  }

  return (
    <>
      {/* Branded splash screen shown after login */}
      {showSplash && (
        <SplashScreen
          onDone={() => {
            splashState.shown = true;
            if (pendingNav) navigate({ to: pendingNav as '/' });
          }}
        />
      )}

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ── Left: Form ── */}
        <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary overflow-hidden">
              <img
                src="/logo.svg"
                alt="MediCore"
                className="h-6 w-6 object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">MediCore</span>
          </Link>

          <div className="my-auto w-full max-w-md py-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Sign in to your workspace
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select your role and sign in with your credentials.
            </p>

            {/* ── Role Dropdown ── */}
            <div className="mt-6">
              <Label htmlFor="role-dropdown" className="text-sm font-medium">
                Sign in as
              </Label>

              <div ref={dropdownRef} className="relative mt-1.5">
                {/* Trigger */}
                <button
                  id="role-dropdown"
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary/40',
                    dropdownOpen
                      ? 'border-primary bg-background ring-1 ring-primary/30'
                      : 'border-border bg-background hover:border-primary/50'
                  )}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  {selectedRole ? (
                    <>
                      {/* Selected role icon */}
                      <span
                        className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-lg border',
                          selectedRole.color
                        )}
                      >
                        <selectedRole.icon className="h-4 w-4" />
                      </span>
                      {/* Selected role text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-none">{selectedRole.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {selectedRole.description}
                        </p>
                      </div>
                    </>
                  ) : (
                    /* Placeholder */
                    <span className="flex-1 text-sm text-muted-foreground">Sign in as…</span>
                  )}

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      dropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Select your role"
                    className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
                  >
                    {roleConfig.map((r) => {
                      const Icon = r.icon;
                      const active = role === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          role="option"
                          aria-selected={active}
                          id={`role-option-${r.value}`}
                          onClick={() => handleRoleSelect(r)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                            active
                              ? 'bg-primary/5 text-foreground'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-8 w-8 shrink-0 place-items-center rounded-lg border',
                              r.color
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-none">{r.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                          </div>
                          {active && (
                            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register('email')}
                  className="mt-1.5"
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting || !role}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : selectedRole ? (
                  <>Continue as {selectedRole.label}</>
                ) : (
                  <>Select a role to continue</>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing in you agree to our terms. HIPAA-aligned demo environment.
              </p>
            </form>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MediCore Health Systems
          </p>
        </div>

        {/* ── Right: Hero ── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary/90 to-info p-12 text-primary-foreground lg:flex">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_70%,white_0,transparent_45%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> HIPAA-ready · ISO 27001
            </span>
            <h2 className="mt-8 max-w-md font-display text-4xl font-bold leading-tight">
              One platform for your entire hospital.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/85">
              Unified records, intelligent triage, and a workflow built for clinicians — from front
              desk to follow-up.
            </p>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            {[
              { k: '12,480', v: 'Active patients' },
              { k: '94%', v: 'On-time consults' },
              { k: '320', v: 'Clinicians' },
              { k: '4.9★', v: 'Staff rating' },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15"
              >
                <p className="font-display text-2xl font-bold">{s.k}</p>
                <p className="text-xs text-primary-foreground/80">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
