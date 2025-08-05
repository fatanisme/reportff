"use client";

import { useState } from "react";

export default function CreateDivisiPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3000/api/divisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description }),
      });
      alert("Divisi berhasil ditambahkan");
      window.location.href = "/administrator/divisi";
    } catch (err) {
      console.error("Gagal tambah user:", err);
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

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
