import { Bell, Menu, Moon, Search, Sun, LogOut, Settings, UserCog } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { useNotifications } from "@/lib/store/notifications";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ onMenu }: { onMenu: () => void }) {
    const user = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const unread = useNotifications((s) => s.notifications.filter((n: any) => !n.read).length);
    const [openPalette, setOpenPalette] = useState(false);

    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
                onClick={onMenu}
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            <button
                type="button"
                onClick={() => setOpenPalette(true)}
                className="hidden h-10 flex-1 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex sm:max-w-md"
            >
                <Search className="h-4 w-4" />
                <span>Search patients, doctors, medicines…</span>
                <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ⌘K
                </kbd>
            </button>
            <div className="flex-1 sm:hidden" />

            <button
                type="button"
                onClick={() => setOpenPalette(true)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent sm:hidden"
                aria-label="Search"
            >
                <Search className="h-5 w-5" />
            </button>

            <button
                type="button"
                onClick={toggleTheme}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent"
                aria-label="Toggle theme"
            >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
                type="button"
                onClick={() => navigate({ to: "/notifications" })}
                className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {unread}
                    </span>
                )}
            </button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-full p-1 hover:bg-accent"
                        aria-label="Account menu"
                    >
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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
                        <Settings className="mr-2 h-4 w-4" />
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

            <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
        </header>
    );
}
