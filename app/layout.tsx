import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema CCB',
  description: 'Sistema de controle de voluntários e estacionamento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="bg-gray-100">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 ml-64 bg-gray-100">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
