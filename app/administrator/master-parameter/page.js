"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TablePageLayout from "@/app/components/ui/TablePageLayout";
import Button from "@/app/components/ui/Button";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import { useNotification } from "@/app/components/ui/NotificationProvider";

const defaultFormState = {
  paramName: "",
  paramValue: "",
  description: "",
};

const MasterParameterPage = () => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "ID",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState(null); // 'create' | 'edit'
  const [selectedParam, setSelectedParam] = useState(null);
  const [formState, setFormState] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEncryptModalOpen, setIsEncryptModalOpen] = useState(false);
  const [encryptInput, setEncryptInput] = useState("");
  const [encryptResult, setEncryptResult] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    confirm: confirmDialog,
  } = useNotification();

  const tableBusy = useMemo(
    () => Boolean(loading || isSubmitting),
    [loading, isSubmitting]
  );

  const fetchParameters = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        const query = searchTerm
          ? `?search=${encodeURIComponent(searchTerm)}`
          : "";
        const fetchOptions = { cache: "no-store" };
        if (signal) {
          fetchOptions.signal = signal;
        }
        const res = await fetch(`/api/master-parameter${query}`, fetchOptions);

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || "Gagal memuat data parameter");
        }

        const payload = await res.json();
        setParameters(Array.isArray(payload?.data) ? payload.data : []);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Gagal mengambil master parameter:", error);
        notifyError(error.message || "Gagal memuat data parameter");
      } finally {
        setLoading(false);
      }
    },
    [notifyError, searchTerm]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchParameters(controller.signal);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [fetchParameters, searchTerm]);

  const openCreateModal = () => {
    setFormMode("create");
    setFormState(defaultFormState);
    setSelectedParam(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (param) => {
    setFormMode("edit");
    setSelectedParam(param);
    setFormState({
      paramName: param.PARAM_NAME ?? "",
      paramValue: param.PARAM_VALUE ?? "",
      description: param.DESCRIPTION ?? "",
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setFormMode(null);
    setSelectedParam(null);
    setFormState(defaultFormState);
    setIsSubmitting(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!formMode) return;

    if (!formState.paramName.trim() && formMode === "create") {
      notifyWarning("Nama parameter wajib diisi");
      return;
    }

    if (!formState.paramValue.trim() || !formState.description.trim()) {
      notifyWarning("Nilai dan deskripsi parameter wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        paramName: formState.paramName.trim(),
        paramValue: formState.paramValue.trim(),
        description: formState.description.trim(),
      };

      if (formMode === "create") {
        const res = await fetch("/api/master-parameter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => null);
          throw new Error(errorPayload?.message || "Gagal menambah parameter");
        }

        notifySuccess("Parameter berhasil ditambahkan");
      } else if (formMode === "edit" && selectedParam?.ID != null) {
        const res = await fetch(`/api/master-parameter/${selectedParam.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paramValue: payload.paramValue,
            description: payload.description,
          }),
        });

        if (!res.ok) {
          const errorPayload = await res.json().catch(() => null);
          throw new Error(errorPayload?.message || "Gagal memperbarui parameter");
        }

        notifySuccess("Parameter berhasil diperbarui");
      }

      closeFormModal();
      fetchParameters();
    } catch (error) {
      console.error("Gagal menyimpan parameter:", error);
      notifyError(error.message || "Gagal menyimpan parameter");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, paramName) => {
    const confirmed = await confirmDialog({
      title: "Hapus Parameter",
      message: `Yakin menghapus parameter "${paramName}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/master-parameter/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Gagal menghapus parameter");
      }

      notifySuccess("Parameter berhasil dihapus");
      fetchParameters();
    } catch (error) {
      console.error("Gagal menghapus parameter:", error);
      notifyError(error.message || "Gagal menghapus parameter");
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedParameters = useMemo(() => {
    const rows = Array.isArray(parameters) ? [...parameters] : [];
    if (!sortConfig.key) return rows;

    return rows.sort((a, b) => {
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bVal == null) return sortConfig.direction === "asc" ? 1 : -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [parameters, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedParameters.length / itemsPerPage)
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedParameters = sortedParameters.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const resetEncryptState = () => {
    setEncryptInput("");
    setEncryptResult("");
    setDecryptInput("");
    setDecryptResult("");
    setIsEncrypting(false);
    setIsDecrypting(false);
  };

  const openEncryptModal = () => {
    resetEncryptState();
    setIsEncryptModalOpen(true);
  };

  const closeEncryptModal = () => {
    setIsEncryptModalOpen(false);
    resetEncryptState();
  };

  useEffect(() => {
    if (!isEncryptModalOpen) return;
    const controller = new AbortController();

    if (!encryptInput) {
      setEncryptResult("");
      return () => controller.abort();
    }

    setIsEncrypting(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/master-parameter/encrypt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strings: encryptInput }),
          signal: controller.signal,
        });
        const payload = await res.json();
        if (payload?.success) {
          setEncryptResult(payload.result ?? "");
        } else {
          setEncryptResult("");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Gagal melakukan enkripsi:", error);
        }
        setEncryptResult("");
      } finally {
        setIsEncrypting(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [encryptInput, isEncryptModalOpen]);

  useEffect(() => {
    if (!isEncryptModalOpen) return;
    const controller = new AbortController();

    if (!decryptInput) {
      setDecryptResult("");
      return () => controller.abort();
    }

    setIsDecrypting(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/master-parameter/decrypt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strings: decryptInput }),
          signal: controller.signal,
        });
        const payload = await res.json();
        if (payload?.success) {
          setDecryptResult(payload.result ?? "");
        } else {
          setDecryptResult("");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Gagal melakukan dekripsi:", error);
        }
        setDecryptResult("");
      } finally {
        setIsDecrypting(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [decryptInput, isEncryptModalOpen]);

  const copyToClipboard = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notifySuccess("Strings berhasil disalin");
    } catch (error) {
      console.error("Gagal menyalin ke clipboard:", error);
      notifyError("Gagal menyalin ke clipboard");
    }
  };

  const columns = [
    { key: "ID", label: "ID" },
    { key: "PARAM_NAME", label: "Nama Parameter" },
    { key: "PARAM_VALUE", label: "Nilai" },
    { key: "DESCRIPTION", label: "Deskripsi" },
  ];

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-slate-400">⇅</span>;
    }
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:w-auto";

  return (
    <>
      <TablePageLayout
        title="Master Parameter"
        description="Kelola konfigurasi global aplikasi dan uji proses enkripsi/dekripsi."
        actions={
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              className={inputClass}
              placeholder="Cari nama/nilai/deskripsi parameter..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className={selectClass}
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 / halaman</option>
              <option value={10}>10 / halaman</option>
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <Button onClick={openCreateModal}>+ Tambah Parameter</Button>
              <Button
                onClick={openEncryptModal}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Simulasi Encrypt/Decrypt
              </Button>
            </div>
          </div>
        }
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoadingOverlay show={tableBusy} />
          <div className="flex items-center justify-between pb-3">
            <p className="text-sm text-slate-600">
              {loading
                ? "Memuat data parameter..."
                : `Menampilkan ${paginatedParameters.length} dari ${parameters.length} parameter`}
            </p>
          </div>

          <div
            className={
              tableBusy
                ? "pointer-events-none select-none opacity-60 transition"
                : "transition"
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="select-none border px-4 py-2 text-left"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.label}</span>
                        {renderSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  <th className="border px-4 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParameters.map((param) => (
                  <tr key={param.ID} className="odd:bg-white even:bg-slate-50">
                    <td className="border px-4 py-2">{param.ID}</td>
                    <td className="border px-4 py-2 font-semibold">
                      {param.PARAM_NAME}
                    </td>
                    <td className="border px-4 py-2 whitespace-pre-wrap">
                      {param.PARAM_VALUE}
                    </td>
                    <td className="border px-4 py-2 whitespace-pre-wrap">
                      {param.DESCRIPTION}
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
                          onClick={() => openEditModal(param)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          onClick={() =>
                            handleDelete(param.ID, param.PARAM_NAME)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && paginatedParameters.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      Tidak ada parameter yang ditemukan.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-slate-600 md:flex-row">
              <span>
                Menampilkan {paginatedParameters.length} parameter dari {parameters.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safePage <= 1}
                >
                  Prev
                </button>
                <span>
                  Halaman {safePage} dari {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </TablePageLayout>

      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeFormModal}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <form onSubmit={handleFormSubmit}>
              <div className="flex items-start justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {formMode === "create"
                      ? "Tambah Parameter"
                      : `Edit Parameter ${formState.paramName}`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pastikan nilai parameter sesuai kebutuhan modul terkait.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={closeFormModal}
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Nama Parameter
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={formState.paramName}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          paramName: event.target.value,
                        }))
                      }
                      disabled={formMode === "edit"}
                      placeholder="Contoh: pending_progress_on_off_filter"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Nilai Parameter
                    </label>
                    <textarea
                      className="w-full rounded border px-3 py-2"
                      rows={3}
                      value={formState.paramValue}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          paramValue: event.target.value,
                        }))
                      }
                      placeholder="Isi nilai sesuai kebutuhan modul"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
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
                      placeholder="Tuliskan kegunaan parameter"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  onClick={closeFormModal}
                >
                  Batal
                </button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEncryptModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeEncryptModal}
        >
          <div
            className="w-full max-w-3xl rounded-lg bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Simulasi Encrypt / Decrypt
                </h2>
                <p className="text-xs text-slate-500">
                  Ketikkan teks untuk melihat hasil enkripsi dan dekripsi menggunakan utilitas internal.
                </p>
              </div>
              <button
                type="button"
                className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={closeEncryptModal}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Encrypt Text
                  </h3>
                  <textarea
                    className="h-32 w-full rounded border px-3 py-2"
                    placeholder="Masukkan teks untuk dienkripsi"
                    value={encryptInput}
                    onChange={(event) => setEncryptInput(event.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">
                      Hasil Enkripsi
                    </label>
                    <textarea
                      className="h-32 w-full cursor-pointer rounded border px-3 py-2 text-sm"
                      readOnly
                      value={encryptResult}
                      onClick={() => copyToClipboard(encryptResult)}
                    />
                    <p className="text-xs text-slate-500">
                      {isEncrypting
                        ? "Mengolah enkripsi..."
                        : "Klik hasil untuk menyalin ke clipboard"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Decrypt Text
                  </h3>
                  <textarea
                    className="h-32 w-full rounded border px-3 py-2"
                    placeholder="Tempelkan teks terenkripsi"
                    value={decryptInput}
                    onChange={(event) => setDecryptInput(event.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">
                      Hasil Dekripsi
                    </label>
                    <textarea
                      className="h-32 w-full cursor-pointer rounded border px-3 py-2 text-sm"
                      readOnly
                      value={decryptResult}
                      onClick={() => copyToClipboard(decryptResult)}
                    />
                    <p className="text-xs text-slate-500">
                      {isDecrypting
                        ? "Mengolah dekripsi..."
                        : "Klik hasil untuk menyalin ke clipboard"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                onClick={closeEncryptModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MasterParameterPage;
