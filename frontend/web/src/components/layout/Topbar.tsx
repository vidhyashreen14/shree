import { Bell, Menu, Moon, Search, Sun, LogOut, Settings, UserCog } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { useNotifications } from "@/lib/store/notifications";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
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
    const { logoUrl, name } = useHospitalSettings();
    const [openPalette, setOpenPalette] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOpenPalette(true);
    };

    if (!user) return null;

    const displayLogo = logoUrl || "/logo.png";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent"
                onClick={onMenu}
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Logo + App Name */}
            <div className="flex items-center gap-2 max-w-[200px]" title={name}>
                <span className="grid h-9 w-9 place-items-center rounded-xl overflow-hidden shadow-sm bg-primary/10 shrink-0">
                    <img src={displayLogo} alt={`${name} Logo`} className="h-9 w-9 object-contain p-0.5" />
                </span>
                <div className="flex flex-col leading-tight hidden sm:flex min-w-0">
                    <span className="font-bold text-sm tracking-tight truncate">{name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">Hospital Suite</span>
                </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="morph-search-wrapper hidden sm:flex">
                    <button type="submit" className="morph-search-icon">
                        <Search className="h-4 w-4 shrink-0" />
                    </button>
                    <input
                        placeholder="Search workspace…"
                        className="morph-search-input"
                        name="text"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

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
            </div>

            <CommandPalette open={openPalette} onOpenChange={setOpenPalette} />
        </header>
    );
}
