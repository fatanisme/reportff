"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const EMAIL_DOMAIN = "@bankbsi.co.id";

export default function EditUserPage() {
  const { id } = useParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("1");
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [divisionId, setDivisionId] = useState("");
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [groupOptions, setGroupOptions] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          setDivisionId((prev) => prev || String(data[0].ID_DIVISI ?? ""));
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
          setGroupId((prev) => prev || (data[0].ID ?? data[0].id ?? "").toString());
        }
      } catch (error) {
        console.error("Gagal memuat data groups:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/users/${id}`);
        const result = await res.json();
        const data = result?.data;

        if (data) {
          setFirstName(data.FIRST_NAME || "");
          setLastName(data.LAST_NAME || "");
          const email = (data.EMAIL || "").toLowerCase();
          setEmailLocalPart(email.replace(EMAIL_DOMAIN, ""));
          setPhone(data.PHONE || "");
          setStatus(
            data.STATUS === undefined || data.STATUS === null
              ? "1"
              : data.STATUS.toString()
          );
          setDivisionId((data.DIVISION_ID ?? "").toString());
          const initialGroupId =
            data.GROUP_ID !== undefined && data.GROUP_ID !== null
              ? data.GROUP_ID.toString()
              : "";
          if (initialGroupId) {
            setGroupId(initialGroupId);
          }
        }
      } catch (err) {
        console.error("Gagal ambil data user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        firstName,
        lastName,
        email: `${emailLocalPart.trim().toLowerCase()}${EMAIL_DOMAIN}`,
        phone,
        status,
        divisionId,
        groupId,
      };

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result?.error || "Gagal update user");
        setSaving(false);
        return;
      }

      alert("User berhasil diupdate");
      window.location.href = "/administrator/users";
    } catch (err) {
      console.error("Gagal update user:", err);
      alert("Terjadi kesalahan saat update user");
      setSaving(false);
    }
  };

  const disableSubmit =
    loading ||
    saving ||
    !divisionId ||
    !groupId ||
    loadingDivisions ||
    loadingGroups;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Depan</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Masukkan nama depan"
              required
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
              />
              <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-100 text-gray-600">
                {EMAIL_DOMAIN}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Nomor Handphone (opsional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 0812345678"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              disabled={loading}
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
              disabled={
                loading || loadingDivisions || divisionOptions.length === 0
              }
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
              disabled={disableSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
