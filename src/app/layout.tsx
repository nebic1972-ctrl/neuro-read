import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neuro-Read",
  description: "Hızlı Okuma Platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="tr">
        <body className={`${inter.className} bg-black text-white antialiased`}>
          {/* 1. Clerk Yüklenirken Siyah Ekranda Beklet */}
          <ClerkLoading>
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
              <div className="text-xl font-bold animate-pulse">
                Nöro-Sistem Başlatılıyor...
              </div>
            </div>
          </ClerkLoading>

          {/* 2. Sadece Clerk Hazır Olduğunda Sayfayı Göster */}
          <ClerkLoaded>
            {children}
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}