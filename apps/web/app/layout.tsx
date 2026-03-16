import '@/styles/globals.css';
import RootProvider from '@/providers/root-provider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contracts Management',
  description: 'Application for managing contracts and agreements',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
