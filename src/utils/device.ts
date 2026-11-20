import { useState, useEffect } from 'react';

/**
 * Detects whether the current device/viewport is a mobile phone or small tablet.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );
  const isSmallScreen =
    typeof window.innerWidth === 'number' && window.innerWidth > 0 && window.innerWidth < 768;
  return isMobileUA || isSmallScreen;
}

/**
 * React hook to listen for screen resize and device changes.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
