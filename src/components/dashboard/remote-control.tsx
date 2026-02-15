"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, Home, ArrowLeft, Power } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Gamepad } from "lucide-react";
import { useDashboardStore } from "@/store/use-dashboard-store";

export function RemoteControlWidget() {
    const { toast } = useToast();
    const { atvDeviceIp, addLog } = useDashboardStore();

    const sendKeyEvent = async (keyCode: string) => {
        if (!atvDeviceIp) {
            const msg = "Android TV IP address not set.";
            addLog({ message: `Remote control failed: ${msg}`, type: 'error' });
            toast({ title: 'Remote Failed', description: msg, variant: "destructive" });
            return;
        }

        addLog({ message: `Sending key code ${keyCode}`, type: 'info' });

        try {
            const response = await fetch('/api/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyCode, deviceIp: atvDeviceIp }),
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.details || result.error || 'Failed to send key event.');
            }
        } catch (error: any) {
            addLog({ message: `Remote key press failed: ${error.message}`, type: 'error' });
            toast({
                title: 'Remote Control Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    };
    
    // Android Key-codes
    const keyCodes = {
        UP: '19',
        DOWN: '20',
        LEFT: '21',
        RIGHT: '22',
        ENTER: '66',
        BACK: '4',
        HOME: '3',
        POWER: '26',
    };

    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-medium">Remote Control</CardTitle>
                <Gamepad className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center">
                    <div className="grid grid-cols-3 gap-2 w-48">
                        {/* Top row */}
                        <div></div>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.UP)}><ChevronUp /></Button>
                        <div></div>

                        {/* Middle row */}
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.LEFT)}><ChevronLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.ENTER)}><Circle className="h-4 w-4 fill-current" /></Button>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.RIGHT)}><ChevronRight /></Button>

                        {/* Bottom row */}
                        <div></div>
                        <Button variant="outline" size="icon" onClick={() => sendKeyEvent(keyCodes.DOWN)}><ChevronDown /></Button>
                        <div></div>
                    </div>
                </div>
                 <div className="flex justify-center gap-2 mt-4">
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.BACK)}><ArrowLeft /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.HOME)}><Home /></Button>
                    <Button variant="secondary" size="icon" onClick={() => sendKeyEvent(keyCodes.POWER)}><Power /></Button>
                </div>
            </CardContent>
        </Card>
    );
}
