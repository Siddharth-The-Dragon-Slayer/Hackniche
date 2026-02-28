'use client';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Favicon — uses BanquetEase logo */}
        <link rel="icon" type="image/png" href="/BanquetEase.png" />
        <link rel="apple-touch-icon" href="/BanquetEase.png" />
        <title>BanquetEase — Banquet Management System</title>
        <meta name="description" content="Professional multi-franchise banquet management platform by Coding Gurus" />
        <meta name="application-name" content="BanquetEase" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
