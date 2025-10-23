        SELECT
    'IDE' AS CATEGORY,
    '#005b9c' as colorLAST,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%IDE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
             __FILTER__ 
    ) AS "LAST",
    
    '#1197f7' as colorIN,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%IDE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
             __FILTER__ 
    ) AS "IN"

FROM DUAL
UNION ALL

SELECT
    'DEDUPE' AS CATEGORY,
    '#005b9c' as colorLAST,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%DEDUPE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND a.NO_APLIKASI > '20190615'
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
             __FILTER__ 
    ) AS "LAST",

    '#1197f7' as colorIN,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE '%REJECT%'
            AND a.FLOW_CODE LIKE '%DEDUPE%'
            AND a.JENIS_PRODUK LIKE '%GRIYA%'
            AND SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            AND a.FLOW_CODE NOT LIKE '%_HOLD%'
             __FILTER__ 
    ) AS "IN"

FROM DUAL
UNION ALL
SELECT
    'IDEB' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            (SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll)
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        )  __FILTER__ 
) AS "IN"

FROM DUAL
UNION ALL
SELECT
    'UPLOAD_DOC' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            (SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll)
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
        )  __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL
SELECT
    'DDE' AS CATEGORY,
    '#c40606' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ff3b3b' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL

UNION ALL
SELECT
    'VERIN' AS CATEGORY,
    '#c40606' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ff3b3b' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
          __FILTER__ 
) AS "IN"
FROM DUAL

UNION ALL

SELECT
    'OTOR_VERIN' AS CATEGORY,
    '#c40606' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ff3b3b' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_KJPP' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'APPRAISAL' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_APPRAISAL' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'APPROVAL' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'SP3' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_NOTARIS' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'ORDER_NOTARIS_FOG' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_ORDER_NOTARIS' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'AKAD' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_AKAD' AS CATEGORY,
    '#005b9c' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#1197f7' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'REVIEW' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    'OTOR_REVIEW' AS CATEGORY,
    '#b59a00' as colorLAST,
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
            AND SUBSTR(a.CREATE_DATE, 1, 10) < :p_tgll
        )
        AND (a.FLOW_CODE NOT LIKE '%_HOLD%')  __FILTER__ 
) AS "LAST",

    '#ffd903' as colorIN,
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
            SUBSTR(a.CREATE_DATE, 1, 10) = :p_tgll
            )
            AND (a.FLOW_CODE NOT LIKE '%_HOLD%')
         __FILTER__ 
) AS "IN"
FROM DUAL
    