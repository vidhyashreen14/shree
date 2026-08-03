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
  Crown,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, splashState } from '@/lib/store/auth';
import { useCredentials } from '@/lib/store/credentials';
import { ROLE_HOME } from '@/lib/rbac';
import type { Role } from '@/lib/types';
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

const roleConfig: {
  value: Role;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}[] = [
  {
    value: 'superadmin',
    label: 'Super Admin',
    description: 'Global management',
    icon: Crown,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
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

const getRoleFromEmail = (email: string): Role | null => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  const account = useCredentials.getState().getByEmail(cleanEmail);
  if (account) return account.role;

  if (cleanEmail === 'superadmin@gmail.com' || cleanEmail.includes('superadmin'))
    return 'superadmin';
  if (cleanEmail === 'admin@medicore.com' || cleanEmail.includes('admin')) return 'admin';
  if (cleanEmail === 'doctor@medicore.com' || cleanEmail.includes('doctor')) return 'doctor';
  if (cleanEmail === 'frontdesk@medicore.com' || cleanEmail.includes('frontdesk'))
    return 'frontdesk';
  if (cleanEmail === 'nurse@medicore.com' || cleanEmail.includes('nurse')) return 'nurse';
  if (cleanEmail === 'pharmacy@medicore.com' || cleanEmail.includes('pharmacy')) return 'pharmacy';
  if (cleanEmail === 'lab@medicore.com' || cleanEmail.includes('lab')) return 'lab';

  return null;
};

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);

  const [showPwd, setShowPwd] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [initialSplashDone, setInitialSplashDone] = useState(splashState.shown);
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: 'demo@1234' },
  });

  const emailValue = form.watch('email');
  const resolvedRole = getRoleFromEmail(emailValue);
  const selectedRole = resolvedRole
    ? (roleConfig.find((r) => r.value === resolvedRole) ?? null)
    : null;

  const onSubmit = async (values: FormValues) => {
    const determinedRole = getRoleFromEmail(values.email);
    if (!determinedRole) {
      toast.error('Could not determine your role from this email');
      return;
    }
    const u = await signIn(values.email, values.password, determinedRole);
    toast.success(`Welcome, ${u.name.split(' ')[0]}`);
    setPendingNav(ROLE_HOME[u.role]);
    setShowSplash(true);
  };

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
      {showSplash && (
        <SplashScreen
          onDone={() => {
            splashState.shown = true;
            if (pendingNav) navigate({ to: pendingNav as '/' });
          }}
        />
      )}

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left: Form */}
        <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/25 overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.svg"
                alt="MediCore"
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Medi<span className="text-primary">Core</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Health Systems
              </span>
            </div>
          </Link>

          <div className="my-auto w-full max-w-md py-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Sign in to your workspace
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your email and password.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. doctor@medicore.io"
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
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : selectedRole ? (
                  <>Continue as {selectedRole.label}</>
                ) : (
                  <>Sign in</>
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

        {/* Right: Hero */}
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

          {/* Center Illustration */}
          <div className="relative flex-1 flex items-center justify-center py-6">
            <img
              src="/login-illustration.png"
              alt="MediCore Healthcare Workspace"
              className="max-h-[380px] w-auto object-contain animate-in fade-in slide-in-from-bottom-4 duration-500"
            />
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
