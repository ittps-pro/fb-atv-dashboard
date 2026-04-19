"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore, type Device } from '@/store/use-dashboard-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Tv, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";

const deviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  ip: z.string().ip({ version: "v4", message: "Please enter a valid IPv4 address." }),
});

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

    const { addDevice, updateDevice, addLog } = useDashboardStore();
    const { toast } = useToast();
    
    const form = useForm<DeviceFormValues>({
        resolver: zodResolver(deviceFormSchema),
        defaultValues: { name: "", ip: "" },
    });

    useEffect(() => {
        if (open) {
            if (deviceToEdit) {
                form.reset({ name: deviceToEdit.name, ip: deviceToEdit.ip });
                setCurrentStep('details');
            } else {
                form.reset({ name: "", ip: "" });
                setCurrentStep('welcome');
            }
            setTestStatus('idle');
            setErrorMessage('');
        }
    }, [open, deviceToEdit, form]);

    const handleTestConnection = async (data: DeviceFormValues) => {
        setTestStatus('loading');
        setErrorMessage('');
        addLog({ message: `Testing connection to ${data.ip}`, type: 'info' });
        try {
            const response = await fetch('/api/healthcheck/device', {
                method: 'POST',
                body: JSON.stringify({ ip: data.ip }),
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.reason || result.error || 'Failed to connect');
            }
            setTestStatus('success');
            addLog({ message: `Successfully connected to ${data.ip}`, type: 'info' });

        } catch (error: any) {
            setTestStatus('error');
            setErrorMessage(error.message);
            addLog({ message: `Connection test failed for ${data.ip}: ${error.message}`, type: 'error' });
        }
    }
    
    const onFormSubmit = async (data: DeviceFormValues) => {
        await handleTestConnection(data);
    }
    
    const onSaveDevice = () => {
        const data = form.getValues();
        if (deviceToEdit) {
            updateDevice({ ...deviceToEdit, ...data });
            toast({ title: "Device Updated", description: `${data.name} has been updated.` });
            addLog({ message: `Device updated: ${data.name}`, type: 'info' });
        } else {
            addDevice(data);
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
                        <p className="text-muted-foreground">Enter a name for your device and its local IP address.</p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Device Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Living Room TV" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>IP Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 192.168.1.100" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={testStatus === 'loading'}>
                                        {testStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                        Test Connection
                                    </Button>
                                </div>
                            </form>
                        </Form>
                        {testStatus === 'success' && (
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
                                    Please double-check the IP address. You may also need to accept the authorization prompt on your TV screen.
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
