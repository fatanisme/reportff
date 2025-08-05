"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Redirect setelah login berhasil menggunakan useRouter
      router.push("/"); // Navigasi ke dashboard atau halaman tujuan
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await res.json();
      console.log(result);
      if (!res.ok) {
        alert("Gagal daftar: " + result.error);
        return;
      }

      // Setelah daftar sukses, redirect ke login atau langsung login
      router.push("/auth/login");
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">
        Daftar ke DevReportFF
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
        >
          Daftar
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Sudah punya akun?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Masuk
        </a>
      </p>
    </div>
  );
}
