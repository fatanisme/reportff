"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  useEffect(() => {
    document.title = "Akses Ditolak";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800">Akses Ditolak</h1>
        <p className="mt-4 text-sm text-gray-600">
          Anda tidak memiliki hak akses untuk halaman ini. Silakan hubungi
          administrator apabila membutuhkan akses tambahan.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/auth/login"
            className="rounded border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
