import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
});

function ResetPage() {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="surface-elevated w-full max-w-md p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters with one number and a symbol.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (pwd.length < 8) return toast.error("Password too short");
            if (pwd !== confirm) return toast.error("Passwords don't match");
            toast.success("Password updated. Please sign in.");
            navigate({ to: "/login" });
          }}
        >
          <div>
            <Label htmlFor="pwd">New password</Label>
            <Input
              id="pwd"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
