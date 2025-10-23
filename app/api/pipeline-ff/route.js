import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET() {
  const query = `SELECT  
  a.NO_APLIKASI,  
  a.JENIS_PRODUK,  
  verin.CREATE_DATE AS TGL_VERIN,  
  approval.CREATE_DATE AS TGL_APPROVAL
FROM ILOS.TBL_APLIKASI a
LEFT JOIN (
  SELECT NO_APLIKASI, CREATE_DATE
  FROM (
    SELECT  
      h.NO_APLIKASI,  
      h.CREATE_DATE,
      ROW_NUMBER() OVER (
        PARTITION BY h.NO_APLIKASI  
        ORDER BY h.CREATE_DATE DESC
      ) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE 'STAGE-VERIN-IMPLAN%'  
       OR h.FLOW_CODE LIKE 'STAGE-VERIN-PENSIUN%'
  )
  WHERE rn = 1
) verin ON a.NO_APLIKASI = verin.NO_APLIKASI
LEFT JOIN (
  SELECT NO_APLIKASI, CREATE_DATE
  FROM (
    SELECT  
      h.NO_APLIKASI,  
      h.CREATE_DATE,
      ROW_NUMBER() OVER (
        PARTITION BY h.NO_APLIKASI  
        ORDER BY h.CREATE_DATE DESC
      ) AS rn
    FROM ILOS.TBL_APLIKASI_HIST h
    WHERE h.FLOW_CODE LIKE 'STAGE-APPROVAL-IMPLAN%'  
       OR h.FLOW_CODE LIKE 'STAGE-APPROVAL-PENSIUN%'
  )
  WHERE rn = 1
) approval ON a.NO_APLIKASI = approval.NO_APLIKASI
WHERE (LOWER(a.FLOW_CODE) LIKE '%implan%'  
    OR LOWER(a.FLOW_CODE) LIKE '%pensiun%')
  AND TRUNC(a.CREATE_DATE) >= TRUNC(SYSDATE - 1)`;

  try {
    const rows = await executeQuery(query);
    return NextResponse.json({ data: Array.isArray(rows) ? rows : [] });
  } catch (error) {
    console.error("Error fetch realisasi-sla-ff:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
