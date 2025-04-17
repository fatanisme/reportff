"use client"; // Layout harus jadi Client Component agar bisa menggunakan useSession
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <SessionProvider>
      <html lang="id">
        <body className="bg-gray-100 flex flex-col min-h-screen">
          {/* Menampilkan Header jika bukan halaman autentikasi */}
          {!isAuthPage && <Header />}

          <main className="flex-grow pt-16">
            {children}
          </main>

          {/* Menampilkan Footer jika bukan halaman autentikasi */}
          {!isAuthPage && <Footer />}
        </body>
      </html>
    </SessionProvider>
  );
}
