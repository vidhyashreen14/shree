import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex min-h-screen w-full bg-background text-foreground">
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar onMenu={() => setOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
