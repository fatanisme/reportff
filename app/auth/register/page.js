"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const EMAIL_DOMAIN = "@bankbsi.co.id";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("1");
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [divisionId, setDivisionId] = useState("");
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [groupOptions, setGroupOptions] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/divisi");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setDivisionOptions(data);
        if (data.length > 0) {
          setDivisionId((data[0].ID_DIVISI ?? "").toString());
        }
      } catch (error) {
        console.error("Gagal memuat data divisi:", error);
      } finally {
        setLoadingDivisions(false);
      }
    };

    fetchDivisions();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/groups");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setGroupOptions(data);
        if (data.length > 0) {
          setGroupId((data[0].ID ?? data[0].id ?? "").toString());
        }
      } catch (error) {
        console.error("Gagal memuat data groups:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const email = `${emailLocalPart.trim().toLowerCase()}${EMAIL_DOMAIN}`;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          status,
          divisionId,
          groupId,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || "Gagal daftar");
        setSubmitting(false);
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage("Terjadi kesalahan saat mendaftar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">
        Daftar ke DevReportFF
      </h1>
      {errorMessage && (
        <p className="mb-4 text-sm text-red-600 text-center">{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Depan
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Masukkan nama depan"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Belakang (opsional)
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Masukkan nama belakang"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="flex">
            <input
              type="text"
              className="w-full p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={emailLocalPart}
              onChange={(e) =>
                setEmailLocalPart(e.target.value.replace(/@.*/, ""))
              }
              placeholder="nama.karyawan"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Masukkan password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Handphone (opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: 0812345678"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={loadingDivisions}
          >
            <option value="1">Active</option>
            <option value="0">Deactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Divisi
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
            required
            disabled={loadingDivisions}
          >
            {divisionOptions.map((item) => (
              <option key={item.ID_DIVISI} value={item.ID_DIVISI}>
                {item.NAMA_DIVISI}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            disabled={loadingGroups || groupOptions.length === 0}
          >
            {groupOptions.map((group) => {
              const id = (group.ID ?? group.id ?? "").toString();
              return (
                <option key={id} value={id}>
                  {group.NAME || group.name || id}
                </option>
              );
            })}
          </select>
          {!loadingGroups && groupOptions.length === 0 && (
            <p className="text-sm text-red-600 mt-2">
              Belum ada group tersedia. Silakan hubungi administrator.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={
            submitting ||
            !divisionId ||
            !groupId ||
            loadingDivisions ||
            loadingGroups
          }
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "Daftar"}
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
