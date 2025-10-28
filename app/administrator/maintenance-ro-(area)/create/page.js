"use client";

import { useState } from "react";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function CreateMaintenancePage() {
  const [code_area, setCodeArea] = useState("");
  const [area, setArea] = useState("");
  const [code_region, setCodeRegion] = useState("");
  const [region, setRegion] = useState("");
  const [region_alias, setRegionAlias] = useState("");
  const { success: notifySuccess, error: notifyError } = useNotification();

  const handleBack = () => {
    window.location.href = "/administrator/maintenance-ro-(area)";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_area,
          area,
          code_region,
          region,
          region_alias,
        }),
      });
      if (!response.ok) {
        throw new Error("Gagal menambahkan maintenance");
      }
      notifySuccess("Maintenance berhasil ditambahkan");
      window.location.href = "/administrator/maintenance-ro-(area)";
    } catch (err) {
      console.error("Gagal tambah user:", err);
      notifyError(err.message || "Gagal menambahkan maintenance");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Tambah Maintenance Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Kode Area</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={code_area}
              onChange={(e) => setCodeArea(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Area</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Kode Region</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={code_region}
              onChange={(e) => setCodeRegion(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Region</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Region Alias</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={region_alias}
              onChange={(e) => setRegionAlias(e.target.value)}
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
