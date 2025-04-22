// utils/excelUtils.js
import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

export const createExportExcel = (formattedData, headers, sheetName, fileName) => {
  const ws = XLSX.utils.json_to_sheet(formattedData);
  ws["!cols"] = headers.map(() => ({ wpx: 150 }));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Menulis dan mendownload file Excel
  XLSX.writeFile(wb, fileName);
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
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, fileName);
};
