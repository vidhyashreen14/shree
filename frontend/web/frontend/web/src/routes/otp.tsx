import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { z } from 'zod';

const searchSchema = z.object({ email: z.string().optional() });

export const Route = createFileRoute('/otp')({
  validateSearch: searchSchema,
  component: OtpPage,
});

function OtpPage() {
  const { email } = Route.useSearch();
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="surface-elevated w-full max-w-md p-8">
        <Link
          to="/forgot-password"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3 w-3" /> Back
        </Link>
        <div className="mt-6 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Verify your identity
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-foreground">{email || 'your email'}</span>.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length !== 6) {
              toast.error('Enter all 6 digits');
              return;
            }
            navigate({ to: '/reset-password' });
          }}
        >
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Verify code
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn't receive it?{' '}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => toast('Code resent')}
            >
              Resend
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
