import type { Metadata, Viewport } from "next"
import ClientLayout from '@/components/ClientLayout'

import '../styles/global.scss'
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
//   maximumScale: 1,
//   userScalable: 1,
}

export const metadata: Metadata = {
  title: "Reader",
  description: "TP - RSS Feed Lecteur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
