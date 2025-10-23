CREATE OR REPLACE PROCEDURE ILOS.griya_pending_progress_cair (
    p_date_first IN VARCHAR2,
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

    -- Bangun SQL utama
    v_sql := '
        SELECT
            ''CAIR'' AS CATEGORY,
            (
                SELECT COUNT(*)
                FROM ILOS.TBL_APLIKASI a
                INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
                WHERE (a.FLOW_CODE NOT LIKE ''%REJECT%'')
                AND (a.FLOW_CODE LIKE ''%LIVE%'')
                AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
                AND (
                    a.NO_APLIKASI > ''20190615''
                    AND (
                        SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN ''' || p_date_first || ''' AND ''' || p_tgll || '''
                    )
                )
                AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
                ' || v_where_area || '
            ) AS "LAST",

            (
                SELECT COUNT(*)
                FROM ILOS.TBL_APLIKASI a
                INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
                WHERE (a.FLOW_CODE NOT LIKE ''%REJECT%'')
                AND (a.FLOW_CODE LIKE ''%LIVE%'')
                AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
                AND (
                    SUBSTR(a.CREATE_DATE, 1, 10) = ''' || p_tgll || '''
                    AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
                )
                ' || v_where_area || '
            ) AS "IN"
        FROM DUAL
		UNION ALL

SELECT
    ''CANCEL'' AS CATEGORY,
    (
        SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN (
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
            (a.FLOW_CODE LIKE ''%REJECT%'')
            AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
            AND (
                a.NO_APLIKASI > ''20190615''
                AND (SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN ''' || p_date_first || ''' AND ''' || p_tgll || ''')
            )
            AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') ' || v_where_area || '
    ) AS "LAST",
    (
        SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN (
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
        (a.FLOW_CODE LIKE ''%REJECT%'')
        AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = ''' || p_tgll || ''')
            AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        ) ' || v_where_area || '
    ) AS "IN"

FROM DUAL
UNION ALL
SELECT
    ''REJECT'' AS CATEGORY,
    (
    SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN (
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
        (a.FLOW_CODE LIKE ''%REJECT%'')
        AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
        AND (
            a.NO_APLIKASI > ''20190615''
            AND (SUBSTR(a.CREATE_DATE, 1, 10) BETWEEN ''' || p_date_first || ''' AND ''' || p_tgll || ''')
        )
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'') ' || v_where_area || '
) AS "LAST",
    (
    SELECT
        COUNT(
            CASE
                WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN (
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
        (a.FLOW_CODE LIKE ''%REJECT%'')
        AND (a.JENIS_PRODUK LIKE ''%GRIYA%'')
        AND (
            (SUBSTR(a.CREATE_DATE, 1, 10) = ''' || p_tgll || ''')
            AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
        ) ' || v_where_area || '
) AS "IN"

FROM DUAL
    ';

    -- Buka cursor
    OPEN p_cursor FOR v_sql;
END;