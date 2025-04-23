import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
    try {
        const kodeArea = req.nextUrl.searchParams.get("kode_area");
        const kodeRegion = req.nextUrl.searchParams.get("kode_region");

        //real
        // const tgll = new Date().toISOString().slice(0, 10);

        // dummy
        const tgll = '2024-05-02';

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

        const query = `
SELECT
    'IDE' AS CATEGORY,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%IDE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '${tgll}'
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
            ${whereArea}
    ) AS "LAST",

    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%IDE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
            ${whereArea}
    ) AS "IN"

FROM DUAL

UNION ALL

SELECT
    'DEDUPE' AS CATEGORY,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%DEDUPE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '${tgll}'
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
            ${whereArea}
    ) AS "LAST",
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%DEDUPE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
            ${whereArea}
    ) AS "IN"

FROM DUAL
UNION ALL
SELECT
    'IDEB' AS CATEGORY,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%BI-CHECKING%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '${tgll}'
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%') ${whereArea}
) AS "LAST",
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%BI-CHECKING%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}')
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ) ${whereArea}
) AS "IN"

FROM DUAL
UNION ALL
SELECT
    'UPLOAD' AS CATEGORY,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%UPLOAD-DOC%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '${tgll}'
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%') ${whereArea}
) AS "LAST",
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%UPLOAD-DOC%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}')
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ) ${whereArea}
) AS "IN"
FROM DUAL

    `

        const datas = await executeQuery(query);

        return Response.json({ success: true, data: datas });
    } catch (error) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
