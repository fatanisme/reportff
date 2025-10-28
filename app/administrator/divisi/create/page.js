"use client";

import { useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function CreateDivisiPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const { success: notifySuccess, error: notifyError } = useNotification();

  const handleBack = () => {
    window.location.href = "/administrator/divisi";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/divisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description }),
      });
      if (!response.ok) {
        throw new Error("Gagal menambahkan divisi");
      }
      notifySuccess("Divisi berhasil ditambahkan");
      window.location.href = "/administrator/divisi";
    } catch (err) {
      console.error("Gagal tambah user:", err);
      notifyError(err.message || "Gagal menambahkan divisi");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Tambah Divisi Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Kode Divisi</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nama Divisi</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
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
