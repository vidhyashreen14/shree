import { useEffect, useState, useRef } from 'react';

interface SplashScreenProps {
  onDone?: () => void;
}

/**
 * Branded splash screen showing the actual stethoscope + heartbeat logo
 * drawing itself in the center of the page over 5 seconds.
 * Covers half the page width in the middle.
 */
export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<'visible' | 'out'>('visible');
  const onDoneRef = useRef(onDone);

  // Keep ref updated with latest callback
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Start fading out at 4.5s, signal completion at 5s
    const outTimer = setTimeout(() => setPhase('out'), 4500);
    const doneTimer = setTimeout(() => onDoneRef.current?.(), 5000);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, []); // Run exactly once on mount

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background"
      style={{
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <div className="flex w-1/2 max-w-[500px] flex-col items-center gap-8">
        {/* Brand Header */}
        <div className="text-center animate-fade-in">
          <p className="font-display text-4xl font-bold tracking-tight text-foreground">MediCore</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hospital Suite
          </p>
        </div>

        {/* Animated Stethoscope + ECG Heartbeat Logo */}
        <div className="relative w-full aspect-[200/120] flex items-center justify-center">
          <svg
            viewBox="0 0 200 120"
            className="w-full h-full text-primary"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Earpiece */}
            <circle cx="68" cy="18" r="5" fill="currentColor" className="animate-fade-in-delayed" />
            {/* Right Earpiece */}
            <circle cx="88" cy="18" r="5" fill="currentColor" className="animate-fade-in-delayed" />

            {/* Continuous path: Left ear tube -> chest piece -> ECG line -> end connector */}
            <path
              d="M68 23 Q68 40 55 50 Q55 80 78 82 Q78 88 88 88 L104 88 L110 68 L116 108 L122 58 L128 88 L144 88 L152 88"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-draw-continuous"
            />

            {/* Right ear tube -> chest piece junction */}
            <path
              d="M88 23 Q88 40 101 50 Q101 80 78 82"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              className="stroke-draw-secondary"
            />

            {/* End chestpiece ball */}
            <circle cx="161" cy="88" r="9" fill="currentColor" className="animate-fade-in-last" />
          </svg>
        </div>

        {/* Loading text below */}
        <p className="text-sm font-medium text-muted-foreground animate-pulse mt-2">
          Initializing clinical workspace…
        </p>
      </div>

      <style>{`
        /* Fade in brand text */
        .animate-fade-in {
          animation: sp-fade 0.6s ease forwards;
        }

        /* Earpieces fade in first */
        .animate-fade-in-delayed {
          opacity: 0;
          animation: sp-fade 0.4s ease 0.3s forwards;
        }

        /* Primary stethoscope tube and ECG line draw sequentially */
        .stroke-draw-continuous {
          stroke-dasharray: 450;
          stroke-dashoffset: 450;
          animation: sp-draw 3.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }

        /* Secondary earpiece tube draws next */
        .stroke-draw-secondary {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: sp-draw 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
        }

        /* Final ball fades in as line completes */
        .animate-fade-in-last {
          opacity: 0;
          animation: sp-fade 0.4s ease 3.6s forwards;
        }

        @keyframes sp-fade {
          to { opacity: 1; }
        }

        @keyframes sp-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
