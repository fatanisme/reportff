"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EditDivisiPage() {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleBack = () => {
    window.location.href = "/administrator/divisi";
  };

  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const res = await fetch(`/api/divisi/${id}`);
        const result = await res.json();
        if (result?.data) {
          setCode(result.data.KODE_DIVISI || "");
          setName(result.data.NAMA_DIVISI || "");
          setDescription(result.data.DESKRIPSI || "");
        }
      } catch (err) {
        console.error("Gagal ambil data divisi:", err);
      }
    };

    if (id) fetchDivisi();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/divisi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description }),
      });
      alert("Divisi berhasil diupdate");
      window.location.href = "/administrator/divisi";
    } catch (err) {
      console.error("Gagal update divisi:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit Divisi</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
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
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
