CREATE OR REPLACE PROCEDURE ILOS.pending_progress_detail (
    p_tglawal IN VARCHAR2,
    p_tglakhir IN VARCHAR2,
    p_kode_region IN VARCHAR2,
    p_kode_area IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
)
IS
    v_sql CLOB;
    v_where_area CLOB := '';
   	v_where_tgl CLOB := '';
BEGIN
	IF p_tglawal = p_tglakhir THEN
		v_where_tgl := 'AND (a.NO_APLIKASI >= ''' || p_tglawal || ''')';
	ELSE 
		v_where_tgl := 'AND (a.NO_APLIKASI >= ''' || p_tglawal || ''' 
			AND a.NO_APLIKASI <= ''' || p_tglakhir || ''')';
	END IF;
	
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
        TO_CHAR((
            SELECT h.CREATE_DATE
            FROM ILOS.TBL_APLIKASI_HIST h
            WHERE h.NO_APLIKASI = a.NO_APLIKASI
            AND h.FLOW_CODE LIKE ''%STAGE-IDE%''
            ORDER BY h.CREATE_DATE DESC
            FETCH FIRST 1 ROWS ONLY
        ), ''yyyy-mm-dd'') AS TGL_INPUT,

        a.NO_APLIKASI,

        REPLACE(REPLACE(a.NAMA_CUSTOMER, ''{value='', ''''), '', storeType=java.lang.String}'', '''') AS NAMA_NASABAH,
        REPLACE(REPLACE(a.JENIS_PRODUK, ''{value='', ''''), '', storeType=java.lang.String}'', '''') AS JENIS_PRODUK,

        CASE
            WHEN a.JENIS_PRODUK LIKE ''%PENSIUN%'' THEN (
            SELECT c.EVENT_NO || '' - '' || c.EVENT_NAME
            FROM ILOS.TBL_EVENT_PENSIUN c
            WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, ''kodeProgram'')
            )
            WHEN a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' THEN (
            SELECT c.EVENT_NO || '' - ''  || c.EVENT_NAME
            FROM ILOS.TBL_EVENT_IMPLAN c
            WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, ''kodeProgram'')
            )
            WHEN a.JENIS_PRODUK LIKE ''%GRIYA%'' THEN (
            SELECT c.EVENT_NO || '' - '' || c.EVENT_NAME
            FROM ILOS.TBL_EVENT c
            WHERE c.EVENT_NO = ILOS.f_get_value_clob(a.DATA, ''kodeProgram'')
            )
        END AS EVENT,

        TO_NUMBER(ILOS.f_get_value_clob(a.DATA, ''jumlahPengajuan'')) AS PLAFOND,

        b.BRANCH_CODE || '' - '' || b.NAME AS NAMA_CABANG,

        CASE
            WHEN b.LVL = ''2'' THEN b.BRANCH_CODE || '' - '' || b.NAME
            WHEN b.LVL = ''3'' THEN (
            SELECT c.BRANCH_CODE || '' - '' || c.NAME
            FROM ILOS.TBL_BRANCH c
            WHERE c.BRANCH_CODE = b.PARENT_ID
            )
            ELSE ''''
        END AS NAMA_AREA,

        CASE
            WHEN b.LVL = ''2'' THEN (
            SELECT c.BRANCH_CODE || '' - '' || c.NAME
            FROM ILOS.TBL_BRANCH c
            WHERE c.BRANCH_CODE = b.PARENT_ID
            )
            WHEN b.LVL = ''3'' THEN (
            SELECT c.BRANCH_CODE || '' - '' || c.NAME
            FROM ILOS.TBL_BRANCH c
            WHERE c.BRANCH_CODE = b.PARENT_ADMINISTRASI
            )
            ELSE ''''
        END AS REGION,

        CASE
            WHEN a.FLOW_CODE LIKE ''%REJECT%'' THEN
            CASE
                WHEN (
                SELECT COUNT(*)
                FROM ILOS.TBL_CANCEL_APLIKASI c
                WHERE c.NO_APLIKASI = a.NO_APLIKASI
                ) > 0 THEN ''88 - CANCEL''
                ELSE ''99 - REJECT''
            END
            ELSE
            CASE
                WHEN a.FLOW_CODE LIKE ''%IDE%'' THEN ''10 - IDE''
                WHEN a.FLOW_CODE LIKE ''%DEDUPE%'' THEN ''11 - DEDUPE''
                WHEN a.FLOW_CODE LIKE ''%BI-CHECKING%'' THEN ''12 - iDEB''
                WHEN a.FLOW_CODE LIKE ''%UPLOAD-DOC%'' THEN ''13 - UPLOAD DOC''
                WHEN a.FLOW_CODE LIKE ''%DDE%'' THEN ''14 - DDE''
                WHEN a.FLOW_CODE LIKE ''STAGE-VERIN%'' THEN ''15 - VERIN''
                WHEN a.FLOW_CODE LIKE ''STAGE-OTORISASI-VERIN%'' THEN ''151 - OTOR VERIN''
                WHEN a.FLOW_CODE LIKE ''%APPROVAL%'' THEN ''16 - APPROVAL''
                WHEN a.FLOW_CODE LIKE ''%SP3%'' THEN ''17 - SP3''
                WHEN a.FLOW_CODE LIKE ''%ORDER-AKAD%'' THEN ''17 - SP3''
                WHEN a.FLOW_CODE LIKE ''%REVIEW-AKAD%'' THEN ''17 - SP3''
                WHEN a.FLOW_CODE LIKE ''STAGE-AKAD-DAN-PENCAIRAN%'' THEN ''18 - AKAD''
                WHEN a.FLOW_CODE LIKE ''STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%'' THEN ''181 - OTOR AKAD''
                WHEN a.FLOW_CODE LIKE ''STAGE-REVIEW-DAN-PENCAIRAN%'' THEN ''19 - REVIEW''
                WHEN a.FLOW_CODE LIKE ''STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%'' THEN ''191 - OTOR REVIEW''
                WHEN a.FLOW_CODE LIKE ''%LIVE%'' THEN ''20 - LIVE''
                ELSE REPLACE(REPLACE(REPLACE(REPLACE(a.FLOW_CODE, ''STAGE-'', ''''), ''-PENSIUN'', ''''), ''-IMPLAN'', ''''), ''-'', '' '')
            END
        END AS LAST_POSISI,

        a.CREATE_BY AS LAST_READ_BY,
        usr.NAME AS LAST_READ_BY_NAME,
        TO_CHAR(a.CREATE_DATE, ''yyyy-mm-dd HH24:MI:SS'') AS LAST_UPDATE,

        CASE
            WHEN (
            SELECT COUNT(*)
            FROM ILOS.TBL_APLIKASI_HIST h
            WHERE h.NO_APLIKASI = a.NO_APLIKASI
                AND h.FLOW_CODE LIKE ''STAGE-UPLOAD-DOC-%''
            ) = 0 THEN 0
            ELSE (
            SELECT COUNT(*)
            FROM ILOS.TBL_APLIKASI_HIST h
            WHERE h.NO_APLIKASI = a.NO_APLIKASI
                AND h.FLOW_CODE LIKE ''STAGE-UPLOAD-DOC-%''
            ) - 1
        END AS JUM_RETURN,

        (
            SELECT us.BRANCH_CODE
            FROM ILOS.TBL_APLIKASI_HIST h
            INNER JOIN ILOS.TBL_USER us ON us.USER_ID = h.UPDATE_BY
            WHERE h.NO_APLIKASI = a.NO_APLIKASI
            AND h.FLOW_CODE LIKE ''%STAGE-DDE%''
            ORDER BY h.CREATE_DATE DESC
            FETCH FIRST 1 ROWS ONLY
        ) AS BRANCH_DDE

        FROM ILOS.TBL_APLIKASI a
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        INNER JOIN ILOS.TBL_USER usr ON usr.USER_ID = a.CREATE_BY
        WHERE (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'')
        AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')'|| v_where_tgl || v_where_area||'
    ';

    -- Buka cursor
    OPEN p_cursor FOR v_sql;
END;