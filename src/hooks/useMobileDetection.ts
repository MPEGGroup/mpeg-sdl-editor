import { useEffect, useState } from "react";

export function useMobileDetection(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    // Only check on client-side, return false for SSR
    if (typeof globalThis !== "undefined" && globalThis.innerWidth !== undefined) {
      return globalThis.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    // Only run on client-side
    if (typeof globalThis === "undefined" || globalThis.innerWidth === undefined) {
      return;
    }

    const checkScreenSize = () => {
      setIsMobile(globalThis.innerWidth < breakpoint);
    };

    checkScreenSize();
    globalThis.addEventListener("resize", checkScreenSize);
    return () => globalThis.removeEventListener("resize", checkScreenSize);
  }, [breakpoint]);

  return isMobile;
}
