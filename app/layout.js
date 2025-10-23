"use client"; // karena pakai useSession

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalLoadingOverlay from "./components/ui/GlobalLoadingOverlay";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    // Atur judul tab berdasarkan path
    if (pathname === "/") {
      document.title = "Report FF";
    } else if (pathname === "/grafik/akumulasi-realtime") {
      document.title = "Report FF - Akumulasi Realtime";
    } else {
      // Format otomatis dari path
      const formatted = pathname
        .split("/")
        .filter(Boolean)
        .map((segment) =>
          segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        )
        .join(" - ");
      document.title = `Report FF - ${formatted}`;
    }
  }, [pathname]);

  return (
    <SessionProvider>
      <ErrorBoundary>
        <html lang="id">
          <body className="flex flex-col min-h-screen">
            {!isAuthPage && <Header />}
            <GlobalLoadingOverlay />
            <main className="flex-grow pt-16 pb-10 px-4 sm:px-6 lg:px-10">
              {children}
            </main>
            {!isAuthPage && <Footer />}
          </body>
        </html>
      </ErrorBoundary>
    </SessionProvider>
  );
}
