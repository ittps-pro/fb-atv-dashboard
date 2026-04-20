
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { CommandPalette } from './command-palette';

export function CommandPaletteController() {
    const { toggleCommandPalette } = useDashboardStore();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleCommandPalette();
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [toggleCommandPalette]);

    return <CommandPalette />;
}
