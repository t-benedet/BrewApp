
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
  useSidebar, 
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

// AppNameAndIcon component is no longer used in the sidebar header
// function AppNameAndIcon() {
//   const { state: sidebarState } = useSidebar(); 
//   const isClient = useClient();

//   if (!isClient) {
//     return ( 
//       <div className="flex items-center gap-2 text-xl font-semibold text-primary">
//         <BeerIcon className="h-7 w-7" />
//         <span>BrewMate</span>
//       </div>
//     );
//   }
  
//   return (
//     <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
//       {sidebarState === 'expanded' && <BeerIcon className="h-7 w-7 transition-opacity duration-300" />}
//       {sidebarState === 'expanded' && <span className="transition-opacity duration-300">BrewMate</span>}
//     </Link>
//   );
// }


export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isClient = useClient();

  if (!isClient) {
    // Simplified skeleton layout for SSR to avoid hydration issues
    return (
      <div className="flex min-h-svh w-full">
        {/* Skeleton Sidebar */}
        <div className="hidden md:flex flex-col w-16 bg-sidebar text-sidebar-foreground p-2 border-r border-sidebar-border">
           <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
             <Skeleton className="h-7 w-7 rounded-md" />
           </div>
           <div className="flex-grow mt-4 space-y-2">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="flex justify-center">
                  <Skeleton key={i} className="h-8 w-8 rounded-md" />
               </div>
             ))}
           </div>
         </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
            <div className="flex-none md:hidden">
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            <div className="flex-grow flex justify-center items-center">
              <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
            <div className="flex-none md:hidden" style={{ width: '1.75rem' }}></div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarRail /> 
        <SidebarHeader className="p-4 flex items-center group-data-[collapsible=icon]:justify-center justify-end">
          {/* Application name removed from here */}
          <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:mx-auto" />
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
        <SidebarFooter className="p-4">
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex-none md:hidden">
             <SidebarTrigger /> 
          </div>
          
          <div className="flex-grow flex justify-center items-center">
             <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
               <BeerIcon className="h-7 w-7" />
               <span>BrewMate</span>
             </Link>
          </div>

          <div className="flex-none md:hidden" style={{ width: '1.75rem' }}> 
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
