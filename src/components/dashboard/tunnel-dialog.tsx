"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore, type Tunnel, TunnelSchema, type TunnelProtocol } from '@/store/use-dashboard-store';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";

// Define schemas for each protocol's config
const SshConfigSchema = z.object({
    host: z.string().min(1, "Host is required."),
    port: z.coerce.number().min(1).max(65535).default(22),
    username: z.string().min(1, "Username is required."),
});

// A base schema for the form
const BaseTunnelFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  protocol: TunnelSchema.shape.protocol,
});

// Use discriminated union for protocol-specific configs
const DiscriminatedTunnelFormSchema = z.discriminatedUnion("protocol", [
    BaseTunnelFormSchema.extend({ protocol: z.literal('ssh'), config: SshConfigSchema }),
    BaseTunnelFormSchema.extend({ protocol: z.literal('wireguard'), config: z.object({}).optional() }),
    BaseTunnelFormSchema.extend({ protocol: z.literal('openvpn'), config: z.object({}).optional() }),
    BaseTunnelFormSchema.extend({ protocol: z.literal('vless'), config: z.object({}).optional() }),
    BaseTunnelFormSchema.extend({ protocol: z.literal('sstp'), config: z.object({}).optional() }),
    BaseTunnelFormSchema.extend({ protocol: z.literal('openconnect'), config: z.object({}).optional() }),
]);

type TunnelFormValues = z.infer<typeof DiscriminatedTunnelFormSchema>;

interface TunnelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tunnelToEdit?: Tunnel | null;
}

export function TunnelDialog({ open, onOpenChange, tunnelToEdit }: TunnelDialogProps) {
    const { addTunnel, updateTunnel, addLog } = useDashboardStore();
    const { toast } = useToast();
    const isEditing = !!tunnelToEdit;

    const form = useForm<TunnelFormValues>({
        resolver: zodResolver(DiscriminatedTunnelFormSchema),
        defaultValues: isEditing ? tunnelToEdit : { name: "", protocol: "ssh", config: { host: '', port: 22, username: '' } },
    });
    
    const watchedProtocol = form.watch("protocol");

    useEffect(() => {
        if (open) {
            if (tunnelToEdit) {
                form.reset(tunnelToEdit as TunnelFormValues);
            } else {
                form.reset({ name: "", protocol: "ssh", config: { host: '', port: 22, username: '' } });
            }
        }
    }, [open, tunnelToEdit, form]);
    
    const onSubmit = (data: TunnelFormValues) => {
        if (isEditing && tunnelToEdit) {
            updateTunnel({ id: tunnelToEdit.id, ...data });
            toast({ title: 'Tunnel Updated', description: `${data.name} has been updated.` });
            addLog({ message: `Tunnel updated: ${data.name}`, type: 'info' });
        } else {
            addTunnel(data);
            toast({ title: 'Tunnel Added', description: `${data.name} has been added.` });
            addLog({ message: `Tunnel added: ${data.name}`, type: 'info' });
        }
        onOpenChange(false);
    };

    const renderConfigFields = (protocol: TunnelProtocol) => {
        switch (protocol) {
            case 'ssh':
                return (
                    <div className="space-y-4 pt-4 border-t">
                        <FormField control={form.control} name="config.host" render={({ field }) => (
                            <FormItem><FormLabel>Host</FormLabel><FormControl><Input placeholder="e.g., 192.168.1.50" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.port" render={({ field }) => (
                            <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.username" render={({ field }) => (
                            <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="e.g., dev" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                );
            case 'wireguard':
            case 'openvpn':
            case 'vless':
            case 'sstp':
            case 'openconnect':
                return <p className="text-sm text-muted-foreground pt-4 border-t mt-4">Configuration for {protocol.toUpperCase()} is not yet implemented in this demo.</p>;
            default:
                return null;
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Tunnel' : 'Add New Tunnel'}</DialogTitle>
                    <DialogDescription>
                        Configure your secure tunnel connection.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Tunnel Name</FormLabel><FormControl><Input placeholder="e.g., My Home Server" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="protocol" render={({ field }) => (
                            <FormItem><FormLabel>Protocol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a protocol" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {TunnelSchema.shape.protocol.options.map((p: string) => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        
                        {renderConfigFields(watchedProtocol)}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Tunnel</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
