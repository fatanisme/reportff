export const LD_TABLE_INFO = Object.freeze({
  owner: "REPORTFF",
  table: "LOGS_LD",
  column: "KET_PENCAIRAN",
});

const ensureSet = (columns) => {
  if (columns instanceof Set) {
    return columns;
  }
  if (Array.isArray(columns)) {
    return new Set(columns.map((value) => String(value || "").toUpperCase()));
  }
  return new Set();
};

export const getLdSelectColumns = (columnSetInput) => {
  const columnSet = ensureSet(columnSetInput);
  const has = (columnName) => columnSet.has(String(columnName || "").toUpperCase());

  return [
    has("ID") ? "ID" : "NULL AS ID",
    has("TGL_CAIR")
      ? "TO_CHAR(TGL_CAIR, 'YYYY-MM-DD') AS TGL_CAIR"
      : "NULL AS TGL_CAIR",
    has("NO_APLIKASI") ? "NO_APLIKASI" : "NULL AS NO_APLIKASI",
    has("NAMA_NASABAH") ? "NAMA_NASABAH" : "NULL AS NAMA_NASABAH",
    has("BRANCH_CODE") ? "BRANCH_CODE" : "NULL AS BRANCH_CODE",
    has("BRANCH_NAME") ? "BRANCH_NAME" : "NULL AS BRANCH_NAME",
    has("PRODUK") ? "PRODUK" : "NULL AS PRODUK",
    has("STATUS") ? "STATUS" : "NULL AS STATUS",
    has("KET_PENCAIRAN") ? "KET_PENCAIRAN" : "NULL AS KET_PENCAIRAN",
    has("SEQ_CAIR") ? "SEQ_CAIR" : "NULL AS SEQ_CAIR",
    has("CREATED_AT") ? "CREATED_AT" : "NULL AS CREATED_AT",
    has("UPDATED_AT") ? "UPDATED_AT" : "NULL AS UPDATED_AT",
  ];
};
