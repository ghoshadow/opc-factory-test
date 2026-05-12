"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-svh">
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset>
            <TopBar />
            <div className="flex items-center gap-2 px-4 py-2">
              <SidebarTrigger />
            </div>
            <div className="mx-auto max-w-[1440px] px-6 pb-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
