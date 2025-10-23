CREATE OR REPLACE PROCEDURE ILOS.pending_progress_grafik (
    p_tgll IN VARCHAR2,
    p_kode_region IN VARCHAR2,
    p_kode_area IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
)
IS
    v_sql CLOB;
    v_where_area CLOB := '';
BEGIN
    -- Siapkan filter region
    IF p_kode_region IS NOT NULL AND p_kode_region != 'All' THEN
        v_where_area := v_where_area || '
            AND (
                CASE
                    WHEN b.LVL = ''2'' THEN (
                        SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
                    )
                    WHEN b.LVL = ''3'' THEN (
                        SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
                    )
                    ELSE NULL
                END
            ) = ''' || p_kode_region || ''' ';
    END IF;
   
    -- Siapkan filter area
    IF p_kode_area IS NOT NULL AND p_kode_area != 'All' THEN
        v_where_area := v_where_area || '
            AND (
                CASE
                    WHEN b.LVL = ''2'' THEN b.BRANCH_CODE
                    WHEN b.LVL = ''3'' THEN (
                        SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE = b.PARENT_ID
                    )
                    ELSE NULL
                END
            ) = ''' || p_kode_area || ''' ';
    END IF;
   
   IF v_where_area IS NULL THEN
    v_where_area := 'AND 1=1';
   END IF;

    -- Bangun SQL utama
    v_sql := '
	SELECT
    ''IDE'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE (A.FLOW_CODE NOT LIKE ''%REJECT%'') 
        AND (a.FLOW_CODE LIKE ''%IDE%'') 
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') 
        AND (a.NO_APLIKASI > ''20190615'' AND SUBSTR(a.CREATE_DATE,1,10) < '''|| p_tgll ||''') 
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
    ) AS "LAST",

    ''#1197f7'' as colorIN,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE (A.FLOW_CODE NOT LIKE ''%REJECT%'') 
        AND (a.FLOW_CODE LIKE ''%IDE%'') 
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') 
        AND (SUBSTR(a.CREATE_DATE,1,10) = '''|| p_tgll ||''') 
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
    ) AS "IN"

FROM DUAL

UNION ALL

SELECT
    ''DEDUPE'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE ''%REJECT%''
            AND a.FLOW_CODE LIKE ''%DEDUPE%''
            AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
            AND a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
            AND a.FLOW_CODE NOT LIKE ''%_HOLD%''
            '|| v_where_area||'
    ) AS "LAST",

    ''#1197f7'' as colorIN,
    (
        SELECT COUNT(*)
        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        WHERE
            a.FLOW_CODE NOT LIKE ''%REJECT%''
            AND a.FLOW_CODE LIKE ''%DEDUPE%''
            AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
            AND SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||'''
            AND a.FLOW_CODE NOT LIKE ''%_HOLD%''
            '|| v_where_area||'
    ) AS "IN"

FROM DUAL
UNION ALL
SELECT
    ''IDEB'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%BI-CHECKING%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#1197f7'' as colorIN,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%BI-CHECKING%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"

FROM DUAL
UNION ALL
SELECT
    ''UPLOAD_DOC'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%UPLOAD-DOC%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#1197f7'' as colorIN,
    (
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%UPLOAD-DOC%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL
SELECT
    ''DDE'' AS CATEGORY,
    ''#c40606'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%DDE%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ff3b3b'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (a.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%DDE%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL

UNION ALL
SELECT
    ''VERIN'' AS CATEGORY,
    ''#c40606'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-VERIFIKASI%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ff3b3b'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-VERIFIKASI%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL

UNION ALL

SELECT
    ''OTOR_VERIN'' AS CATEGORY,
    ''#c40606'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-VERIFIKASI%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ff3b3b'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-VERIFIKASI%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''VALID'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%VALID%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",
    
    ''#1197f7'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%VALID%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''APPROVAL'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%APPROVAL%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",
    
    ''#1197f7'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%APPROVAL%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''SP3'' AS CATEGORY,
    ''#b59a00'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-SP-3%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ffd903'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-SP-3%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''AKAD'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-AKAD%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#1197f7'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-AKAD%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''OTOR_AKAD'' AS CATEGORY,
    ''#005b9c'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-AKAD%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#1197f7'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-AKAD%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''REVIEW'' AS CATEGORY,
    ''#b59a00'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-REVIEW-DAN-PENCAIRAN%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ffd903'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-REVIEW-DAN-PENCAIRAN%'')
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
UNION ALL

SELECT
    ''OTOR_REVIEW'' AS CATEGORY,
    ''#b59a00'' as colorLAST,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%'') 
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND SUBSTR(a.CREATE_DATE, 1, 10) < '''|| p_tgll ||'''
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') '|| v_where_area||'
) AS "LAST",

    ''#ffd903'' as colorIN,
(
    SELECT
        COUNT(*)
    FROM
        ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
        (A.FLOW_CODE NOT LIKE ''%REJECT%'')
        AND (a.FLOW_CODE LIKE ''%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%'') 
        AND (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (SUBSTR(a.CREATE_DATE, 1, 10) = '''|| p_tgll ||''')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        '|| v_where_area||'
) AS "IN"
FROM DUAL
    ';

    -- Buka cursor
    OPEN p_cursor FOR v_sql;
END;