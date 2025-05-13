
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
  // useSidebar, // Not directly used in AppLayout logic itself
} from '@/components/ui/sidebar';
import { NotebookIcon, SparklesIcon, WrenchIcon, BeerIcon } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { useClient } from '@/hooks/use-client';
import { Skeleton } from '@/components/ui/skeleton';

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
  const isClient = useClient();

  if (!isClient) {
    // Simplified skeleton layout for SSR to avoid hydration issues
    // This skeleton represents the collapsed state of the sidebar (w-16)
    return (
      <div className="flex min-h-svh w-full">
        {/* Skeleton Sidebar */}
        <div className="hidden md:flex flex-col w-16 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
           {/* Skeleton Sidebar Header */}
           <div className="flex items-center justify-center border-b border-sidebar-border p-2.5">
             {/* Intentionally empty or could have a placeholder for a collapsed header item */}
           </div>
           {/* Skeleton Sidebar Menu */}
           <div className="flex-grow mt-4 space-y-2 px-2.5"> {/* Added px-2.5 to align with p-2.5 of header/footer */}
             {navItems.map((_, i) => (
               <div key={i} className="flex justify-center">
                  <Skeleton key={i} className="h-8 w-8 rounded-md" />
               </div>
             ))}
           </div>
           {/* Skeleton Sidebar Footer */}
           <div className="mt-auto flex items-center justify-center border-t border-sidebar-border p-2.5">
            <Skeleton className="h-7 w-7 rounded-md" />
           </div>
         </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
            <div className="flex-none md:hidden"> {/* For mobile: SidebarTrigger placeholder */}
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            
            <div className="flex-grow flex justify-center items-center"> {/* App Name Centered */}
               <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
                 <BeerIcon className="h-7 w-7" />
                 <span>BrewMate</span>
               </Link>
            </div>

            <div className="flex-none md:hidden" style={{ width: '28px' }}>  {/* Ensure width matches trigger h-7 w-7 */}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    );
  }

  // This is the full client-side rendered layout
  return (
    <SidebarProvider defaultOpen> {/* defaultOpen is true, meaning sidebar is initially expanded on client if not mobile */}
      <Sidebar collapsible="icon"> {/* collapsible="icon" allows collapsing to icon-only view */}
        <SidebarRail /> 
        <SidebarHeader 
          className="flex items-center justify-start border-b border-sidebar-border p-4 group-data-[collapsible=icon]:p-2.5 group-data-[collapsible=icon]:justify-center"
        >
          {/* App Logo/Name is not here */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.tooltip}
                    className="justify-start group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter 
          className="border-t border-sidebar-border flex justify-end p-4 group-data-[collapsible=icon]:p-2.5 group-data-[collapsible=icon]:justify-center"
        >
           <SidebarTrigger className="hidden md:flex" /> {/* Removed group-data-[collapsible=icon]:mx-auto */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex-none md:hidden"> {/* Mobile: SidebarTrigger for off-canvas menu */}
             <SidebarTrigger /> 
          </div>
          
          <div className="flex-grow flex justify-center items-center"> {/* App Name Centered */}
             <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
               <BeerIcon className="h-7 w-7" />
               <span>BrewMate</span>
             </Link>
          </div>

          <div className="flex-none md:hidden" style={{ width: '28px' }}> {/* Ensure width matches trigger h-7 w-7 */}
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

