
'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, PlusSquare } from 'lucide-react';
import { AppLogo } from '@/components/icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleAllBenchmarksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const current = new URL(window.location.href);
    current.searchParams.delete('showForm');
    router.push(current.pathname, { scroll: false });
    // We also need to force a re-render or state update on the page
    // The most reliable way is to ensure the page component's useEffect logic handles this.
    // The change in URL should be sufficient, but we make it explicit here.
    window.dispatchEvent(new PopStateEvent('popstate'));
    router.push('/');
  };


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
                        <SidebarMenuButton asChild tooltip="All Benchmarks">
                             <Link href="/" onClick={handleAllBenchmarksClick}>
                                <Home />
                                <span>All Benchmarks</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Add New">
                            <Link href="/?showForm=true" scroll={false}>
                                <PlusSquare />
                                <span>Add New</span>
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
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
