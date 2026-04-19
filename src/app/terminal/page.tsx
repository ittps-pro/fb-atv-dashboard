import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal as TerminalIcon } from "lucide-react";

export default function TerminalPage() {
  return (
    <>
      <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
      <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
        <DashboardHeader />
        <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <TerminalIcon />
                <CardTitle>SSH Terminal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-black text-green-400 font-mono p-4 rounded-lg h-96 overflow-y-auto">
                    <p>$ This is a placeholder for the SSH terminal.</p>
                    <p>$ Full implementation with xterm.js and a WebSocket backend is required.</p>
                    <span className="animate-pulse">_</span>
                </div>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
