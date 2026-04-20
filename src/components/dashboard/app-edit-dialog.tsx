"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type AppConfig, AppConfigSchema } from '@/types/apps';
import { iconNames, iconMap } from '@/lib/lucide-icons';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '../ui/scroll-area';

const formSchema = AppConfigSchema.partial().extend({
  name: AppConfigSchema.shape.name,
  packageName: AppConfigSchema.shape.packageName,
});

interface AppEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appToEdit: AppConfig | null;
}

export function AppEditDialog({ open, onOpenChange, appToEdit }: AppEditDialogProps) {
    const { updateApp, addLog } = useDashboardStore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (appToEdit) {
            form.reset(appToEdit);
        }
    }, [appToEdit, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!appToEdit?.packageName) return;

        const appData = {
            ...appToEdit,
            ...data
        };

        await updateApp(appData);
        toast({ title: 'App Updated', description: `${data.name} has been updated.` });
        addLog({ message: `App config updated: ${data.name}`, type: 'info' });
        
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit App: {appToEdit?.name}</DialogTitle>
                    <DialogDescription>
                        Customize how this application appears on your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-2">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>App Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="group" render={({ field }) => (
                            <FormItem><FormLabel>Group</FormLabel><FormControl><Input placeholder="e.g., Media, System, Games" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="iconName" render={({ field }) => (
                            <FormItem><FormLabel>Icon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <ScrollArea className="h-72">
                                    {iconNames.map((iconName) => {
                                        const Icon = iconMap[iconName as keyof typeof iconMap];
                                        return (
                                            <SelectItem key={iconName} value={iconName}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <span>{iconName}</span>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                    </ScrollArea>
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="isHidden" render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                             <div className="space-y-0.5">
                               <FormLabel>Hide from Launcher</FormLabel>
                               <FormMessage />
                             </div>
                             <FormControl>
                               <Switch
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                               />
                             </FormControl>
                           </FormItem>
                        )} />
                        
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
