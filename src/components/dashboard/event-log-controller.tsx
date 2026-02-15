'use client';

import { useDashboardStore } from "@/store/use-dashboard-store";
import { Sheet, SheetContent } from "../ui/sheet";
import { EventLogSidebar } from "./event-log-sidebar";

export function EventLogController() {
    const { eventLogOpen, setEventLogOpen } = useDashboardStore();

    return (
        <Sheet open={eventLogOpen} onOpenChange={setEventLogOpen}>
            <SheetContent className="w-[380px] sm:w-[500px] overflow-y-auto">
                <EventLogSidebar />
            </SheetContent>
        </Sheet>
    )
}
