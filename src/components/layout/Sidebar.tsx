"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {navigation.map((section) => {
          const isSectionActive =
            pathname === section.path ||
            (pathname.startsWith(section.path) &&
              section.children?.some((child) => pathname.startsWith(child.path)));

          return (
            <SidebarGroup key={section.path}>
              <SidebarGroupLabel className={cn(isSectionActive && "text-primary font-semibold")}>
                <section.icon className="h-4 w-4 shrink-0" />
                <span>{section.label}</span>
              </SidebarGroupLabel>
              {section.children && section.children.length > 0 && (
                <SidebarMenu>
                  {section.children.map((child) => {
                    const isActive = pathname.startsWith(child.path);
                    return (
                      <SidebarMenuItem key={child.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={child.label}
                          render={<Link href={child.path} />}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span>{child.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </ShadcnSidebar>
  );
}
