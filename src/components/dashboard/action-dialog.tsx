"use client";

import { useEffect, useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { iconMap, IconName } from '@/lib/lucide-icons';


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
    const { addAction, updateAction, addLog, apps, fetchApps } = useDashboardStore();
    const { toast } = useToast();
    const isEditing = !!actionToEdit;
    const [popoverOpen, setPopoverOpen] = useState(false);

    const form = useForm<ActionFormValues>({
        resolver: zodResolver(formSchema),
    });
    
    const watchedType = form.watch("type");

    useEffect(() => {
        if(open) {
            fetchApps(); // Ensure we have the latest apps
        }
    }, [open, fetchApps]);

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
                    <FormField
                      control={form.control}
                      name="payload.packageName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Application</FormLabel>
                          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? apps.find((app) => app.packageName === field.value)?.name
                                    : "Select an app to launch"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search app..." />
                                <CommandEmpty>No app found.</CommandEmpty>
                                <CommandList>
                                <CommandGroup>
                                  {apps.filter(app => !app.isHidden && app.packageName).map((app) => {
                                      const Icon = iconMap[app.iconName as IconName] || iconMap['AppWindow'];
                                      return (
                                        <CommandItem
                                            value={app.name}
                                            key={app.packageName}
                                            onSelect={() => {
                                                form.setValue("payload.packageName", app.packageName!);
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === app.packageName ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{app.name}</span>
                                                    <span className="text-xs text-muted-foreground">{app.packageName}</span>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
