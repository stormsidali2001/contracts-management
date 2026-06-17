import '@/styles/globals.css';
import RootProvider from '@/providers/root-provider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ContractFlow',
  description:
    'Track contracts, monitor execution status, and get automatic alerts before any deadline expires.',
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
