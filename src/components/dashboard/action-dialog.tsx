"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type DashboardAction } from '@/types/actions';

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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.discriminatedUnion("type", [
    z.object({
        name: z.string().min(1, "Action name is required"),
        type: z.literal('launch-app'),
        payload: z.object({
            packageName: z.string().min(1, "Please select an app"),
        }),
    }),
    z.object({
        name: z.string().min(1, "Action name is required"),
        type: z.literal('shell-command'),
        payload: z.object({
            command: z.string().min(1, "Please enter a shell command"),
        }),
    })
]);

type ActionFormValues = z.infer<typeof formSchema>;

interface ActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actionToEdit?: DashboardAction | null;
}

export function ActionDialog({ open, onOpenChange, actionToEdit }: ActionDialogProps) {
    const { addAction, updateAction, addLog, apps } = useDashboardStore();
    const { toast } = useToast();
    const isEditing = !!actionToEdit;

    const form = useForm<ActionFormValues>({
        resolver: zodResolver(formSchema),
    });
    
    const watchedType = form.watch("type");

    useEffect(() => {
        if (open) {
            if (actionToEdit) {
                form.reset(actionToEdit);
            } else {
                form.reset({ name: "", type: "launch-app", payload: { packageName: "" } });
            }
        }
    }, [open, actionToEdit, form]);
    
    const onSubmit = (data: ActionFormValues) => {
        if (isEditing && actionToEdit) {
            updateAction({ id: actionToEdit.id, ...data });
            toast({ title: 'Action Updated', description: `${data.name} has been updated.` });
            addLog({ message: `Action updated: ${data.name}`, type: 'info' });
        } else {
            addAction(data);
            toast({ title: 'Action Added', description: `${data.name} has been added.` });
            addLog({ message: `Action added: ${data.name}`, type: 'info' });
        }
        onOpenChange(false);
    };

    const renderPayloadFields = (type: 'launch-app' | 'shell-command' | undefined) => {
        switch (type) {
            case 'launch-app':
                return (
                    <FormField control={form.control} name="payload.packageName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Application</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an app to launch" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {apps.filter(app => !app.isHidden && app.packageName).map((app) => (
                                        <SelectItem key={app.packageName} value={app.packageName!}>{app.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                );
            case 'shell-command':
                return (
                    <FormField control={form.control} name="payload.command" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shell Command</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., reboot or dumpsys battery" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                );
            default:
                return null;
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Action' : 'Create New Action'}</DialogTitle>
                    <DialogDescription>
                        Build a reusable command to execute on your devices.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Action Name</FormLabel><FormControl><Input placeholder="e.g., Reboot Living Room TV" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Action Type</FormLabel>
                                <Select onValueChange={(value) => form.setValue('type', value as any)} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an action type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="launch-app">Launch App</SelectItem>
                                    <SelectItem value="shell-command">Shell Command</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        
                        <div className="pt-4 border-t">
                            {renderPayloadFields(watchedType)}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Action</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
