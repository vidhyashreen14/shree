import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="print:hidden">
        <Sidebar open={open} onClose={() => setOpen(false)} desktopOpen={desktopOpen} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Topbar
            onMenu={() => {
              if (window.innerWidth < 1024) {
                setOpen(!open);
              } else {
                setDesktopOpen(!desktopOpen);
              }
            }}
          />
        </div>
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          {/* Watermark — stethoscope logo in background */}
          <div
            className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <img
              src="/logo.svg"
              alt=""
              className="w-[520px] max-w-[72vw] select-none"
              style={{
                opacity: 0.2,
                filter: "var(--watermark-filter, grayscale(1) brightness(0))",
              }}
            />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
