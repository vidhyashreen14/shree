import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Activity, Eye, EyeOff, Loader2, ShieldCheck, Stethoscope, Users, Pill, FlaskConical, HeartPulse, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store/auth";
import { ROLE_HOME, ROLES } from "@/lib/rbac";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · MediCore" },
      { name: "description", content: "Sign in to the MediCore hospital management platform." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const roleIcons: Record<Role, typeof Shield> = {
  admin: Shield,
  doctor: Stethoscope,
  frontdesk: Users,
  nurse: HeartPulse,
  pharmacy: Pill,
  lab: FlaskConical,
};

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuth((s) => s.signIn);
  const [role, setRole] = useState<Role>("doctor");
  const [showPwd, setShowPwd] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "doctor@medicore.io", password: "demo1234" },
  });

  const onSubmit = async (values: FormValues) => {
    const u = await signIn(values.email, values.password, role);
    toast.success(`Welcome, ${u.name.split(" ")[0]}`);
    navigate({ to: ROLE_HOME[u.role] });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Form */}
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">MediCore</span>
        </Link>

        <div className="my-auto w-full max-w-md py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome back</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick the role you want to demo and continue. All data is mocked.
          </p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sign in as
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = roleIcons[r.value];
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value);
                      form.setValue("email", `${r.value}@medicore.io`);
                    }}
                    className={cn(
                      "group flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                        : "border-border bg-background hover:border-primary/50 hover:bg-accent/40",
                    )}
                  >
                    <span className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-semibold leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} className="mt-1.5" />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <>Continue as {ROLES.find((r) => r.value === role)?.label}</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing in you agree to our terms. HIPAA-aligned demo environment.
            </p>
          </form>
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediCore Health Systems</p>
      </div>

      {/* Hero panel */}
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
            Unified records, intelligent triage, and a workflow built for clinicians — from front desk to follow-up.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {[
            { k: "12,480", v: "Active patients" },
            { k: "94%", v: "On-time consults" },
            { k: "320", v: "Clinicians" },
            { k: "4.9★", v: "Staff rating" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15">
              <p className="font-display text-2xl font-bold">{s.k}</p>
              <p className="text-xs text-primary-foreground/80">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
