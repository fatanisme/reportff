"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const EMAIL_DOMAIN = "@bankbsi.co.id";

export default function CreateUserPage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: notifySuccess, error: notifyError } = useNotification();

  const handleBack = () => {
    window.location.href = "/administrator/users";
  };

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
    setIsSubmitting(true);

    try {
      const payload = {
        firstName,
        lastName,
        email: `${emailLocalPart.trim().toLowerCase()}${EMAIL_DOMAIN}`,
        password,
        phone,
        status,
        divisionId,
        groupId,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        notifyError(result?.error || "Gagal tambah user");
        setIsSubmitting(false);
        return;
      }

      notifySuccess("User berhasil ditambahkan");
      window.location.href = "/administrator/users";
    } catch (err) {
      console.error("Gagal tambah user:", err);
      notifyError("Terjadi kesalahan saat menambah user");
      setIsSubmitting(false);
    }
  };

      return (
        <div className="p-6 bg-gray-100 min-h-screen">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Tambah User Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Depan</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Masukkan nama depan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nama Belakang (opsional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Masukkan nama belakang"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="flex">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-l"
                value={emailLocalPart}
                onChange={(e) =>
                  setEmailLocalPart(e.target.value.replace(/@.*/, ""))
                }
                placeholder="nama.karyawan"
                required
              />
              <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-100 text-gray-600">
                {EMAIL_DOMAIN}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              className="w-full px-3 py-2 border rounded"
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
            <label className="block text-sm font-medium">Divisi</label>
            <select
              className="w-full px-3 py-2 border rounded"
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
            <label className="block text-sm font-medium">Group</label>
            <select
              className="w-full px-3 py-2 border rounded"
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
                Belum ada group tersedia. Tambahkan group terlebih dahulu.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Nomor Handphone (opsional)</label>
            <input
              type="text"
              placeholder="Contoh: 0812345678"
              className="w-full px-3 py-2 border rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !divisionId ||
                !groupId ||
                loadingDivisions ||
                loadingGroups
              }
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
