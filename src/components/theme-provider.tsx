"use client";

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDashboardStore((state) => state.theme);

  useEffect(() => {
    const themeClassPrefix = 'theme-';
    
    const classList = document.documentElement.classList;

    // Remove any existing theme classes
    classList.forEach(className => {
      if (className.startsWith(themeClassPrefix)) {
        classList.remove(className);
      }
    });

    // Add the new theme class if it's not the default
    if (theme !== 'zinc') {
        classList.add(`${themeClassPrefix}${theme}`);
    }
  }, [theme]);

  return <>{children}</>;
}
