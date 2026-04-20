"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { LayoutDashboard, Video, Pencil, LayoutTemplate, Tv, Terminal, AppWindow, Network } from "lucide-react";

export function NavigationSidebar() {
  const pathname = usePathname();
  
  const mainMenuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/streams", label: "Streams", icon: Video },
    { href: "/apps", label: "Apps", icon: AppWindow },
  ];

  const toolsMenuItems = [
    { href: "/terminal", label: "SSH Terminal", icon: Terminal },
    { href: "/tunnels", label: "Tunnels", icon: Network },
  ];

  const fullscreenMenuItems = [
    { href: "/fullscreen/editor", label: "Layout Editor", icon: Pencil },
    { href: "/fullscreen/view", label: "Fullscreen View", icon: LayoutTemplate },
    { href: "/fullscreen/tv-preview", label: "TV Preview", icon: Tv },
  ];

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            {toolsMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Fullscreen</SidebarGroupLabel>
            {fullscreenMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
