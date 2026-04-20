import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { EventLogController } from '@/components/dashboard/event-log-controller';
import { ThemeProvider } from '@/components/theme-provider';
import { CommandPaletteController } from '@/components/dashboard/command-palette-controller';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Action Dashboard - Fullscreen',
  description: 'A dashboard for your TV.',
};

export default function FullscreenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <SidebarProvider>
            <div className="relative flex min-h-svh flex-1 flex-col bg-background">
              {children}
            </div>
            <EventLogController />
            <CommandPaletteController />
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
