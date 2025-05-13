
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
  SidebarRail, // Import SidebarRail
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NotebookIcon, SparklesIcon, WrenchIcon, BeerIcon, SettingsIcon, PanelLeft } from 'lucide-react';
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
      <Sidebar collapsible="icon"> {/* Or "offcanvas" if full hide is preferred. "icon" keeps icons visible. */}
        <SidebarRail /> {/* Add rail for edge toggling on desktop */}
        <SidebarHeader className="p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <BeerIcon className="h-7 w-7 text-sidebar-primary" />
            <span className="group-data-[collapsible=icon]:hidden">BrewMate</span>
          </Link>
          {/* SidebarTrigger for collapsing to icons on desktop, if collapsible="icon" */}
           <SidebarTrigger className="hidden md:flex group-data-[collapsible=offcanvas]:hidden" />
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
          {/* Example: Settings button or user profile */}
          {/* <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-primary">
            <SettingsIcon className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Paramètres</span>
          </Button> */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
          <div className="flex items-center gap-2 md:hidden">
             <SidebarTrigger /> {/* Trigger for mobile, always shows PanelLeft */}
             <BeerIcon className="h-6 w-6 text-primary" />
             <span className="font-semibold">BrewMate</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {/* Desktop header items, e.g., user menu */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
