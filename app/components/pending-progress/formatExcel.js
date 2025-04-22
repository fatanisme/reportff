// utils/formatters.js
export const formatMainData = (item) => ({
    "TGL INPUT": item.TGL_INPUT || "",
    "NO APLIKASI": item.NO_APLIKASI || "",
    "NAMA NASABAH": item.NAMA_NASABAH || "",
    "JENIS PRODUK": item.JENIS_PRODUK || "",
    "KODE PROGRAM": item.EVENT || "",
    "PLAFOND": item.PLAFOND || "",
    "CABANG": item.NAMA_CABANG || "",
    "AREA": item.NAMA_AREA || "",
    "REGION": item.REGION || "",
    "LAST POSISI": item.LAST_POSISI || "",
    "LAST READ BY": (item.LAST_READ_BY + " - " + item.LAST_READ_BY_NAME) || "",
    "LAST UPDATE": item.LAST_UPDATE || "",
    "JUMLAH RETURN": item.JUM_RETURN || 0,
    "BRANCH DDE": item.BRANCH_DDE || "",
});
  
export const formatSummaryData = (item) => ({
    "NO": index + 1,
    "REGION": item.REGION || "",
    "NAMA AREA": `${item.NAMA_AREA}` || "",
    "TOTAL APLIKASI": item.TOTAL_APLIKASI || 0,
    "IDE": item.IDE || 0,
    "DEDUPE": item.DEDUPE || 0,
    "IDEB": item.IDEB || 0,
    "UPLOAD DOC": item.UPLOAD_DOC || 0,
    "DDE": item.DDE || 0,
    "VERIN": item.VERIN || 0,
    "OTOR VERIN": item.OTOR_VERIN || 0,
    "VALID": item.VALID || 0,
    "APPROVAL": item.APPROVAL || 0,
    "SP3": item.SP3 || 0,
    "AKAD": item.AKAD || 0,
    "OTOR AKAD": item.OTOR_AKAD || 0,
    "REVIEW": item.REVIEW || 0,
    "OTOR REVIEW": item.OTOR_REVIEW || 0,
    "LIVE": item.LIVE || 0,
    "CANCEL": item.CANCEL || 0,
    "REJECT": item.REJECT || 0
});

  
  