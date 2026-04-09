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
} from "@/components/ui/sidebar";
import { LayoutDashboard, Video, Pencil, LayoutTemplate, Tv } from "lucide-react";

export function NavigationSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/streams", label: "Streams", icon: Video },
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
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
          {fullscreenMenuItems.map((item) => (
             <SidebarMenuItem key={item.href}>
               <Link href={item.href} passHref legacyBehavior>
                 <SidebarMenuButton
                   asChild
                   isActive={pathname === item.href}
                   tooltip={item.label}
                 >
                   <a>
                     <item.icon />
                     <span>{item.label}</span>
                   </a>
                 </SidebarMenuButton>
               </Link>
             </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
