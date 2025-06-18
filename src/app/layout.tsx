import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/hooks/useAuth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Télémédecine Sénégal',
  description: 'Plateforme de télémédecine et dossier médical partagé au Sénégal',
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
      </body>
    </html>
  );
}
