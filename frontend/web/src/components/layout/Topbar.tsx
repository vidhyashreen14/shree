import { useAuth } from "@/lib/store/auth";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const user = useAuth((s) => s.user);
  const { logoUrl, name } = useHospitalSettings();

  if (!user) return null;

  const displayLogo = logoUrl || "/logo.png";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button type="button" className="menu-btn-reset" onClick={onMenu} aria-label="Open menu">
        <div className="menu__background">
          <div className="menu__icon">
            <span />
            <span />
            <span />
          </div>
        </div>
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
    </header>
  );
}
