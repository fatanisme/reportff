import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
    try {
        const kodeArea = req.nextUrl.searchParams.get("kode_area");
        const kodeRegion = req.nextUrl.searchParams.get("kode_region");

        //real
        // const today = new Date();
        // const yearMonth = today.toISOString().slice(0, 7);
        // const dateFirst = `${yearMonth}-01`;
        // const tgll = today.toISOString().slice(0, 10);

        // dummy
        const dateFirst = '2024-05-01';
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
                    ELSE NULL
                END
            ) = '${ro_se}' `;
        }

        if (kodeArea && kodeArea !== 'All') {
            if (whereArea) { // Check if whereArea is not empty, add an additional AND
                whereArea += `AND `;
            }
            whereArea += `AND (
                CASE
                    WHEN b.LVL = '2' THEN b.BRANCH_CODE
                    WHEN b.LVL = '3' THEN (
                        SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
                    )
                    ELSE NULL
                END
            ) = '${ar_se}' `;
        }


        const query = `
SELECT
    'CAIR' AS CATEGORY,
    (
        SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%LIVE%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            a.NO_APLIKASI > '20190615'
            AND (
                SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN '${dateFirst}'
                AND '${tgll}'
            )
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
        AND (a.FLOW_CODE LIKE '%LIVE%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}')
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ) ${whereArea}
) AS "IN"

FROM DUAL
UNION ALL

SELECT
    'CANCEL' AS CATEGORY,
    (
        SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE '%REJECT%') THEN (
                    CASE
                        WHEN (
                            (
                                SELECT
                                    COUNT(*)
                                FROM
                                    ILOS.TBL_CANCEL_APLIKASI c
                                WHERE
                                    c.NO_APLIKASI = a.NO_APLIKASI
                            ) > 0
                        ) THEN 1
                        ELSE NULL
                    END
                )
            END
        )
        FROM
            ILOS.TBL_APLIKASI a
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            (a.FLOW_CODE LIKE '%REJECT%')
            AND (a.JENIS_PRODUK LIKE '%GRIYA%')
            AND (
                a.NO_APLIKASI > '20190615'
                AND (SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN '${dateFirst}' AND '${tgll}')
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%') ${whereArea}
    ) AS "LAST",
    (
        SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE '%REJECT%') THEN (
                    CASE
                        WHEN (
                            (
                                SELECT
                                    COUNT(*)
                                FROM
                                    ILOS.TBL_CANCEL_APLIKASI c
                                WHERE
                                    c.NO_APLIKASI = a.NO_APLIKASI
                            ) > 0
                        ) THEN 1
                        ELSE NULL
                    END
                )
            END
        )
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (a.FLOW_CODE LIKE '%REJECT%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}')
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ) ${whereArea}
    ) AS "IN"

FROM DUAL
UNION ALL
SELECT
    'REJECT' AS CATEGORY,
    (
    SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE '%REJECT%') THEN (
                    CASE
                        WHEN (
                            (
                                SELECT
                                    COUNT(*)
                                FROM
                                    ILOS.TBL_CANCEL_APLIKASI c
                                WHERE
                                    c.NO_APLIKASI = a.NO_APLIKASI
                            ) <= 0
                        ) THEN 1
                        ELSE NULL
                    END
                )
            END
        )
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (a.FLOW_CODE LIKE '%REJECT%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            a.NO_APLIKASI > '20190615'
            AND (SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN '${dateFirst}'AND '${tgll}')
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%') ${whereArea}
) AS "LAST",
    (
    SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE '%REJECT%') THEN (
                    CASE
                        WHEN (
                            (
                                SELECT
                                    COUNT(*)
                                FROM
                                    ILOS.TBL_CANCEL_APLIKASI c
                                WHERE
                                    c.NO_APLIKASI = a.NO_APLIKASI
                            ) <= 0
                        ) THEN 1
                        ELSE NULL
                    END
                )
            END
        )
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (a.FLOW_CODE LIKE '%REJECT%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}')
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ) ${whereArea}
) AS "IN"

FROM DUAL
    `;

        const datas = await executeQuery(query);

        return Response.json({ success: true, data: datas });
    } catch (error) {
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
