CREATE OR REPLACE PROCEDURE ILOS.akumulasi_realtime_chart (
    p_cursor OUT SYS_REFCURSOR
)
IS
	v_sql CLOB;
BEGIN
	v_sql:= '
	SELECT
		REGION,
        KODE_AREA,
        NAMA_AREA,
        COUNT(*) AS TOTAL_APLIKASI,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%IDE%'') THEN 1 ELSE NULL END) END) AS IDE,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%DEDUPE%'') THEN 1 ELSE NULL END) END) AS DEDUPE,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%BI-CHECKING%'') THEN 1 ELSE NULL END) END) AS IDEB,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%UPLOAD-DOC%'') THEN 1 ELSE NULL END) END) AS UPLOAD_DOC,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%DDE%'') THEN 1 ELSE NULL END) END) AS DDE,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-VERIN%'')) THEN 1 ELSE NULL END) END) AS VERIN,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-OTORISASI-VERIN%'')) THEN 1 ELSE NULL END) END) AS OTOR_VERIN,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%APPROVAL%'') THEN 1 ELSE NULL END) END) AS APPROVAL,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''%SP3%'') OR (FLOW_CODE LIKE ''%ORDER-AKAD%'') OR (FLOW_CODE LIKE ''%REVIEW-AKAD%'')) THEN 1 ELSE NULL END) END) AS SP3,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-AKAD-DAN-PENCAIRAN%'')) THEN 1 ELSE NULL END) END) AS AKAD,
            COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%'')) THEN 1 ELSE NULL END) END) AS OTOR_AKAD,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-REVIEW-DAN-PENCAIRAN%'')) THEN 1 ELSE NULL END) END) AS REVIEW,
            COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((FLOW_CODE LIKE ''STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%'')) THEN 1 ELSE NULL END) END) AS OTOR_REVIEW,
          COUNT(CASE WHEN (FLOW_CODE NOT LIKE ''%REJECT%'') THEN 
            (CASE WHEN (FLOW_CODE LIKE ''%LIVE%'') THEN 1 ELSE NULL END) END) AS LIVE,
          COUNT(CASE WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((SELECT COUNT(*) FROM ILOS.TBL_CANCEL_APLIKASI c WHERE c.NO_APLIKASI = a.NO_APLIKASI) > 0) THEN 1 ELSE NULL END) END) AS CANCEL,
          COUNT(CASE WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((SELECT COUNT(*) FROM ILOS.TBL_CANCEL_APLIKASI c WHERE c.NO_APLIKASI = a.NO_APLIKASI) <= 0) THEN 1 ELSE NULL END) END) AS REJECT,
          
      
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%IDE%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_IDE,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%DEDUPE%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_DEDUPE,
          
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%BI-CHECKING%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_IDEB,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%UPLOAD-DOC%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_UPLOAD,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%DDE%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_DDE,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((a.FLOW_CODE LIKE ''STAGE-VERIN%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_VERIN,
      
      (SELECT
          
          COUNT(*)
            
        FROM
          ILOS.TBL_APLIKASI a
        
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        
      WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((a.FLOW_CODE LIKE ''STAGE-OTORISASI-VERIN%'')) AND
      (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
      (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_OTOR_VERIN,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%APPROVAL%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_APPROVAL,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((a.FLOW_CODE LIKE ''%SP3%'') OR (a.FLOW_CODE LIKE ''%ORDER-AKAD%'') OR (a.FLOW_CODE LIKE ''%REVIEW-AKAD%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_SP3,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((a.FLOW_CODE LIKE ''STAGE-AKAD-DAN-PENCAIRAN%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_AKAD,
      
      (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((a.FLOW_CODE LIKE ''STAGE-OTORISASI-AKAD-DAN-PENCAIRAN%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_OTOR_AKAD,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((FLOW_CODE LIKE ''STAGE-REVIEW-DAN-PENCAIRAN%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_REVIEW,
      
      (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND ((FLOW_CODE LIKE ''STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN%'')) AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_OTOR_REVIEW,
      
          (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (A.FLOW_CODE NOT LIKE ''%REJECT%'') AND (a.FLOW_CODE LIKE ''%LIVE%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_LIVE,
      
          (SELECT
          
              COUNT(CASE WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((SELECT COUNT(*) FROM ILOS.TBL_CANCEL_APLIKASI c WHERE c.NO_APLIKASI = a.NO_APLIKASI) > 0) THEN 1 ELSE NULL END) END)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (a.FLOW_CODE LIKE ''%REJECT%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_CANCEL,
      
          (SELECT
          
              COUNT(CASE WHEN (FLOW_CODE LIKE ''%REJECT%'') THEN 
            (CASE WHEN ((SELECT COUNT(*) FROM ILOS.TBL_CANCEL_APLIKASI c WHERE c.NO_APLIKASI = a.NO_APLIKASI) <= 0) THEN 1 ELSE NULL END) END)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE  (a.FLOW_CODE LIKE ''%REJECT%'') AND
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_REJECT,
      
        (SELECT
          
              COUNT(*)
                
            FROM
              ILOS.TBL_APLIKASI a
            
            INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
            
          WHERE 
          (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
          (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')) AS SUM_TOTAL
      
      FROM 
      
      (	SELECT
          
          CASE
            WHEN b.LVL = ''2'' THEN b.BRANCH_CODE
            WHEN b.LVL = ''3'' THEN (SELECT c.BRANCH_CODE FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE=b.PARENT_ID)
            ELSE ''''
          END AS KODE_AREA,
          
          CASE
            WHEN b.LVL = ''2'' THEN CONCAT(CONCAT(b.BRANCH_CODE, '' - ''), b.NAME)
            WHEN b.LVL = ''3'' THEN (SELECT CONCAT(CONCAT(c.BRANCH_CODE, '' - ''), c.NAME) FROM ILOS.TBL_BRANCH c WHERE c.BRANCH_CODE=b.PARENT_ID)
            ELSE ''''
          END AS NAMA_AREA,
          
          a.FLOW_CODE,
       	rm.REGION,
          a.NO_APLIKASI
            
        FROM
          ILOS.TBL_APLIKASI a
        
        INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
        LEFT JOIN ILOS.TBL_BRANCH p ON p.BRANCH_CODE = b.PARENT_ID
	    LEFT JOIN REPORTFF.REGION_MAPPING RM ON RM.KODE_AREA = CASE 
	        WHEN b.LVL = ''2'' THEN 
	            b.BRANCH_CODE 
	        WHEN b.LVL = ''3'' THEN
	            p.BRANCH_CODE
	        END 
      WHERE 
      (a.JENIS_PRODUK LIKE ''%MITRAGUNA%'' OR a.JENIS_PRODUK LIKE ''%PENSIUN%'') AND
      (a.NO_APLIKASI > ''20190615'') AND (a.FLOW_CODE NOT LIKE ''%_HOLD%'')
      
      ) A
      
      GROUP BY KODE_AREA,NAMA_AREA,REGION
      
      ORDER BY NAMA_AREA
	';
    OPEN p_cursor FOR v_sql;
END;