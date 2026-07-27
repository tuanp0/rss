import type { Metadata, Viewport } from "next"
import ClientLayout from '@/components/ClientLayout'

import '../styles/global.scss'
 
const APP_NAME = "TP Reader"
const APP_DEFAULT_TITLE = "TP Reader"
const APP_TITLE_TEMPLATE = "%s - TP"
const APP_DESCRIPTION = "Application web légère et pratique pour rassembler toutes vos news et articles en un seul endroit."

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  // viewportFit: 'cover'
}

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="default" /> */}
      </head>
      <body>
          <ClientLayout>
            {children}
          </ClientLayout>
      </body>
    </html>
  );
}
