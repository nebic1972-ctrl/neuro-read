import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes' // Gece moduna tam uyum

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neuro-Read Platform",
  description: "Bilişsel akış ve odaklanma sistemi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider uygulamayı sarar ve kimlik sistemini başlatır
    <ClerkProvider 
      appearance={{
        baseTheme: dark, // Bizim temamıza uygun Dark Mode
        variables: { colorPrimary: '#ef4444' } // Bizim kırmızımız
      }}
    >
      <html lang="tr">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}