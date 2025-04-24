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
    'UPLOAD_DOC' AS CATEGORY,
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
UNION ALL
SELECT
    'DDE' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%DDE%')
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
        (a.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%DDE%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL

UNION ALL
SELECT
    'VERIN' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-VERIFIKASI%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-VERIFIKASI%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         ${whereArea}
) AS "IN"
FROM DUAL

UNION ALL

SELECT
    'OTOR_VERIN' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIFIKASI%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIFIKASI%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_KJPP' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-KJPP%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-KJPP%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'APPRAISAL' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-APPRAISAL%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-APPRAISAL%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_APPRAISAL' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-APPRAISAL%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-APPRAISAL%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'APPROVAL' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%APPROVAL%')
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
        AND (a.FLOW_CODE LIKE '%APPROVAL%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'SP3' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-SP-3%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-SP-3%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_NOTARIS' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-NOTARIS%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-NOTARIS%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_NOTARIS_FOG' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-NOTARIS-FOG%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-ORDER-NOTARIS-FOG%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_ORDER_NOTARIS' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-ORDER-NOTARIS%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-ORDER-NOTARIS%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'AKAD' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-AKAD%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-AKAD%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_AKAD' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD%')
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
        AND (a.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'REVIEW' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (a.FLOW_CODE LIKE '%REVIEW_DAN_PENCAIRAN%')
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
        AND (a.FLOW_CODE LIKE '%REVIEW_DAN_PENCAIRAN%')
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'REVIEW' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (
          (a.FLOW_CODE LIKE '%STAGE-REVIEW%') OR
          (a.FLOW_CODE LIKE '%REVIEW_DAN_PENCAIRAN%')
          )
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
        AND (
          (a.FLOW_CODE LIKE '%STAGE-REVIEW%') OR
          (a.FLOW_CODE LIKE '%REVIEW_DAN_PENCAIRAN%')
          )
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_REVIEW' AS CATEGORY,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE '%REJECT%')
        AND (
            
                A.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW%'
             OR
             
                A.FLOW_CODE LIKE '%STAGE_OTORISASI_REVIEW%'
            )
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
        AND (
            
                A.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW%'
             OR
             
                A.FLOW_CODE LIKE '%STAGE_OTORISASI_REVIEW%'
            )
        AND (a.JENIS_PRODUK LIKE '%GRIYA%')
        AND (
            SUBSTR(a.CREATE_DATE, 1, 10) = '${tgll}'
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        ${whereArea}
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
