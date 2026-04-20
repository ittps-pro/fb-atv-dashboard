"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboardStore } from '@/store/use-dashboard-store';
import { type Stream, StreamSchema } from '@/types/streams';

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
import { useToast } from "@/hooks/use-toast";

const formSchema = StreamSchema.omit({ id: true });

interface StreamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    streamToEdit?: Stream | null;
}

export function StreamDialog({ open, onOpenChange, streamToEdit }: StreamDialogProps) {
    const { addStream, updateStream, addLog } = useDashboardStore();
    const { toast } = useToast();
    const isEditing = !!streamToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", url: "", category: "VOD" },
    });

    useEffect(() => {
        if (open) {
            if (streamToEdit) {
                form.reset(streamToEdit);
            } else {
                form.reset({ name: "", url: "", category: "VOD" });
            }
        }
    }, [open, streamToEdit, form]);

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        if (isEditing && streamToEdit) {
            updateStream({ id: streamToEdit.id, ...data });
            toast({ title: 'Stream Updated', description: `${data.name} has been updated.` });
            addLog({ message: `Stream updated: ${data.name}`, type: 'info' });
        } else {
            addStream(data);
            toast({ title: 'Stream Added', description: `${data.name} has been added.` });
            addLog({ message: `Stream added: ${data.name}`, type: 'info' });
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Stream' : 'Add New Stream'}</DialogTitle>
                    <DialogDescription>
                        Enter the details for your video stream.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Stream Name</FormLabel><FormControl><Input placeholder="e.g., My Awesome Stream" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="url" render={({ field }) => (
                            <FormItem><FormLabel>Stream URL</FormLabel><FormControl><Input placeholder="https://example.com/stream.m3u8" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Live TV, VOD" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Stream</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
