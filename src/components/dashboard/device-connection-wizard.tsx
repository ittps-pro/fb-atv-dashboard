"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type Device, DeviceConnectionTypeSchema } from '@/types/devices';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Tv, ShieldCheck, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Label } from '../ui/label';

// Base schema for common fields
const baseDeviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  connectionType: DeviceConnectionTypeSchema,
});

// Discriminated union for protocol-specific configs
const deviceFormSchema = z.discriminatedUnion("connectionType", [
  baseDeviceFormSchema.extend({
    connectionType: z.literal('direct'),
    ip: z.string().ip({ version: "v4", message: "Please enter a valid IPv4 address." }),
    port: z.coerce.number().min(1).max(65535).default(5555),
  }),
  baseDeviceFormSchema.extend({
    connectionType: z.literal('tunnel'),
    tunnelId: z.string({ required_error: "Please select a tunnel." }),
  }),
  baseDeviceFormSchema.extend({
    connectionType: z.literal('reverse-tunnel'),
  }),
]);


type DeviceFormValues = z.infer<typeof deviceFormSchema>;

type WizardStep = 'welcome' | 'details' | 'success';

interface DeviceConnectionWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deviceToEdit?: Device | null;
}

export function DeviceConnectionWizard({ open, onOpenChange, deviceToEdit }: DeviceConnectionWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const { addDevice, updateDevice, addLog, tunnels } = useDashboardStore();
    const { toast } = useToast();
    
    const form = useForm<DeviceFormValues>({
        resolver: zodResolver(deviceFormSchema),
        defaultValues: { name: "", connectionType: "direct", ip: "", port: 5555 },
    });

    const watchedConnectionType = form.watch("connectionType");

    useEffect(() => {
        if (open) {
            if (deviceToEdit) {
                const defaultValues: any = { ...deviceToEdit };
                if (deviceToEdit.connectionType === 'direct' && !deviceToEdit.port) {
                    defaultValues.port = 5555;
                }
                form.reset(defaultValues);
                setCurrentStep('details');
            } else {
                form.reset({ name: "", connectionType: "direct", ip: "", port: 5555 });
                setCurrentStep('welcome');
            }
            setTestStatus('idle');
            setErrorMessage('');
        }
    }, [open, deviceToEdit, form]);

    const handleTestConnection = async (data: DeviceFormValues) => {
        if (data.connectionType !== 'direct') {
            setTestStatus('success'); // Skip test for non-direct connections for this demo
            return;
        }

        setTestStatus('loading');
        setErrorMessage('');
        
        let ipToTest = data.ip;

        addLog({ message: `Testing connection to ${ipToTest}:${data.port}`, type: 'info' });
        try {
            const response = await fetch('/api/healthcheck/device', {
                method: 'POST',
                body: JSON.stringify({ ip: ipToTest, port: data.port }),
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.reason || result.error || 'Failed to connect');
            }
            setTestStatus('success');
            addLog({ message: `Successfully connected to ${ipToTest}:${data.port}`, type: 'info' });

        } catch (error: any) {
            setTestStatus('error');
            setErrorMessage(error.message);
            addLog({ message: `Connection test failed for ${ipToTest}: ${error.message}`, type: 'error' });
        }
    }
    
    const onFormSubmit = async (data: DeviceFormValues) => {
        await handleTestConnection(data);
    }
    
    const onSaveDevice = async () => {
        const data = form.getValues();
        let deviceData: Omit<Device, 'id'> = {
            name: data.name,
            connectionType: data.connectionType,
            ip: '', // Default value
            tunnelId: undefined,
            port: undefined,
        };
    
        if (data.connectionType === 'direct') {
            deviceData.ip = data.ip;
            deviceData.port = data.port;
        } else if (data.connectionType === 'tunnel') {
            const selectedTunnel = tunnels.find(t => t.id === data.tunnelId);
            deviceData.tunnelId = data.tunnelId;
            deviceData.ip = selectedTunnel?.config?.host || 'Tunneled';
        } else if (data.connectionType === 'reverse-tunnel') {
            deviceData.ip = 'localhost';
            deviceData.port = 5555; // Example port
        }
    
        if (deviceToEdit) {
            await updateDevice({ id: deviceToEdit.id, ...deviceData });
            toast({ title: "Device Updated", description: `${data.name} has been updated.` });
            addLog({ message: `Device updated: ${data.name}`, type: 'info' });
        } else {
            await addDevice(deviceData as Omit<Device, 'id'>);
            toast({ title: "Device Added", description: `${data.name} has been added.` });
            addLog({ message: `Device added: ${data.name}`, type: 'info' });
        }
        setCurrentStep('success');
    }

    const renderStepContent = () => {
        switch(currentStep) {
            case 'welcome':
                return (
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <Tv className="h-16 w-16 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold">Connect a New Device</h2>
                        <p className="text-muted-foreground">This wizard will guide you through connecting a new Android TV device to your dashboard.</p>
                        <p className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg">
                            <strong>Before you begin:</strong> Please ensure you have enabled "Developer options" and then turned on "Network debugging" on your Android TV device.
                        </p>
                        <Button onClick={() => setCurrentStep('details')}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            case 'details':
                return (
                    <div className="space-y-4">
                         <h2 className="text-2xl font-semibold">Device Details</h2>
                        <p className="text-muted-foreground">Enter a name for your device and its connection details.</p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Device Name</FormLabel><FormControl><Input placeholder="e.g., Living Room TV" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />

                                <FormField control={form.control} name="connectionType" render={({ field }) => (
                                    <FormItem className="space-y-3"><FormLabel>Connection Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="direct" /></FormControl>
                                                    <FormLabel className="font-normal">Direct (Local Network)</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="tunnel" /></FormControl>
                                                    <FormLabel className="font-normal">Tunnel</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="reverse-tunnel" /></FormControl>
                                                    <FormLabel className="font-normal">Reverse Tunnel</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    <FormMessage /></FormItem>
                                )} />

                                {watchedConnectionType === 'direct' && (
                                     <>
                                        <FormField control={form.control} name="ip" render={({ field }) => (
                                            <FormItem><FormLabel>IP Address</FormLabel><FormControl><Input placeholder="e.g., 192.168.1.100" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="port" render={({ field }) => (
                                            <FormItem><FormLabel>ADB Port</FormLabel><FormControl><Input type="number" placeholder="5555" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </>
                                )}

                                {watchedConnectionType === 'tunnel' && (
                                    <FormField control={form.control} name="tunnelId" render={({ field }) => (
                                        <FormItem><FormLabel>Select Tunnel</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a configured tunnel" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {tunnels.map((tunnel) => <SelectItem key={tunnel.id} value={tunnel.id}>{tunnel.name} ({tunnel.protocol})</SelectItem>)}
                                                    {tunnels.length === 0 && <div className="p-2 text-sm text-muted-foreground">No tunnels configured.</div>}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage /></FormItem>
                                    )} />
                                )}
                                
                                {watchedConnectionType === 'reverse-tunnel' && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold text-lg flex items-center gap-2"><Info className="h-5 w-5 text-accent"/>Reverse Tunnel Setup</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Run a command on your remote device to create a secure connection back to this dashboard server. This is ideal for devices behind a firewall.
                                        </p>
                                        <div className="space-y-2">
                                            <Label>1. Generate an SSH key on your device</Label>
                                            <pre className="bg-secondary p-2 rounded-md text-xs overflow-x-auto"><code>ssh-keygen -t ed25519 -f ~/.ssh/dashboard_key</code></pre>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>2. Add public key to this server</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Copy the content of `~/.ssh/dashboard_key.pub` from your device and add it to the `~/.ssh/authorized_keys` file on this server.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>3. Run the reverse tunnel command</Label>
                                            <pre className="bg-secondary p-2 rounded-md text-xs overflow-x-auto"><code>ssh -N -R 5555:localhost:5555 user@your-dashboard-server-ip -i ~/.ssh/dashboard_key</code></pre>
                                            <p className="text-xs text-muted-foreground">This command forwards the remote device's ADB port (5555) to this server's port 5555.</p>
                                        </div>
                                    </div>
                                )}


                                <div className="flex justify-end">
                                    {watchedConnectionType === 'direct' ? (
                                        <Button type="submit" disabled={testStatus === 'loading'}>
                                            {testStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                            Test Connection
                                        </Button>
                                    ) : (
                                        <Button onClick={onSaveDevice}>
                                            Save Device
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                        {testStatus === 'success' && watchedConnectionType === 'direct' && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center space-y-3">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                                <p className="font-semibold text-green-400">Connection Successful!</p>
                                <Button onClick={onSaveDevice}>Save Device</Button>
                            </div>
                        )}
                        {testStatus === 'error' && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center space-y-3">
                                <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
                                <p className="font-semibold text-destructive">Connection Failed</p>
                                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                                <p className="text-xs text-muted-foreground pt-2">
                                    Please double-check the IP and Port. You may also need to accept the authorization prompt on your TV screen.
                                </p>
                                <Button variant="outline" onClick={() => handleTestConnection(form.getValues())} disabled={testStatus === 'loading'}>
                                    {testStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Retry Test
                                </Button>
                            </div>
                        )}
                    </div>
                );
             case 'success':
                 return (
                     <div className="space-y-4 text-center">
                         <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                         <h2 className="text-2xl font-semibold">{deviceToEdit ? 'Device Updated' : 'Device Added Successfully!'}</h2>
                         <p className="text-muted-foreground">Your device is now configured and ready to use.</p>
                         <Button onClick={() => onOpenChange(false)}>
                             Finish
                         </Button>
                     </div>
                 )
            default:
                return null;
        }
    }


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[450px] sm:max-w-lg">
                <SheetHeader className="mb-6">
                    <SheetTitle>{deviceToEdit ? 'Edit Device' : 'New Device Wizard'}</SheetTitle>
                    <SheetDescription>
                        Follow the steps to connect a new Android TV device.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-8">
                     {renderStepContent()}
                </div>
            </SheetContent>
        </Sheet>
    );
}
