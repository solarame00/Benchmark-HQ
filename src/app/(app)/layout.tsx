

'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, PlusSquare, BarChart2 } from 'lucide-react';
import { AppLogo } from '@/components/icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleAddNewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Always navigate to the root page to show the form.
    const newUrl = new URL('/', window.location.origin);
    newUrl.searchParams.set('showForm', 'true');
    router.push(newUrl.toString(), { scroll: false });
  }

  const isAddActive = searchParams.get('showForm') === 'true';

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <AppLogo className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">Benchmark HQ</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="All Benchmarks" isActive={pathname === '/' && !isAddActive}>
                             <Link href="/">
                                <Home />
                                <span>All Benchmarks</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Add New" isActive={isAddActive}>
                            <a href="#" onClick={handleAddNewClick}>
                                <PlusSquare />
                                <span>Add New</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Stats" isActive={pathname === '/stats'}>
                            <Link href="/stats">
                                <BarChart2 />
                                <span>Stats</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden"/>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
