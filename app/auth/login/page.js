"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Menggunakan useRouter dari next/navigation

const EMAIL_DOMAIN = "@bankbsi.co.id";

export default function LoginPage() {
    const [emailLocalPart, setEmailLocalPart] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter(); // Menggunakan useRouter dari next/navigation
    const { data: session } = useSession();
    useEffect(() => {
        if (session) {
            // Redirect setelah login berhasil menggunakan useRouter
            router.push("/"); // Navigasi ke dashboard atau halaman tujuan
        }
    }, [session, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = `${emailLocalPart.trim().toLowerCase()}${EMAIL_DOMAIN}`;
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError("Email atau password salah.");
        } else {
            // Redirect setelah login berhasil menggunakan useRouter
            router.push("/"); // Navigasi ke dashboard atau halaman tujuan
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4">Masuk ke DevReportFF</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="nama.karyawan"
                            className="w-full p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={emailLocalPart}
                            onChange={(e) =>
                                setEmailLocalPart(e.target.value.replace(/@.*/, ""))
                            }
                            required
                        />
                        <span className="inline-flex items-center px-3 border border-l-0 rounded-r-lg bg-gray-100 text-gray-600">
                            {EMAIL_DOMAIN}
                        </span>
                    </div>
                </div>
                <input
                    type="email"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="username"
                    value={`${emailLocalPart}${EMAIL_DOMAIN}`}
                    readOnly
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
