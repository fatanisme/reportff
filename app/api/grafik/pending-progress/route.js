import { executeQuery } from "@/lib/oracle";

export async function GET(req) {

  try {
    const kodeArea = req.nextUrl.searchParams.get("kode_area");
    const kodeAreaCondition = kodeArea != 'All' ? `AND BRANCH_CODE = :kode_area` : '';
    const bindValues = kodeArea != 'All' ? { kode_area: kodeArea } : {}; // Jika kode_area ada, tambahkan bind parameter
    const query = `
SELECT 
    'IDE' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%STAGE-IDE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%STAGE-IDE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'DEDUPE' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%DEDUPE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%DEDUPE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'Get Result IDEB' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%BI-CHECKING%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%BI-CHECKING%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'UPLOAD DOC' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%UPLOAD-DOC%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%UPLOAD-DOC%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'DDE' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%DDE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%DDE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'VERIN' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-VERIN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-VERIN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'OTOR VERIN' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-VERIN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-VERIN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'VALIDATE' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%VALID%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%VALID%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'APPROVAL' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%APPROVAL%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%APPROVAL%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'SP3' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%SP3%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%SP3%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'AKAD' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-AKAD-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-AKAD-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'OTOR AKAD' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'REVIEW' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-REVIEW-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-REVIEW-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'OTOR REVIEW' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE 'STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%'
               ${kodeAreaCondition} 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
`;
    const datas = await executeQuery(query,bindValues);

    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
