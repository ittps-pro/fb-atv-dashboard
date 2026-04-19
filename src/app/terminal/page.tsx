"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Terminal as TerminalIcon, Loader2, Wifi, WifiOff } from "lucide-react";
import { useDashboardStore } from '@/store/use-dashboard-store';

const sshFormSchema = z.object({
  host: z.string().min(1, "Host is required."),
  port: z.coerce.number().min(1, "Port is required.").default(22),
  username: z.string().min(1, "Username is required."),
});

type SshFormValues = z.infer<typeof sshFormSchema>;

export default function TerminalPage() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>(['$ Terminal ready. Waiting for connection...']);
  const { toast } = useToast();
  const { addLog: addDashboardLog } = useDashboardStore();

  const form = useForm<SshFormValues>({
    resolver: zodResolver(sshFormSchema),
    defaultValues: {
      host: '192.168.1.100',
      port: 22,
      username: 'root',
    },
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const onSubmit = async (data: SshFormValues) => {
    setConnectionStatus('connecting');
    addLog(`$ Attempting to connect to ${data.username}@${data.host}:${data.port}...`);
    addDashboardLog({ message: `SSH: Connecting to ${data.host}`, type: 'info' });
    setIsDialogOpen(false);

    try {
      // This is a demo API call.
      const response = await fetch('/api/ssh/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Connection failed.');
      }
      
      setConnectionStatus('connected');
      addLog(`$ ${result.message}`);
      addLog(`$ You are now connected. (This is a demo)`);
      addDashboardLog({ message: `SSH: Connected to ${data.host}`, type: 'info' });
      toast({ title: "SSH Connected", description: result.message });

    } catch (error: any) {
      setConnectionStatus('error');
      addLog(`$ Error: ${error.message}`);
      addDashboardLog({ message: `SSH: Connection failed to ${data.host}`, type: 'error' });
      toast({ title: 'Connection Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    addLog('$ Disconnected.');
    addDashboardLog({ message: 'SSH: Disconnected', type: 'info' });
  };

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="flex items-center gap-2 text-green-500"><Wifi size={16}/> Connected</div>;
      case 'connecting':
        return <div className="flex items-center gap-2 text-yellow-500"><Loader2 size={16} className="animate-spin" /> Connecting...</div>;
      case 'error':
        return <div className="flex items-center gap-2 text-red-500"><WifiOff size={16}/> Error</div>;
      default:
        return <div className="flex items-center gap-2 text-muted-foreground"><WifiOff size={16}/> Disconnected</div>;
    }
  };

  return (
    <>
      <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
      <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
        <DashboardHeader />
        <Card className="flex-grow flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <TerminalIcon />
              <CardTitle>SSH Terminal</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">{getStatusIndicator()}</div>
              {connectionStatus === 'connected' ? (
                <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Connect via SSH</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>SSH Tunnel Connection</DialogTitle>
                      <DialogDescription>
                        Enter your SSH credentials to connect. This is a demo and will not establish a real connection.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="host"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Host</FormLabel>
                              <FormControl><Input placeholder="e.g., 192.168.1.100" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="port"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Port</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl><Input placeholder="e.g., root" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={connectionStatus === 'connecting'}>
                            {connectionStatus === 'connecting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Connect
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="bg-black text-green-400 font-mono p-4 rounded-lg h-full overflow-y-auto">
              {logs.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
              {connectionStatus !== 'connecting' && <span className="animate-pulse">_</span>}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
