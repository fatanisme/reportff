// utils/excelUtils.js
import * as XLSX from "xlsx";

const sanitizeSheetName = (name, fallback = "Sheet1") => {
  const invalidCharacters = /[\\/?*[\]:]/g;
  const trimmed = (name || fallback).replace(invalidCharacters, " ").trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, 31);
};

export const createExportExcel = (formattedData, headers, sheetName, fileName) => {
  const ws = XLSX.utils.json_to_sheet(formattedData);
  ws["!cols"] = headers.map(() => ({ wpx: 150 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));

  // Browser-compatible approach for downloading
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const createSummaryExcelFile = (formattedData, headers, title, sheetName, fileName) => {
  const ws = XLSX.utils.json_to_sheet(formattedData, { skipHeader: true });
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A2" });
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });

  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 },
    },
  ];

  ws["A1"].s = { alignment: { horizontal: "center", vertical: "center" } };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));

  // Browser-compatible approach for downloading
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
