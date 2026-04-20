"use client";

import { useState } from 'react';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Copy, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Device } from '@/types/devices';

function CodeBlock({ command }: { command: string }) {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        toast({ title: 'Copied to clipboard' });
    };

    return (
        <div className="relative">
            <pre className="bg-secondary p-4 rounded-md text-sm font-mono overflow-x-auto">
                <code>{command}</code>
            </pre>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    );
}


function ScrcpyInstructions({ device }: { device: Device }) {
    const { tunnels } = useDashboardStore();
    const localAdbPort = 15555; // Use a high port to avoid conflicts

    if (device.connectionType === 'direct') {
        const adbConnectCmd = `adb connect ${device.ip}:${device.port || 5555}`;
        const scrcpyCmd = `scrcpy -s ${device.ip}:${device.port || 5555}`;
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Direct Connection Instructions</h3>
                <div className="space-y-2">
                    <p>1. Connect your computer to the same local network as your device.</p>
                    <p>2. Open a terminal and connect to your device with ADB:</p>
                    <CodeBlock command={adbConnectCmd} />
                    <p className="text-xs text-muted-foreground">You may need to accept the debugging connection on your TV screen.</p>
                </div>
                <div className="space-y-2">
                    <p>3. Once connected, run scrcpy:</p>
                    <CodeBlock command={scrcpyCmd} />
                </div>
            </div>
        );
    }

    if (device.connectionType === 'tunnel') {
        const tunnel = tunnels.find(t => t.id === device.tunnelId);
        if (!tunnel) {
            return <p className="text-destructive">Tunnel configuration for this device is missing.</p>
        }

        if (tunnel.protocol === 'ssh') {
             const sshPortForwardCmd = `ssh -L ${localAdbPort}:${device.ip}:${device.port || 5555} ${tunnel.config.username}@${tunnel.config.host} -p ${tunnel.config.port || 22} -N`;
             const adbConnectLocalCmd = `adb connect localhost:${localAdbPort}`;
             const scrcpyLocalCmd = `scrcpy -s localhost:${localAdbPort}`;

            return (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tunneled (SSH) Connection Instructions</h3>
                     <p className="text-sm text-muted-foreground">This method requires running commands on your local computer to create a secure tunnel and then connect scrcpy through it.</p>
                    <div className="space-y-2">
                        <p>1. Ensure the <span className="font-semibold text-primary">{tunnel.name}</span> tunnel is active and accessible.</p>
                    </div>
                    <div className="space-y-2">
                        <p>2. Open a new terminal on your computer and establish a local port forward to the device through the tunnel server:</p>
                        <CodeBlock command={sshPortForwardCmd} />
                         <p className="text-xs text-muted-foreground">This command forwards your local port {localAdbPort} to the device's ADB port via the tunnel server. Keep this terminal running.</p>
                    </div>
                    <div className="space-y-2">
                        <p>3. In a second terminal, connect ADB to your local forwarded port:</p>
                        <CodeBlock command={adbConnectLocalCmd} />
                    </div>
                     <div className="space-y-2">
                        <p>4. Once connected, run scrcpy:</p>
                        <CodeBlock command={scrcpyLocalCmd} />
                    </div>
                </div>
            )
        }

        return (
             <div className="space-y-2">
                <h3 className="font-semibold text-lg">Tunneled ({tunnel.protocol}) Connection</h3>
                <p>Ensure your computer is connected to the tunnel. You will need to manually configure your system to route ADB traffic through the active tunnel to reach the device at <span className="font-mono bg-secondary p-1 rounded-md">{device.ip}</span>.</p>
            </div>
        )
    }
    
    if (device.connectionType === 'reverse-tunnel') {
        const adbConnectCmd = `adb connect ${device.ip}:${device.port || 5555}`;
        const scrcpyCmd = `scrcpy -s ${device.ip}:${device.port || 5555}`;
         return (
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reverse Tunnel Connection</h3>
                 <p className="text-sm text-muted-foreground">For this method, the device initiates the connection to the dashboard server.</p>
                <div className="space-y-2">
                    <p>1. Follow the reverse tunnel setup instructions on the device settings page to establish the connection.</p>
                </div>
                 <div className="space-y-2">
                    <p>2. On the server where the dashboard is running, open a terminal and connect ADB to the local forwarded port:</p>
                    <CodeBlock command={adbConnectCmd} />
                </div>
                <div className="space-y-2">
                    <p>3. Run scrcpy from the server's terminal:</p>
                    <CodeBlock command={scrcpyCmd} />
                     <p className="text-xs text-muted-foreground">Note: With this method, the scrcpy window will open on the server, not your local computer.</p>
                </div>
            </div>
        );
    }

    return <p>Unsupported connection type.</p>;
}


export default function ScreenMirrorPage() {
    const { devices, activeDeviceId, setActiveDeviceId } = useDashboardStore();
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(activeDeviceId ?? undefined);

    const selectedDevice = devices.find(d => d.id === selectedDeviceId);
    
    const handleDeviceChange = (id: string) => {
        setSelectedDeviceId(id);
        // Also update the global active device if desired
        setActiveDeviceId(id);
    }

    return (
        <>
            <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 dark:bg-[radial-gradient(hsl(var(--accent))_0.5px,transparent_0.5px)]"></div>
            <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
                <DashboardHeader />
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Smartphone /> Screen Mirroring with Scrcpy
                        </CardTitle>
                        <CardDescription>
                            Generate the commands needed to mirror your Android device's screen to your computer using scrcpy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                           <Terminal className="h-4 w-4" />
                           <AlertTitle>Prerequisites</AlertTitle>
                           <AlertDescription>
                             You must have <a href="https://developer.android.com/studio/command-line/adb" target="_blank" rel="noopener noreferrer" className="underline font-semibold">ADB</a> and <a href="https://github.com/Genymobile/scrcpy" target="_blank" rel="noopener noreferrer" className="underline font-semibold">scrcpy</a> installed on your local computer.
                           </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                             <h3 className="text-lg font-semibold">Select Device</h3>
                            <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
                                <SelectTrigger className="w-full md:w-[300px]">
                                    <SelectValue placeholder="Select a device to see instructions" />
                                </SelectTrigger>
                                <SelectContent>
                                    {devices.length > 0 ? devices.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    )) : <div className="p-2 text-sm text-muted-foreground">No devices configured.</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {selectedDevice ? (
                             <div className="p-4 border rounded-lg">
                                <ScrcpyInstructions device={selectedDevice} />
                            </div>
                        ) : (
                             <div className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg">
                                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Select a device to view connection instructions.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
