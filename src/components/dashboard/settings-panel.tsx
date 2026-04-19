"use client";

import { useState, useEffect } from 'react';
import { useDashboardStore, type Device } from '@/store/use-dashboard-store';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Wifi, Plus, Pencil, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes } from '@/lib/themes';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const deviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  ip: z.string().ip({ version: "v4", message: "Please enter a valid IPv4 address." }),
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;

export function SettingsPanel() {
  const { 
    widgets, 
    toggleWidgetVisibility,
    devices,
    addDevice,
    updateDevice,
    removeDevice,
    addLog,
    theme,
    setTheme,
  } = useDashboardStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);
  const { toast } = useToast();

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: { name: "", ip: "" },
  });

  useEffect(() => {
    if (isFormOpen) {
      if (deviceToEdit) {
        form.reset({ name: deviceToEdit.name, ip: deviceToEdit.ip });
      } else {
        form.reset({ name: "", ip: "" });
      }
    }
  }, [isFormOpen, deviceToEdit, form]);

  const onSubmit = (data: DeviceFormValues) => {
    if (deviceToEdit) {
      updateDevice({ ...deviceToEdit, ...data });
      toast({ title: "Device Updated", description: `${data.name} has been updated.` });
      addLog({ message: `Device updated: ${data.name}`, type: 'info' });
    } else {
      addDevice(data);
      toast({ title: "Device Added", description: `${data.name} has been added.` });
      addLog({ message: `Device added: ${data.name}`, type: 'info' });
    }
    setIsFormOpen(false);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Visible Widgets</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(widgets).map((widgetKey) => (
                <div key={widgetKey} className="flex items-center space-x-2">
                  <Switch
                    id={widgetKey}
                    checked={widgets[widgetKey as keyof typeof widgets]}
                    onCheckedChange={() => toggleWidgetVisibility(widgetKey as keyof typeof widgets)}
                  />
                  <Label htmlFor={widgetKey} className="capitalize">{widgetKey.replace(/([A-Z])/g, ' $1')}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Theme</h3>
            <div className="space-y-2">
              <Label htmlFor="theme-select">Color Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                    {themes.map((themeOption) => (
                        <SelectItem key={themeOption.name} value={themeOption.name}>
                            {themeOption.label}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Wifi size={20} /> Device Configuration</h3>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setDeviceToEdit(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Device
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{deviceToEdit ? 'Edit Device' : 'Add New Device'}</DialogTitle>
                            <DialogDescription>
                                Enter the details for your Android TV device.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <DialogFooter>
                                    <Button type="submit">Save Device</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {devices.length > 0 ? (
                    devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                            <div>
                                <p className="font-medium">{device.name}</p>
                                <p className="text-sm text-muted-foreground">{device.ip}</p>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => { setDeviceToEdit(device); setIsFormOpen(true); }}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the device
                                        "{device.name}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeDevice(device.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No devices configured.</p>
                )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                Ensure Network/ADB debugging is enabled on your devices.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
