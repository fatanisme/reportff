"use client";
import React, { useState } from "react";
import ButtonExport from "../components/inquiry-aplikasi/ButtonExport";

const InquiryAplikasi = () => {
    const [nomorAplikasi, setNomorAplikasi] = useState("");
    const [data, setData] = useState([]);
    const [memo, setMemo] = useState([]);
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
                `http://localhost:3000/api/inquiry-aplikasi?no_apl=${nomorAplikasi}`
            );
            const result = await response.json();
            if (result.success) {
                console.log(result.data[0])
                setData(result.data[0]);
                setMemo(result.data[1])
                renderTable()
                renderTablememo()
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

            <div className="overflow-x-auto mt-2">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>

                            <th className="border px-4 py-2">TGL INPUT</th>
                            <th className="border px-4 py-2">NO APLIKASI</th>
                            <th className="border px-4 py-2">NAMA NASABAH</th>
                            <th className="border px-4 py-2">JENIS PRODUK</th>
                            <th className="border px-4 py-2">KODE PROGRAM</th>
                            <th className="border px-4 py-2">TIPE PRODUK</th>
                            <th className="border px-4 py-2">PLAFOND</th>
                            <th className="border px-4 py-2">CABANG</th>
                            <th className="border px-4 py-2">AREA</th>
                            <th className="border px-4 py-2">REGION</th>
                            <th className="border px-4 py-2">LAST POSISI</th>
                            <th className="border px-4 py-2">LAST READ BY</th>
                            <th className="border px-4 py-2">LAST UPDATE</th>
                            <th className="border px-4 py-2">JUMLAH RETURN</th>

                            <th className="border px-4 py-2">PIC IDE</th>
                            <th className="border px-4 py-2">IN IDE</th>
                            <th className="border px-4 py-2">OUT IDE</th>
                            <th className="border px-4 py-2">SLA IDE</th>

                            <th className="border px-4 py-2">PIC DEDUPE</th>
                            <th className="border px-4 py-2">IN DEDUPE</th>
                            <th className="border px-4 py-2">OUT DEDUPE</th>
                            <th className="border px-4 py-2">SLA DEDUPE</th>

                            <th className="border px-4 py-2">PIC iDEB</th>
                            <th className="border px-4 py-2">IN iDEB</th>
                            <th className="border px-4 py-2">OUT iDEB</th>
                            <th className="border px-4 py-2">SLA iDEB</th>

                            <th className="border px-4 py-2">PIC UPLOAD DOC</th>
                            <th className="border px-4 py-2">IN UPLOAD DOC</th>
                            <th className="border px-4 py-2">OUT UPLOAD DOC</th>
                            <th className="border px-4 py-2">SLA UPLOAD DOC</th>

                            <th className="border px-4 py-2">BRANCH DDE</th>

                            <th className="border px-4 py-2">PIC DDE</th>
                            <th className="border px-4 py-2">IN DDE</th>
                            <th className="border px-4 py-2">OUT DDE</th>
                            <th className="border px-4 py-2">SLA DDE</th>

                            <th className="border px-4 py-2">PIC VERIN</th>
                            <th className="border px-4 py-2">IN VERIN</th>
                            <th className="border px-4 py-2">OUT VERIN</th>
                            <th className="border px-4 py-2">SLA VERIN</th>

                            <th className="border px-4 py-2">PIC APPROVAL</th>
                            <th className="border px-4 py-2">IN APPROVAL</th>
                            <th className="border px-4 py-2">OUT APPROVAL</th>
                            <th className="border px-4 py-2">SLA APPROVAL</th>

                            <th className="border px-4 py-2">PIC SP3</th>
                            <th className="border px-4 py-2">IN SP3</th>
                            <th className="border px-4 py-2">OUT SP3</th>
                            <th className="border px-4 py-2">SLA SP3</th>

                            <th className="border px-4 py-2">PIC AKAD</th>
                            <th className="border px-4 py-2">IN AKAD</th>
                            <th className="border px-4 py-2">OUT AKAD</th>
                            <th className="border px-4 py-2">SLA AKAD</th>

                            <th className="border px-4 py-2">PIC REVIEW</th>
                            <th className="border px-4 py-2">IN REVIEW</th>
                            <th className="border px-4 py-2">OUT REVIEW</th>
                            <th className="border px-4 py-2">SLA REVIEW</th>
                            <th className="border px-4 py-2">
                                <center>TOTAL SLA LIVE</center>
                            </th>
                            <th className="border px-4 py-2">ALASAN CANCEL</th>
                            <th className="border px-4 py-2">ALASAN REJECT</th>
                        </tr>

                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx + 1}>
                                <td className="border px-4 py-2">{item.TGL_INPUT}</td>
                                <td className="border px-4 py-2">{item.NO_APLIKASI}</td>
                                <td className="border px-4 py-2">{item.NAMA_NASABAH}</td>
                                <td className="border px-4 py-2">{item.JENIS_PRODUK}</td>
                                <td className="border px-4 py-2">{item.EVENT}</td>
                                <td className="border px-4 py-2">{item.TIPE_PRODUK}</td>
                                <td className="border px-4 py-2">{item.PLAFOND}</td>
                                <td className="border px-4 py-2">{item.NAMA_CABANG}</td>
                                <td className="border px-4 py-2">{item.NAMA_AREA}</td>
                                <td className="border px-4 py-2">{item.REGION}</td>

                                <td className="border px-4 py-2">{item.LAST_POSISI}</td>
                                <td className="border px-4 py-2">{item.LAST_READ_BY}</td>
                                <td className="border px-4 py-2">{item.LAST_UPDATE}</td>
                                <td className="border px-4 py-2">{item.JUM_RETURN}</td>
                                <td className="border px-4 py-2">{item.PIC_IDE}</td>
                                <td className="border px-4 py-2">{item.IN_IDE}</td>
                                <td className="border px-4 py-2">{item.OUT_IDE}</td>
                                <td className="border px-4 py-2">{item.SLA_IDE}</td>
                                <td className="border px-4 py-2">{item.PIC_DEDUPE}</td>
                                <td className="border px-4 py-2">{item.IN_DEDUPE}</td>
                                <td className="border px-4 py-2">{item.OUT_DEDUPE}</td>
                                <td className="border px-4 py-2">{item.SLA_DEDUPE}</td>
                                <td className="border px-4 py-2">{item.PIC_IDEB}</td>
                                <td className="border px-4 py-2">{item.IN_IDEB}</td>
                                <td className="border px-4 py-2">{item.OUT_IDEB}</td>
                                <td className="border px-4 py-2">{item.SLA_IDEB}</td>
                                <td className="border px-4 py-2">{item.PIC_UPLOAD}</td>
                                <td className="border px-4 py-2">{item.IN_UPLOAD}</td>
                                <td className="border px-4 py-2">{item.OUT_UPLOAD}</td>
                                <td className="border px-4 py-2">{item.SLA_UPLOAD}</td>
                                <td className="border px-4 py-2">{item.PIC_DDE}</td>
                                <td className="border px-4 py-2">{item.BRANCH_DDE}</td>
                                <td className="border px-4 py-2">{item.IN_DDE}</td>
                                <td className="border px-4 py-2">{item.OUT_DDE}</td>
                                <td className="border px-4 py-2">{item.SLA_DDE}</td>
                                <td className="border px-4 py-2">{item.PIC_VERIN}</td>
                                <td className="border px-4 py-2">{item.IN_VERIN}</td>
                                <td className="border px-4 py-2">{item.OUT_VERIN}</td>
                                <td className="border px-4 py-2">{item.SLA_VERIN}</td>
                                <td className="border px-4 py-2">{item.PIC_APPROVAL}</td>
                                <td className="border px-4 py-2">{item.IN_APPROVAL}</td>
                                <td className="border px-4 py-2">{item.OUT_APPROVAL}</td>
                                <td className="border px-4 py-2">{item.SLA_APPROVAL}</td>
                                <td className="border px-4 py-2">{item.PIC_SP3}</td>
                                <td className="border px-4 py-2">{item.IN_SP3}</td>
                                <td className="border px-4 py-2">{item.OUT_SP3}</td>
                                <td className="border px-4 py-2">{item.SLA_SP3}</td>
                                <td className="border px-4 py-2">{item.PIC_AKAD}</td>
                                <td className="border px-4 py-2">{item.IN_AKAD}</td>
                                <td className="border px-4 py-2">{item.OUT_AKAD}</td>
                                <td className="border px-4 py-2">{item.SLA_AKAD}</td>
                                <td className="border px-4 py-2">{item.PIC_REVIEW}</td>
                                <td className="border px-4 py-2">{item.IN_REVIEW}</td>
                                <td className="border px-4 py-2">{item.OUT_REVIEW}</td>
                                <td className="border px-4 py-2">{item.SLA_REVIEW}</td>
                                <td className="border px-4 py-2">{item.TOTAL_SLA_LIVE}</td>
                                <td className="border px-4 py-2"></td>
                                <td className="border px-4 py-2"></td>
                                {/* <td className="border px-4 py-2">{item.FLOW_CODE}</td>
                                <td className="border px-4 py-2">{item.BRANCH_CODE}</td> */}

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTablememo = () => {
        let rows = []
        let parsedData = []
        if(memo.length !== 0){
            rows = memo[0].MEMO.split('###');

            parsedData = rows.map(row => row.split('|'));
            console.log(parsedData)
        }else{
            return
        }

        return (

            <div className="overflow-x-auto mt-2">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Stage</th>
                            <th className="border px-4 py-2">PIC</th>
                            <th className="border px-4 py-2">Tanggal</th>
                            <th className="border px-4 py-2">Isi Memo</th>
                        </tr>

                    </thead>
                    <tbody>
                        {parsedData.map((cols, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{cols[2]}</td>
                                <td className="border px-4 py-2">{cols[0]}</td>
                                <td className="border px-4 py-2">{cols[3]}</td>
                                <td className="border px-4 py-2">{cols[4]}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
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
                {data.length != 0 ? <ButtonExport no_apl={nomorAplikasi} type="1"/> : ''}
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    
                    renderTable()
                )}
                {memo.length !== 0 ? <h3 className="text-lg mt-5">MEMO (Pending)</h3> : ''}
                {memo.length !== 0 ? <ButtonExport no_apl={nomorAplikasi} type="2"/> : ''}
                {renderTablememo()}
            </div>
        </div>
    );
};

export default InquiryAplikasi;
