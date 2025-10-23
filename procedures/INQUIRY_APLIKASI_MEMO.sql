CREATE OR REPLACE PROCEDURE ILOS.inquiry_aplikasi_MEMO (
    no_apl IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
    SELECT
JSON_VALUE(DATA, '$.griya.memo.satge5.value') AS MEMO
FROM TBL_APLIKASI WHERE TBL_APLIKASI.NO_APLIKASI =  no_apl ;
END inquiry_aplikasi_MEMO;