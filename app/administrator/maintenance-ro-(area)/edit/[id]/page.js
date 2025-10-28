"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNotification } from "@/app/components/ui/NotificationProvider";

export default function EditMaintenancePage() {
  const { id } = useParams();
  const [codeArea, setCodeArea] = useState("");
  const [area, setArea] = useState("");
  const [codeRegion, setCodeRegion] = useState("");
  const [region, setRegion] = useState("");
  const [regionAlias, setRegionAlias] = useState("");
  const { success: notifySuccess, error: notifyError } = useNotification();

  const handleBack = () => {
    window.location.href = "/administrator/maintenance-ro-(area)";
  };

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch(`/api/maintenance/${id}`);
        const result = await res.json();
        if (result?.data) {
          setCodeArea(result.data.KODE_AREA || "");
          setArea(result.data.AREA || "");
          setCodeRegion(result.data.KODE_REGION || "");
          setRegion(result.data.REGION || "");
          setRegionAlias(result.data.REGION_ALIAS || "");
        }
      } catch (err) {
        console.error("Gagal ambil data maintenance:", err);
      }
    };

    if (id) fetchMaintenance();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_area: codeArea,
          area,
          code_region: codeRegion,
          region,
          region_alias: regionAlias,
        }),
      });
      if (!response.ok) {
        throw new Error("Gagal memperbarui maintenance");
      }
      notifySuccess("Maintenance berhasil diupdate");
      window.location.href = "/administrator/maintenance-ro-(area)";
    } catch (err) {
      console.error("Gagal update maintenance:", err);
      notifyError(err.message || "Gagal memperbarui maintenance");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Edit Maintenance</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Kode Area</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={codeArea}
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
              value={codeRegion}
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
              value={regionAlias}
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
