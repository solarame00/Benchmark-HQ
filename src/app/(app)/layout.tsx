

'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, PlusSquare, BarChart2 } from 'lucide-react';
import { AppLogo } from '@/components/icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, createContext, useContext, useMemo } from 'react';
import type { Benchmark } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BenchmarkTable } from '@/components/benchmark-table';

type BenchmarkContextType = {
  viewingBenchmark: Benchmark | null;
  setViewingBenchmark: (benchmark: Benchmark | null) => void;
  handleEdit: (benchmark: Benchmark) => void;
  handleClone: (benchmark: Benchmark) => void;
  handleDelete: (id: string, callback?: () => void) => void;
};

const BenchmarkContext = createContext<BenchmarkContextType | null>(null);

export const useBenchmarkContext = () => {
    const context = useContext(BenchmarkContext);
    if (!context) {
        throw new Error('useBenchmarkContext must be used within a BenchmarkProvider');
    }
    return context;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewingBenchmark, setViewingBenchmark] = useState<Benchmark | null>(null);
  
  const updateURL = (params: Record<string, string | null | undefined>) => {
    const current = new URL(window.location.href);
    for(const key in params) {
        const value = params[key];
        if (value) {
            current.searchParams.set(key, value);
        } else {
            current.searchParams.delete(key);
        }
    }
    router.push(current.toString(), { scroll: false });
  };
  
  const handleAddNewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setViewingBenchmark(null); // Close sheet if open
    const newUrl = new URL('/', window.location.origin);
    newUrl.searchParams.set('showForm', 'true');
    router.push(newUrl.toString(), { scroll: false });
  }

  const isAddActive = searchParams.get('showForm') === 'true';

  const handleEdit = (benchmark: Benchmark) => {
    // This will be handled inside DashboardClient, which has the form logic
    // We pass it through context so other pages can trigger it if needed.
    // The DashboardClient will then set its own editing state.
    setViewingBenchmark(null);
    updateURL({ showForm: 'true', editId: benchmark.id });
  }

  const handleClone = (benchmark: Benchmark) => {
    setViewingBenchmark(null);
    updateURL({ showForm: 'true', cloneId: benchmark.id });
  };
  
  const handleDelete = async (id: string) => {
    // Deletion logic will be handled by the page that owns the benchmark data.
    // This is just a placeholder to show the concept. The actual delete call
    // should happen in DashboardClient.
    console.log("Delete triggered from layout context for:", id);
    setViewingBenchmark(null);
  };
  
  const contextValue = useMemo(() => ({
    viewingBenchmark,
    setViewingBenchmark,
    handleEdit,
    handleClone,
    handleDelete,
  }), [viewingBenchmark]);

  return (
    <BenchmarkContext.Provider value={contextValue}>
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
                                <a href="/?showForm=true" onClick={handleAddNewClick}>
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

        {viewingBenchmark && (
            <Sheet open={!!viewingBenchmark} onOpenChange={(isOpen) => !isOpen && setViewingBenchmark(null)}>
                <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                    <SheetHeader className="mb-6 text-left">
                        <SheetTitle>Benchmark Details</SheetTitle>
                        <a href={viewingBenchmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">{viewingBenchmark.url}</a>
                    </SheetHeader>
                    <BenchmarkTable
                        benchmarks={[viewingBenchmark]}
                        onEdit={(b) => { handleEdit(b); }}
                        onClone={(b) => { handleClone(b); }}
                        onDelete={(id) => { handleDelete(id); }}
                        isDetailsView={true}
                    />
                </SheetContent>
            </Sheet>
        )}
    </BenchmarkContext.Provider>
  );
}
