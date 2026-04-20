
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LayoutDashboard, Video, AppWindow, Terminal, Network, Pencil, LayoutTemplate, Tv } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const commandItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/streams", label: "Streams", icon: Video },
    { href: "/apps", label: "Apps", icon: AppWindow },
    { href: "/terminal", label: "SSH Terminal", icon: Terminal },
    { href: "/tunnels", label: "Tunnels", icon: Network },
    { href: "/fullscreen/editor", label: "Layout Editor", icon: Pencil },
    { href: "/fullscreen/view", label: "Fullscreen View", icon: LayoutTemplate },
    { href: "/fullscreen/tv-preview", label: "TV Preview", icon: Tv },
];

export function CommandPalette() {
    const { isCommandPaletteOpen, setCommandPaletteOpen } = useDashboardStore();
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (isCommandPaletteOpen) {
            setSearch('');
        }
    }, [isCommandPaletteOpen]);

    const filteredItems = commandItems.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (href: string) => {
        router.push(href);
        setCommandPaletteOpen(false);
    };

    return (
        <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
            <DialogContent className="p-0 overflow-hidden top-1/4">
                <div className="p-2 border-b">
                    <Input 
                        placeholder="Type a command or search..." 
                        className="h-10 border-0 focus-visible:ring-0 shadow-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-2">
                        <p className="text-xs text-muted-foreground px-2 pb-2">Pages</p>
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div 
                                    key={item.href}
                                    onClick={() => handleSelect(item.href)}
                                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent"
                                >
                                    <item.icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No results found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
