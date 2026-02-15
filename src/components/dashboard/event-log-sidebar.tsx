"use client";

import { useDashboardStore } from "@/store/use-dashboard-store";
import { SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel } from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export function EventLogSidebar() {
  const { logs } = useDashboardStore();

  return (
    <>
      <SidebarHeader>
        <h2 className="text-xl font-semibold">Event Log</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No events yet.
            </div>
          ) : (
            <div className="flex flex-col-reverse justify-end">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border-b border-sidebar-border/50">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm flex-1">{log.message}</p>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={log.type === "error" ? "destructive" : "secondary"}
                        className={cn("capitalize text-xs", {
                            "bg-yellow-400/20 text-yellow-300 border-yellow-400/30": log.type === "warning",
                            "bg-blue-400/20 text-blue-300 border-blue-400/30": log.type === "info",
                        })}
                      >
                        {log.type}
                      </Badge>
                       <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
