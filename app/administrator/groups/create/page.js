"use client";

import { useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { success: notifySuccess, error: notifyError } = useNotification();

  const handleBack = () => {
    window.location.href = "/administrator/groups";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const result = await response.json();
      if (!response.ok) {
        notifyError(result?.error || "Gagal tambah group");
        return;
      }

      notifySuccess("Group berhasil ditambahkan");
      window.location.href = "/administrator/groups";
    } catch (err) {
      console.error("Gagal tambah group:", err);
      notifyError(err.message || "Terjadi kesalahan saat menambah group");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Tambah Group Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Group</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 border rounded"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
