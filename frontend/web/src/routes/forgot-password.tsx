import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allowOnlyEmailChars, emailSchema } from "@/lib/validations";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="surface-elevated w-full max-w-md p-8">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to sign in
        </Link>
        <div className="mt-6 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your work email and we'll send a one-time code to reset.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!emailSchema.safeParse(email).success) {
              return toast.error("Enter a valid email address.");
            }
            toast.success(`Verification code sent to ${email}`);
            navigate({ to: "/otp", search: { email } });
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(allowOnlyEmailChars(e.target.value))}
              className="mt-1.5"
              placeholder="you@medicore.io"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Send verification code
          </Button>
        </form>
      </div>
    </div>
  );
}
