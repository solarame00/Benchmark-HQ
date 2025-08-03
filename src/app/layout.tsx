import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from '@/components/ui/tooltip';
import { Roboto } from 'next/font/google';

const roboto = Roboto({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-roboto' 
});

export const metadata: Metadata = {
  title: 'Benchmark HQ',
  description: 'Centralize and automate benchmarking of competitor websites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <head />
      <body className="font-body antialiased">
        <TooltipProvider>
            {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
