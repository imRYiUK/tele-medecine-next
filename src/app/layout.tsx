import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/hooks/useAuth';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sunusante - Télémédecine Sénégal',
  description: 'Plateforme de télémédecine et dossier médical partagé au Sénégal',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
