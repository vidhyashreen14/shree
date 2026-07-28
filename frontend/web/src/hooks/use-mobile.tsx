<<<<<<< HEAD
import * as React from "react";
=======
import * as React from 'react';
>>>>>>> a821a0c (second update)

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
<<<<<<< HEAD
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
=======
  const [isMobile, setIsMobile] = React.useState<boolean>(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );
>>>>>>> a821a0c (second update)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
<<<<<<< HEAD
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
=======
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
>>>>>>> a821a0c (second update)
  }, []);

  return !!isMobile;
}
