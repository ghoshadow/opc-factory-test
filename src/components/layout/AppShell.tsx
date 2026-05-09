"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <TooltipProvider delay={0}>
      <div className="flex flex-col min-h-svh">
        <TopBar />
        <SidebarProvider defaultOpen>
          <div className="flex flex-1">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <div className="flex items-center gap-2 px-4 py-2">
                <SidebarTrigger />
              </div>
              <div className="mx-auto max-w-[1440px] px-6 pb-6">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}
