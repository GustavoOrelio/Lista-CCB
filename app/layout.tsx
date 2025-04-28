import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/app/components/ui/sonner";
import { Providers } from './components/Providers';
import { AuthLayout } from './components/AuthLayout';

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
        <Providers>
          <AuthLayout>
            {children}
          </AuthLayout>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
