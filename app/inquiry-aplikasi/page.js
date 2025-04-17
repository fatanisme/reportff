"use client";
import React, { useState } from "react";

const InquiryAplikasi = () => {
    const [nomorAplikasi, setNomorAplikasi] = useState("");
    const [data, setData] = useState([]); // Initialize with empty array for data
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!nomorAplikasi.trim()) {
            // Show alert if nomorAplikasi is empty or only contains spaces
            alert("No aplikasi belum diisi atau hanya berisi spasi");
            return; // Prevent search if nomorAplikasi is empty or only spaces
        }
        setLoading(true); // Start loading state
        try {
            const response = await fetch(
                `http://localhost:3000/api/inquiry-aplikasi?nomorAplikasi=${nomorAplikasi}`
            );
            const result = await response.json();
            if (result.success) {
                setData(result.data); // Set data to state
            } else {
                console.error("Error fetching data:", result.message);
                setData([]); // Reset data if error
            }
        } catch (error) {
            console.error("Error during fetch:", error);
            setData([]); // Reset data if error occurs
        } finally {
            setLoading(false); // Stop loading state
        }
    };

    // Render table
    const renderTable = () => {
        if (data.length === 0) {
            return <div>No data found</div>;
        }

        return (
            <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">No Aplikasi</th>
                        <th className="border px-4 py-2">Nama Nasabah</th>
                        <th className="border px-4 py-2">Jenis Produk</th>
                        <th className="border px-4 py-2">Plafond</th>
                        <th className="border px-4 py-2">Last Posisi</th>
                        <th className="border px-4 py-2">Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.no_aplikasi}>
                            <td className="border px-4 py-2">{item.no_aplikasi}</td>
                            <td className="border px-4 py-2">{item.nama_nasabah}</td>
                            <td className="border px-4 py-2">{item.jenis_produk}</td>
                            <td className="border px-4 py-2">{item.plafond}</td>
                            <td className="border px-4 py-2">{item.last_posisi}</td>
                            <td className="border px-4 py-2">{item.last_update}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">
                    Cari Data Pending & Progress
                </h2>
                <div className="flex space-x-2 w-1/2">
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded"
                        value={nomorAplikasi}
                        onChange={(e) => setNomorAplikasi(e.target.value)}
                        placeholder="Masukkan Nomor Aplikasi"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    renderTable()
                )}
            </div>
        </div>
    );
};

export default InquiryAplikasi;
