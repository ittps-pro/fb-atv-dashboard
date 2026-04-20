"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type Storage, type StorageProtocol } from '@/types/storage';

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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info } from 'lucide-react';

const SshfsConfigSchema = z.object({
    remotePath: z.string().min(1, "Remote path is required."),
    user: z.string().min(1, "User is required."),
    host: z.string().min(1, "Host is required."),
});

const NfsConfigSchema = z.object({
    server: z.string().min(1, "Server IP or hostname is required."),
    remotePath: z.string().min(1, "Remote path is required."),
});

const CifsConfigSchema = z.object({
    server: z.string().min(1, "Server IP or hostname is required."),
    share: z.string().min(1, "Share name is required."),
    user: z.string().min(1, "Username is required."),
});

const S3ConfigSchema = z.object({
    bucket: z.string().min(1, "Bucket name is required."),
    region: z.string().min(1, "Region is required."),
    accessKeyId: z.string().min(1, "Access Key ID is required."),
});

const BaseStorageFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  protocol: z.enum(['sshfs', 'nfs', 'cifs', 's3']),
  tunnelId: z.string().optional(),
});

const DiscriminatedStorageFormSchema = z.discriminatedUnion("protocol", [
    BaseStorageFormSchema.extend({ protocol: z.literal('sshfs'), config: SshfsConfigSchema }),
    BaseStorageFormSchema.extend({ protocol: z.literal('nfs'), config: NfsConfigSchema }),
    BaseStorageFormSchema.extend({ protocol: z.literal('cifs'), config: CifsConfigSchema }),
    BaseStorageFormSchema.extend({ protocol: z.literal('s3'), config: S3ConfigSchema }),
]);

type StorageFormValues = z.infer<typeof DiscriminatedStorageFormSchema>;

interface StorageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    storageToEdit?: Storage | null;
}

export function StorageDialog({ open, onOpenChange, storageToEdit }: StorageDialogProps) {
    const { addStorage, updateStorage, addLog, tunnels } = useDashboardStore();
    const { toast } = useToast();
    const isEditing = !!storageToEdit;

    const form = useForm<StorageFormValues>({
        resolver: zodResolver(DiscriminatedStorageFormSchema),
        defaultValues: { name: "", protocol: "nfs" },
    });
    
    const watchedProtocol = form.watch("protocol");

    useEffect(() => {
        if (open) {
            if (storageToEdit) {
                form.reset(storageToEdit as any);
            } else {
                form.reset({ name: "", protocol: "nfs", config: { server: '', remotePath: '' } });
            }
        }
    }, [open, storageToEdit, form]);
    
    const onSubmit = (data: StorageFormValues) => {
        if (isEditing && storageToEdit) {
            updateStorage({ id: storageToEdit.id, ...data });
            toast({ title: 'Storage Updated', description: `${data.name} has been updated.` });
            addLog({ message: `Storage config updated: ${data.name}`, type: 'info' });
        } else {
            addStorage(data);
            toast({ title: 'Storage Added', description: `${data.name} has been added.` });
            addLog({ message: `Storage config added: ${data.name}`, type: 'info' });
        }
        onOpenChange(false);
    };

    const renderConfigFields = (protocol: StorageProtocol) => {
        switch (protocol) {
            case 'nfs':
                return (
                    <div className="space-y-4 pt-4 border-t">
                        <FormField control={form.control} name="config.server" render={({ field }) => (
                            <FormItem><FormLabel>NFS Server</FormLabel><FormControl><Input placeholder="e.g., 192.168.1.10" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.remotePath" render={({ field }) => (
                            <FormItem><FormLabel>Remote Path</FormLabel><FormControl><Input placeholder="e.g., /exports/media" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                );
             case 'cifs':
                return (
                    <div className="space-y-4 pt-4 border-t">
                        <FormField control={form.control} name="config.server" render={({ field }) => (
                            <FormItem><FormLabel>CIFS Server</FormLabel><FormControl><Input placeholder="e.g., //MYSERVER" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.share" render={({ field }) => (
                            <FormItem><FormLabel>Share Name</FormLabel><FormControl><Input placeholder="e.g., Media" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.user" render={({ field }) => (
                            <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="e.g., guest" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <p className="text-xs text-muted-foreground">Note: Password will be prompted in the terminal when mounting.</p>
                    </div>
                );
            case 'sshfs':
                return (
                    <div className="space-y-4 pt-4 border-t">
                         <FormField control={form.control} name="config.user" render={({ field }) => (
                            <FormItem><FormLabel>User</FormLabel><FormControl><Input placeholder="e.g., user" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.host" render={({ field }) => (
                            <FormItem><FormLabel>Host</FormLabel><FormControl><Input placeholder="e.g., my-remote-server.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.remotePath" render={({ field }) => (
                            <FormItem><FormLabel>Remote Path</FormLabel><FormControl><Input placeholder="e.g., /home/user/media" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                );
            case 's3':
                 return (
                    <div className="space-y-4 pt-4 border-t">
                        <FormField control={form.control} name="config.bucket" render={({ field }) => (
                            <FormItem><FormLabel>S3 Bucket Name</FormLabel><FormControl><Input placeholder="e.g., my-media-bucket" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.region" render={({ field }) => (
                            <FormItem><FormLabel>Region</FormLabel><FormControl><Input placeholder="e.g., us-east-1" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="config.accessKeyId" render={({ field }) => (
                            <FormItem><FormLabel>Access Key ID</FormLabel><FormControl><Input placeholder="Enter your AWS Access Key ID" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Alert variant="destructive"><Info className="h-4 w-4" /><AlertTitle>Security Warning</AlertTitle><AlertDescription>Never expose your Secret Access Key. You will be prompted for it in the terminal when mounting.</AlertDescription></Alert>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Storage' : 'Add New Storage'}</DialogTitle>
                    <DialogDescription>
                        Configure a remote storage mount. The actual mount command will need to be run on your server.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Storage Name</FormLabel><FormControl><Input placeholder="e.g., My NAS" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="protocol" render={({ field }) => (
                            <FormItem><FormLabel>Protocol</FormLabel>
                                <Select onValueChange={(value) => form.setValue('protocol', value as any)} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a protocol" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {(['nfs', 'cifs', 'sshfs', 's3'] as StorageProtocol[]).map((p) => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        
                        {renderConfigFields(watchedProtocol)}
                        
                        <FormField
                          control={form.control}
                          name="tunnelId"
                          render={({ field }) => (
                            <FormItem><FormLabel>Route via Tunnel (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None (Direct Connection)</SelectItem>
                                  {tunnels.map((tunnel) => (
                                    <SelectItem key={tunnel.id} value={tunnel.id}>{tunnel.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            <FormMessage /></FormItem>
                          )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
