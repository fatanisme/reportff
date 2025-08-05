"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EditUserPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // tambahkan state untuk role

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${id}`);
        const result = await res.json();
        if (result?.data) {
          setName(result.data.NAME || "");
          setEmail(result.data.EMAIL || "");
          setRole(result.data.ROLE || "user"); // ambil role dari data
        }
      } catch (err) {
        console.error("Gagal ambil data user:", err);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }), // kirim role ke backend
      });
      alert("User berhasil diupdate");
      window.location.href = "/administrator/users";
    } catch (err) {
      console.error("Gagal update user:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="user">User</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}