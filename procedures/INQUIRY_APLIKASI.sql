CREATE OR REPLACE PROCEDURE ILOS.inquiry_aplikasi (
    no_apl IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
SELECT
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-IDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd') AS TGL_INPUT,
  a.NO_APLIKASI AS NO_APLIKASI,
  REPLACE(REPLACE(a.NAMA_CUSTOMER,'{value=',''),', storeType=java.lang.String}','') AS NAMA_NASABAH,
  REPLACE(REPLACE(a.JENIS_PRODUK,'{value=',''),', storeType=java.lang.String}','') AS JENIS_PRODUK,
  to_number(ILOS.f_get_value_clob(a.DATA,'jumlahPengajuan')) AS PLAFOND,
  CONCAT(CONCAT(b.BRANCH_CODE, ' - '), b.NAME) AS NAMA_CABANG,
CASE
    WHEN b.LVL = '2' THEN CONCAT(CONCAT(b.BRANCH_CODE, ' - '), b.NAME)
    WHEN b.LVL = '3' THEN (
        SELECT CONCAT(CONCAT(c.BRANCH_CODE, ' - '), c.NAME)
        FROM ILOS.TBL_BRANCH c
        WHERE c.BRANCH_CODE = b.PARENT_ID
    )
    ELSE ''
END AS NAMA_AREA,
  CASE
    WHEN b.LVL = '2' THEN (SELECT CONCAT(CONCAT(c.BRANCH_CODE, ' - '), c.NAME) FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE=b.PARENT_ID)
    WHEN b.LVL = '3' THEN (SELECT CONCAT(CONCAT(c.BRANCH_CODE, ' - '), c.NAME) FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE=b.PARENT_ADMINISTRASI)
    ELSE ''
  END AS REGION,
  CASE
    WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        (SELECT CONCAT(CONCAT(c.EVENT_NO, ' - '), c.EVENT_NAME) FROM ILOS.TBL_EVENT_PENSIUN c WHERE c.EVENT_NO=ILOS.f_get_value_clob(a.DATA,'kodeProgram'))
    WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        (SELECT CONCAT(CONCAT(c.EVENT_NO, ' - '), c.EVENT_NAME) FROM ILOS.TBL_EVENT_IMPLAN c WHERE c.EVENT_NO=ILOS.f_get_value_clob(a.DATA,'kodeProgram'))
    WHEN (a.JENIS_PRODUK LIKE '%GRIYA%') THEN
      (SELECT CONCAT(CONCAT(c.EVENT_NO, ' - '), c.EVENT_NAME) FROM ILOS.TBL_EVENT c WHERE c.EVENT_NO=ILOS.f_get_value_clob(a.DATA,'kodeProgram'))
  END AS EVENT,
  CASE 
    WHEN (a.FLOW_CODE LIKE '%REJECT%') THEN
      CASE
        WHEN ((SELECT COUNT(*) FROM ILOS.TBL_CANCEL_APLIKASI c WHERE c.NO_APLIKASI = a.NO_APLIKASI) > 0) THEN '88 - CANCEL'
        ELSE '99 - REJECT'
      END
    WHEN (a.FLOW_CODE NOT LIKE '%REJECT%') THEN
      CASE 
        WHEN (a.FLOW_CODE LIKE '%IDE%') THEN '10 - IDE'
        WHEN (a.FLOW_CODE LIKE '%DEDUPE%') THEN '11 - DEDUPE'
        WHEN (a.FLOW_CODE LIKE '%BI-CHECKING%') THEN '12 - iDEB'
        WHEN (a.FLOW_CODE LIKE '%UPLOAD-DOC%') THEN '13 - UPLOAD DOC'
        WHEN (a.FLOW_CODE LIKE '%DDE%') THEN '14 - DDE'
        WHEN (a.FLOW_CODE LIKE '%VERIN%') THEN '15 - VERIN'
        WHEN (a.FLOW_CODE LIKE '%OTORISASI-VERIN%') THEN '15 - VERIN'
        WHEN (a.FLOW_CODE LIKE '%APPROVAL%') THEN '16 - APPROVAL'
        WHEN (a.FLOW_CODE LIKE '%SP3%') THEN '17 - SP3'
        WHEN (a.FLOW_CODE LIKE '%ORDER-AKAD%') THEN '17 - SP3'
        WHEN (a.FLOW_CODE LIKE '%REVIEW-AKAD%') THEN '17 - SP3'
        WHEN (a.FLOW_CODE LIKE '%AKAD-DAN-PENCAIRAN%') THEN '18 - AKAD'
        WHEN (a.FLOW_CODE LIKE '%OTORISASI-AKAD-DAN-PENCAIRAN%') THEN '18 - AKAD'
        WHEN (a.FLOW_CODE LIKE '%REVIEW-DAN-PENCAIRAN%') THEN '19 - REVIEW'
        WHEN (a.FLOW_CODE LIKE '%OTORISASI-REVIEW-DAN-PENCAIRAN%') THEN '19 - REVIEW'
        WHEN (a.FLOW_CODE LIKE '%LIVE%') THEN '20 - LIVE'
        ELSE REPLACE(REPLACE(REPLACE(REPLACE(a.FLOW_CODE,'STAGE-',''),'-PENSIUN',''),'-IMPLAN',''),'-',' ')
      END
    ELSE ''
  END AS LAST_POSISI,
  a.CREATE_BY AS LAST_READ_BY,
  to_char((a.CREATE_DATE),'yyyy-mm-dd HH24:MI:SS') AS LAST_UPDATE,
  CASE
    WHEN ((SELECT count(*) FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%') = 0) THEN 
    (SELECT count(*) FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%')
    WHEN ((SELECT count(*) FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%') > 0) THEN 
    ((SELECT count(*) FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE 'STAGE-UPLOAD-DOC-%') - 1)
  END AS JUM_RETURN,
  (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-IDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS PIC_IDE,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-IDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_IDE,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-IDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_IDE,
	CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_IDE,
    (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS PIC_DEDUPE,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_DEDUPE,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_DEDUPE,
	CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DEDUPE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_DEDUPE,
    (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS PIC_IDEB,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_IDEB,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_IDEB,
	CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-BI-CHECKING%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_IDEB,
  CASE
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        CASE 
          WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-PENSIUN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)IS NULL THEN
              (SELECT h.CREATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-PENSIUN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
          ELSE 
            (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-PENSIUN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
        END
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        CASE
          WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-IMPLAN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) IS NULL THEN 
            (SELECT h.CREATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-IMPLAN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
          ELSE 
            (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-IMPLAN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
        END
  END AS PIC_UPLOAD,
  CASE
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-PENSIUN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-IMPLAN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
  END AS IN_UPLOAD,
  CASE
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-PENSIUN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE ='STAGE-UPLOAD-DOC-IMPLAN' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
  END AS OUT_UPLOAD,
  CASE
    WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN
      CONCAT(
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' hari '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / (60 * 60), 0)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' jam '
				)
			),
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / 60)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' menit '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-PENSIUN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' detik'
				)
			)
		)
    WHEN (a.JENIS_PRODUK  LIKE '%MITRAGUNA%') THEN
      CONCAT(
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' hari '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / (60 * 60), 0)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' jam '
				)
			),
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / 60)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' menit '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-UPLOAD-DOC-IMPLAN%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' detik'
				)
			)
		)
  END AS SLA_UPLOAD,
  (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS PIC_DDE,
  (SELECT us.BRANCH_CODE FROM ILOS.TBL_APLIKASI_HIST h INNER JOIN ILOS.TBL_USER us ON us.USER_ID = h.UPDATE_BY WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS BRANCH_DDE,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_DDE,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-DDE%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_DDE,
  CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-DDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_DDE,
  CASE
    WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) IS NULL THEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-VERIN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
    ELSE (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) 
  END AS PIC_VERIN,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-VERIN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_VERIN,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_VERIN,
  CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-VERIN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_VERIN,
    (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) AS PIC_APPROVAL,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_APPROVAL,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_APPROVAL,
  CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-APPROVAL%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_APPROVAL,
    CASE	
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-SP3%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        CASE
          WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) IS NULL THEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
          ELSE (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
        END
    END AS PIC_SP3,
    CASE	
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-SP3%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
    END AS IN_SP3,
    CASE	
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-SP3%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS')
    END AS OUT_SP3,
    CASE	
      WHEN (a.JENIS_PRODUK LIKE '%PENSIUN%') THEN 
        CONCAT(
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' hari '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / (60 * 60), 0)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' jam '
				)
			),
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / 60)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' menit '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-SP3%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' detik'
				)
			)
		)
      WHEN (a.JENIS_PRODUK LIKE '%MITRAGUNA%') THEN
        CONCAT(
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' hari '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / (60 * 60), 0)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' jam '
				)
			),
			CONCAT(
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds      / 60)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' menit '
				),
				CONCAT(
					CAST(
						CAST(
							ROUND(
								(
									SELECT ROUND (totalSeconds)
									FROM
									(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
									FROM
										(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
										FROM (
											SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-REVIEW-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t1
										JOIN 
										(
											SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
											FROM ILOS.TBL_APLIKASI_HIST h 
											WHERE h.NO_APLIKASI=a.NO_APLIKASI 
											AND h.FLOW_CODE LIKE '%STAGE-ORDER-AKAD%' 
											ORDER BY h.CREATE_DATE 
											DESC FETCH FIRST 1 ROWS ONLY
										) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
									)
									)
								), 0
							) AS INT
						) AS VARCHAR(40)
					),' detik'
				)
			)
		)
    END AS SLA_SP3,
  CASE
    WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) IS NULL THEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
    ELSE (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)  
  END AS PIC_AKAD,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_AKAD,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_AKAD,
  CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-AKAD-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_AKAD,
  CASE
    WHEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY) IS NULL THEN (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
    ELSE (SELECT h.UPDATE_BY FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY)
  END AS PIC_REVIEW,
  to_char((SELECT h.CREATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS IN_REVIEW,
  to_char((SELECT h.UPDATE_DATE FROM ILOS.TBL_APLIKASI_HIST h WHERE h.NO_APLIKASI=a.NO_APLIKASI AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' ORDER BY h.CREATE_DATE DESC FETCH FIRST 1 ROWS ONLY),'yyyy-mm-dd HH24:MI:SS') AS OUT_REVIEW,
  CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.UPDATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-REVIEW-DAN-PENCAIRAN%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS SLA_REVIEW,
    CONCAT(
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds / (24 * 60 * 60), 1)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%LIVE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' hari '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / (60 * 60), 0)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%LIVE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' jam '
			)
		),
		CONCAT(
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds      / 60)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%LIVE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' menit '
			),
			CONCAT(
				CAST(
					CAST(
						ROUND(
							(
								SELECT ROUND (totalSeconds)
								FROM
								(SELECT ROUND ( EXTRACT (DAY FROM timeDiff) * 24 * 60 * 60 + EXTRACT (HOUR FROM timeDiff) * 60 * 60 + EXTRACT (MINUTE FROM timeDiff) * 60 + EXTRACT (SECOND FROM timeDiff)) totalSeconds
								FROM
									(SELECT TO_TIMESTAMP(TO_CHAR( t1.Table1  , 'yyyy-mm-dd HH24:mi:ss'), 'yyyy-mm-dd HH24:mi:ss') - TO_TIMESTAMP(TO_CHAR(t2.Table2, 'yyyy-mm-dd HH24:mi:ss'),'yyyy-mm-dd HH24:mi:ss') timeDiff
									FROM (
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS Table1
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%LIVE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t1
									JOIN 
									(
										SELECT h.NO_APLIKASI,h.CREATE_DATE AS table2
										FROM ILOS.TBL_APLIKASI_HIST h 
										WHERE h.NO_APLIKASI=a.NO_APLIKASI 
										AND h.FLOW_CODE LIKE '%STAGE-IDE%' 
										ORDER BY h.CREATE_DATE 
										DESC FETCH FIRST 1 ROWS ONLY
									) t2 ON t1.NO_APLIKASI=t2.NO_APLIKASI
								)
								)
							), 0
						) AS INT
					) AS VARCHAR(40)
				),' detik'
			)
		)
	) AS TOTAL_SLA_LIVE,
    p.NAMA_PRODUCT AS TIPE_PRODUK,
    a.FLOW_CODE,
    a.BRANCH_CODE
FROM
  ILOS.TBL_APLIKASI a
INNER JOIN ILOS.TBL_PRODUCT p ON p.KODE_PRODUCT = REPLACE(REPLACE(a.TIPE_PRODUK,'{value=',''),', storeType=java.lang.String}','')
INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
WHERE a.NO_APLIKASI = no_apl ;
END inquiry_aplikasi;