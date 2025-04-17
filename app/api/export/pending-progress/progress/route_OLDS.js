import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
    
  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area");
    const kodeRegion = req.nextUrl.searchParams.get("kode_region");
    // const startDate = req.nextUrl.searchParams.get("startDate");
    // const endDate = req.nextUrl.searchParams.get("endDate");

    // const tgl_awal = startDate.replace(/-/g, '');
    // const tgl_akhir = endDate.replace(/-/g, '');

    //realy
    // const tgll = new Date().toISOString().slice(0, 10);
    // const tgl_wise = tgll.replace(/-/g, '');

    // dummy
    const tgll = '2024-05-02';
    const tgl_wise = '20240502';

    // let wheretgl = '';
    // if (tgl_awal === tgl_akhir) {
    // wheretgl = `AND (a.NO_APLIKASI >= '${tgl_awal}')`;
    // } else {
    // wheretgl = `AND (a.NO_APLIKASI >= '${tgl_awal}' AND a.NO_APLIKASI <= '${tgl_akhir}')`;
    // }
    
    // Dummy kode region/area (nanti bisa diganti dari DB)
    let ro_se = kodeRegion === 'All' ? 'All' : kodeRegion;
    let ar_se = kodeArea === 'All' ? 'All' : kodeArea;
    
    let whereArea = '';
    if (kodeRegion && kodeRegion !== 'All') {
    whereArea += `AND (
        CASE
        WHEN b.LVL = '2' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
        )
        WHEN b.LVL = '3' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
        )
        ELSE ''
        END
        ) = '${ro_se}' `;
    }
    
    if (kodeArea && kodeArea !== 'All') {
    whereArea += `AND (
        CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE
        WHEN b.LVL = '3' THEN (
            SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
        )
        ELSE ''
        END
        ) = '${ar_se}' `;
    }
    
    // Query utama
    // NOTE kolom tambahan region di report ff lama kenapa where nya ke area bukan ke kode ?
    const fullQuery = `
    SELECT 
        RM.REGION,
        COALESCE(CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE
        WHEN b.LVL = '3' THEN p.BRANCH_CODE
        ELSE ''
        END, '') AS KODE_AREA,
    
        COALESCE(CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE || ' - ' || b.NAME
        WHEN b.LVL = '3' THEN p.BRANCH_CODE || ' - ' || p.NAME
        ELSE ''
        END, '') AS NAMA_AREA,
    
        COUNT(*) AS TOTAL_APLIKASI,
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%IDE%') THEN 1 END) AS IDE,

        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN (FLOW_CODE LIKE '%DEDUPE%') THEN 1 ELSE NULL END) END) AS DEDUPE,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN (FLOW_CODE LIKE '%BI-CHECKING%') THEN 1 ELSE NULL END) END) AS IDEB,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN (FLOW_CODE LIKE '%UPLOAD-DOC%') THEN 1 ELSE NULL END) END) AS UPLOAD_DOC,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN (FLOW_CODE LIKE '%DDE%') THEN 1 ELSE NULL END) END) AS DDE,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN ((FLOW_CODE LIKE 'STAGE-VERIN%')) THEN 1 ELSE NULL END) END) AS VERIN,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN ((FLOW_CODE LIKE 'STAGE-OTORISASI-VERIN%')) THEN 1 ELSE NULL END) END) AS OTOR_VERIN,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN ((FLOW_CODE LIKE '%VALID%')) THEN 1 ELSE NULL END) END) AS VALID,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN (FLOW_CODE LIKE '%APPROVAL%') THEN 1 ELSE NULL END) END) AS APPROVAL,
        COUNT(CASE WHEN (FLOW_CODE NOT LIKE '%REJECT%') THEN (CASE WHEN ((FLOW_CODE LIKE '%SP3%') OR (FLOW_CODE LIKE '%ORDER-AKAD%') OR (FLOW_CODE LIKE '%REVIEW-AKAD%')) THEN 1 ELSE NULL END) END) AS SP3,
        
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%SPK%' OR a.FLOW_CODE LIKE '%AKAD%') THEN 1 END) AS AKAD,
        COUNT(CASE WHEN a.FLOW_CODE LIKE '%REJECT%' THEN 1 END) AS REJECT,
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%VERIFIKASI%') THEN 1 END) AS VERIFIKASI,
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%INPUT%') THEN 1 END) AS INPUT,
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%CA%' OR a.FLOW_CODE LIKE '%RCA%' OR a.FLOW_CODE LIKE '%SRT%' OR a.FLOW_CODE LIKE '%KACAB%') THEN 1 END) AS CA,
        COUNT(CASE WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') AND (a.FLOW_CODE LIKE '%DIR%' OR a.FLOW_CODE LIKE '%KADIV%' OR a.FLOW_CODE LIKE '%WAKADIV%' OR a.FLOW_CODE LIKE '%KOMITE%') THEN 1 END) AS KOMITE
    
    FROM ILOS.TBL_APLIKASI a
    JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    LEFT JOIN ILOS.TBL_BRANCH p ON p.BRANCH_CODE = b.PARENT_ID
    LEFT JOIN REPORTFF.REGION_MAPPING RM ON RM.KODE_AREA = CASE 
        WHEN b.LVL = '2' THEN 
            b.BRANCH_CODE 
        WHEN b.LVL = '3' THEN
            p.BRANCH_CODE
        END 
    
    WHERE
        (a.JENIS_PRODUK LIKE '%MITRAGUNA%' OR a.JENIS_PRODUK LIKE '%PENSIUN%')
        AND (
        SUBSTR(a.NO_APLIKASI, 1, 8) = '${tgl_wise}'
        OR TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD') = '${tgll}'
        )
        AND a.FLOW_CODE NOT LIKE '%_HOLD%'
        ${whereArea}
    
    GROUP BY
        RM.REGION,
        COALESCE(CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE
        WHEN b.LVL = '3' THEN p.BRANCH_CODE
        ELSE ''
        END, ''),
        COALESCE(CASE
        WHEN b.LVL = '2' THEN b.BRANCH_CODE || ' - ' || b.NAME
        WHEN b.LVL = '3' THEN p.BRANCH_CODE || ' - ' || p.NAME
        ELSE ''
        END, '')
    
    ORDER BY NAMA_AREA
    `;

    // return fullQuery;
    const datas = await executeQuery(fullQuery,[]);
    // const datas = [kodeArea,kodeRegion,tgl_awal,tgl_akhir]
    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
