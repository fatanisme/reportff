"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EditGroupPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleBack = () => {
    window.location.href = "/administrator/groups";
  };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${id}`);
        const result = await res.json();
        if (result?.data) {
          setName(result.data.NAME || "");
          setDescription(result.data.DESCRIPTION || "");
        }
      } catch (err) {
        console.error("Gagal ambil data group:", err);
      }
    };

    if (id) fetchGroup();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result?.error || "Gagal update group");
        return;
      }

      alert("Group berhasil diupdate");
      window.location.href = "/administrator/groups";
    } catch (err) {
      console.error("Gagal update group:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit Group</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Group</label>
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
