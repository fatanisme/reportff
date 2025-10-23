"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const createDefaultFormState = () => ({
  id: null,
  urlPath: "",
  description: "",
  allowAll: "0",
  allowAnonymous: "0",
  divisionIds: [],
});

export default function MenuManajemenPage() {
  const [permissions, setPermissions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // "create" | "edit" | null
  const [formState, setFormState] = useState(createDefaultFormState);

  const resetForm = useCallback(() => {
    setFormState(createDefaultFormState());
    setFormMode(null);
    setIsSubmitting(false);
    setIsModalOpen(false);
  }, []);

  const fetchDivisions = useCallback(async () => {
    setIsLoadingDivisions(true);
    try {
      const res = await fetch("/api/divisi");
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const normalized = data.map((division) => ({
        id: (division.ID_DIVISI ?? division.id ?? "").toString(),
        code: (division.KODE_DIVISI ?? division.code ?? "").toString(),
        name: division.NAMA_DIVISI ?? division.name ?? "",
      }));
      setDivisions(normalized);
    } catch (error) {
      console.error("Gagal memuat data divisi:", error);
    } finally {
      setIsLoadingDivisions(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    try {
      const res = await fetch("/api/page-permissions");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Gagal memuat data hak akses");
      }
      const data = Array.isArray(json?.data) ? json.data : [];
      const normalized = data.map((item) => {
        const allowAllSource =
          item.allowAll ?? item.ALLOW_ALL ?? item.allow_all ?? 0;
        const allowAll =
          allowAllSource === true ||
          allowAllSource === "true" ||
          Number(allowAllSource) === 1;

        const allowAnonymousSource =
          item.allowAnonymous ??
          item.ALLOW_ANONYMOUS ??
          item.allow_anonymous ??
          0;
        const allowAnonymous =
          allowAnonymousSource === true ||
          allowAnonymousSource === "true" ||
          Number(allowAnonymousSource) === 1;

        return {
          id: item.id ?? item.ID,
          urlPath: item.urlPath ?? item.URL_PATH ?? "",
          description: item.description ?? item.DESCRIPTION ?? "",
          allowAll,
          allowAnonymous,
          divisionIds: Array.isArray(item.divisionIds)
            ? item.divisionIds.map((value) => value.toString())
            : [],
          divisions: Array.isArray(item.divisions)
            ? item.divisions.map((division) => ({
                id: (division.id ?? division.ID ?? "").toString(),
                name: division.name ?? division.NAME ?? "",
                code: (division.code ?? division.CODE ?? "").toString(),
              }))
            : [],
          createdAt: item.createdAt ?? item.CREATED_AT ?? null,
          updatedAt: item.updatedAt ?? item.UPDATED_AT ?? null,
        };
      });
      setPermissions(normalized);
    } catch (error) {
      console.error("Gagal memuat data page permission:", error);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisions();
    fetchPermissions();
  }, [fetchDivisions, fetchPermissions]);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        resetForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, resetForm]);

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return permissions;
    const term = searchTerm.toLowerCase();
    return permissions.filter((permission) => {
      const divisionNames = permission.divisions
        .map((division) => division.name)
        .join(" ");
      const haystack = `${permission.urlPath} ${permission.description} ${divisionNames}`;
      return haystack.toLowerCase().includes(term);
    });
  }, [permissions, searchTerm]);

  const openCreateForm = () => {
    setFormState(createDefaultFormState());
    setFormMode("create");
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  const openEditForm = (permission) => {
    setFormState({
      id: permission.id,
      urlPath: permission.urlPath,
      description: permission.description ?? "",
      allowAll: permission.allowAll ? "1" : "0",
      allowAnonymous: permission.allowAnonymous ? "1" : "0",
      divisionIds: Array.isArray(permission.divisionIds)
        ? [...permission.divisionIds]
        : [],
    });
    setFormMode("edit");
    setIsSubmitting(false);
    setIsModalOpen(true);
  };

  const handleDivisionToggle = (divisionId) => {
    setFormState((prev) => {
      const exists = prev.divisionIds.includes(divisionId);
      const divisionIds = exists
        ? prev.divisionIds.filter((id) => id !== divisionId)
        : [...prev.divisionIds, divisionId];
      return {
        ...prev,
        divisionIds,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      urlPath: formState.urlPath.trim(),
      description: formState.description.trim(),
      allowAll: formState.allowAll,
      allowAnonymous: formState.allowAnonymous,
      divisionIds:
        formState.allowAll === "1" || formState.allowAnonymous === "1"
          ? []
          : formState.divisionIds,
    };

    const url =
      formMode === "edit"
        ? `/api/page-permissions/${formState.id}`
        : "/api/page-permissions";

    const method = formMode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Gagal menyimpan data");
      }

      await fetchPermissions();
      alert("Hak akses berhasil disimpan");
      resetForm();
    } catch (error) {
      console.error("Gagal menyimpan data hak akses:", error);
      alert(error.message || "Gagal menyimpan data");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (permission) => {
    const confirmed = confirm(
      `Yakin ingin menghapus pengaturan "${permission.urlPath}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/page-permissions/${permission.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Gagal menghapus data");
      }
      await fetchPermissions();
      alert("Hak akses berhasil dihapus");
      if (formMode === "edit" && formState.id === permission.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Gagal menghapus data hak akses:", error);
      alert(error.message || "Gagal menghapus data");
    }
  };

  const renderDivisionsBadge = (permission) => {
    if (permission.allowAnonymous) {
      return (
        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
          Publik
        </span>
      );
    }

    if (permission.allowAll) {
      return (
        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
          Semua pengguna login
        </span>
      );
    }

    if (permission.divisions.length === 0) {
      return (
        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
          Tidak ada pembatasan divisi
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {permission.divisions.map((division) => (
          <span
            key={division.id}
            className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700"
          >
            {division.code ? `${division.code} - ${division.name}` : division.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Manajemen Akses Halaman
              </h1>
              <p className="text-sm text-gray-500">
                Atur halaman mana yang dapat diakses berdasarkan divisi.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                className="w-full rounded border px-3 py-2 md:w-64"
                placeholder="Cari URL atau divisi..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={openCreateForm}
              >
                Tambah Konfigurasi
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">
                    URL Path
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Deskripsi
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Akses Divisi
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPermissions ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border px-4 py-6 text-center text-gray-500"
                    >
                      Memuat data hak akses...
                    </td>
                  </tr>
                ) : filteredPermissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border px-4 py-6 text-center text-gray-500"
                    >
                      Tidak ada konfigurasi akses.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-medium text-gray-700">
                        {permission.urlPath}
                      </td>
                      <td className="border px-4 py-2 text-sm text-gray-600">
                        {permission.description || "-"}
                      </td>
                      <td className="border px-4 py-2">
                        {renderDivisionsBadge(permission)}
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
                            onClick={() => openEditForm(permission)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                            onClick={() => handleDelete(permission)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && formMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={resetForm}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-form-title"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-start justify-between border-b px-6 py-4">
                <div>
                  <h2
                    id="permission-form-title"
                    className="text-lg font-semibold text-gray-800"
                  >
                    {formMode === "create"
                      ? "Tambah Pengaturan Akses"
                      : "Ubah Pengaturan Akses"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tentukan URL path dan divisi yang diperbolehkan.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={resetForm}
                  aria-label="Tutup modal"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      URL Path
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={formState.urlPath}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          urlPath: event.target.value,
                        }))
                      }
                      placeholder="/administrator/sample"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      className="w-full rounded border px-3 py-2"
                      rows={3}
                      value={formState.description}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Informasi singkat mengenai halaman ini"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Mode Akses
                    </label>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formState.allowAll === "1"}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              allowAll: event.target.checked ? "1" : "0",
                              divisionIds: event.target.checked
                                ? []
                                : prev.divisionIds,
                            }))
                          }
                          disabled={formState.allowAnonymous === "1"}
                        />
                        <span>Semua pengguna login</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formState.allowAnonymous === "1"}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              allowAnonymous: event.target.checked ? "1" : "0",
                              allowAll: event.target.checked ? "0" : prev.allowAll,
                              divisionIds: event.target.checked
                                ? []
                                : prev.divisionIds,
                            }))
                          }
                        />
                        <span>Akses tanpa login (publik)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Divisi yang Diizinkan
                      </label>
                      {formState.allowAnonymous === "1" && (
                        <span className="text-xs text-gray-500">
                          Mode publik aktif, pembatasan diabaikan.
                        </span>
                      )}
                      {formState.allowAll === "1" && (
                        <span className="text-xs text-gray-500">
                          Allow All aktif, daftar divisi tidak diperlukan.
                        </span>
                      )}
                    </div>

                    {isLoadingDivisions ? (
                      <p className="rounded border border-dashed px-3 py-2 text-sm text-gray-500">
                        Memuat data divisi...
                      </p>
                    ) : divisions.length === 0 ? (
                      <p className="rounded border border-dashed px-3 py-2 text-sm text-gray-500">
                        Tidak ada data divisi tersedia.
                      </p>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {divisions.map((division) => {
                          const checked = formState.divisionIds.includes(
                            division.id
                          );
                          return (
                            <label
                              key={division.id}
                              className={`flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm ${
                                checked
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200"
                              } ${
                                formState.allowAll === "1" ||
                                formState.allowAnonymous === "1"
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={checked}
                                disabled={
                                  formState.allowAll === "1" ||
                                  formState.allowAnonymous === "1"
                                }
                                onChange={() => handleDivisionToggle(division.id)}
                              />
                              <span>
                                <span className="font-medium text-gray-700">
                                  {division.code
                                    ? `${division.code} - ${division.name}`
                                    : division.name}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {formState.allowAll === "0" &&
                    formState.allowAnonymous === "0" &&
                    formState.divisionIds.length === 0 && (
                      <p className="text-xs text-red-500">
                        Pilih minimal satu divisi, atau aktifkan akses bebas.
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  className="rounded border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={
                    isSubmitting ||
                    !formState.urlPath.trim() ||
                    (formState.allowAll === "0" &&
                      formState.allowAnonymous === "0" &&
                      formState.divisionIds.length === 0)
                  }
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
