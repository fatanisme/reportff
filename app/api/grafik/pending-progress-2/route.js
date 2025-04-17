import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
  try {
    const query = `
SELECT 
    'CAIR' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%LIVE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%LIVE%' 
               AND FLOW_CODE NOT LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'REJECT' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI
UNION ALL
SELECT 
    'CANCEL' AS CATEGORY,
    COUNT(CASE WHEN FLOW_CODE LIKE '%REJECT%' 
               AND TRUNC(CREATE_DATE) = TRUNC(SYSDATE) 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "IN",
    COUNT(CASE WHEN FLOW_CODE LIKE '%REJECT%' 
               AND JENIS_PRODUK LIKE '%GRIYA%' 
           THEN 1 END) AS "LAST"
FROM ILOS.TBL_APLIKASI`;
    const datas = await executeQuery(query);

    return Response.json({ success: true, data: datas });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
