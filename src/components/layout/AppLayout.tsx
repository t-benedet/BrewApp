"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NotebookIcon, SparklesIcon, WrenchIcon, BeerIcon } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: '/recipes', label: 'Mes recettes', icon: NotebookIcon, tooltip: 'Voir mes recettes' },
  { href: '/ai-recipes', label: 'Recettes IA', icon: SparklesIcon, tooltip: 'Générer une recette avec IA' },
  { href: '/equipment', label: 'Équipement', icon: WrenchIcon, tooltip: 'Gérer mon équipement' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarRail /> 
        <SidebarHeader className="p-4 flex items-center group-data-[collapsible=icon]:justify-center justify-end">
          {/* Application name and icon removed from here */}
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.tooltip}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          {/* Left: Mobile Sidebar Trigger */}
          <div className="flex-none md:hidden">
             <SidebarTrigger /> {/* This is a Button size="icon" className="h-7 w-7" */}
          </div>
          
          {/* Center: App Name & Icon */}
          <div className="flex-grow flex justify-center items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
              <BeerIcon className="h-7 w-7" />
              <span>BrewMate</span>
            </Link>
          </div>

          {/* Right: Spacer for mobile to balance the trigger. */}
          <div className="flex-none md:hidden" style={{ width: '1.75rem' }}> 
            {/* This invisible spacer helps center the title on mobile. Width matches SidebarTrigger (h-7 w-7). */}
          </div>
           {/* Placeholder for future desktop items on the right, e.g., User Menu. 
              If items are added here, ensure the layout remains balanced for centering the title.
          <div className="flex-none hidden md:flex justify-end items-center">
             Desktop specific items 
          </div>
          */}
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
