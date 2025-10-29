
import { executeQuery } from "@/lib/oracle";
import { NextResponse } from 'next/server';
import oracledb from "oracledb";
import { getTableColumns } from "@/lib/oracle-metadata";

const TABLE_OWNER = "ILOS";
const TABLE_NAME = "TBL_APLIKASI_HIST";

const FLOW_CODE_LABELS = [
    { pattern: /CANCEL/, label: "88 - CANCEL" },
    { pattern: /REJECT/, label: "99 - REJECT" },
    { pattern: /STAGE-OTORISASI-REVIEW-DAN-PENCAIRAN/, label: "191 - OTOR REVIEW" },
    { pattern: /STAGE-REVIEW-DAN-PENCAIRAN/, label: "19 - REVIEW" },
    { pattern: /STAGE-OTORISASI-AKAD-DAN-PENCAIRAN/, label: "181 - OTOR AKAD" },
    { pattern: /STAGE-AKAD-DAN-PENCAIRAN/, label: "18 - AKAD" },
    { pattern: /STAGE-SP-3|STAGE-SP3|ORDER-AKAD|REVIEW-AKAD/, label: "17 - SP3" },
    { pattern: /APPROVAL/, label: "16 - APPROVAL" },
    { pattern: /STAGE-OTORISASI-VERIFIKASI/, label: "151 - OTOR VERIN" },
    { pattern: /STAGE-VERIFIKASI|STAGE-VERIN/, label: "15 - VERIN" },
    { pattern: /STAGE-DDE|DDE/, label: "14 - DDE" },
    { pattern: /UPLOAD-DOC/, label: "13 - UPLOAD DOC" },
    { pattern: /BI-CHECKING|IDEB/, label: "12 - iDEB" },
    { pattern: /DEDUPE/, label: "11 - DEDUPE" },
    { pattern: /IDE/, label: "10 - IDE" },
    { pattern: /LIVE/, label: "20 - LIVE" },
    { pattern: /HOLD/, label: "00 - HOLD" },
];

const buildCoalesceExpr = (expressions) => {
    if (expressions.length === 0) return null;
    if (expressions.length === 1) return expressions[0];
    return `COALESCE(${expressions.join(", ")})`;
};

const stageLabelFromFlowCode = (flowCodeRaw = "") => {
    if (!flowCodeRaw) return "";
    const upper = String(flowCodeRaw).toUpperCase();
    for (const { pattern, label } of FLOW_CODE_LABELS) {
        if (pattern.test(upper)) {
            return label;
        }
    }
    return upper
        .replace(/^STAGE-/, "")
        .replace(/-PENSIUN| -PENSIUN/gi, "")
        .replace(/-IMPLAN| -IMPLAN/gi, "")
        .replace(/-/g, " ")
        .trim();
};

async function fetchHistoryMemo(noAplikasi) {
    if (!noAplikasi) return [];

    const columnsSet = await getTableColumns({
        owner: TABLE_OWNER,
        table: TABLE_NAME,
    });

    const hasColumn = (name) => columnsSet.has(String(name || "").toUpperCase());

    const stageExpr = hasColumn("FLOW_CODE") ? "h.FLOW_CODE" : "NULL";

    const picSources = [];
    if (hasColumn("UPDATE_BY")) picSources.push("h.UPDATE_BY");
    if (hasColumn("CREATE_BY")) picSources.push("h.CREATE_BY");
    const picExpr = buildCoalesceExpr(picSources) || "NULL";

    const dateSources = [];
    if (hasColumn("UPDATE_DATE")) dateSources.push("h.UPDATE_DATE");
    if (hasColumn("CREATE_DATE")) dateSources.push("h.CREATE_DATE");
    const dateExpr = buildCoalesceExpr(dateSources) || "NULL";

    const memoSources = [];
    if (hasColumn("MEMO")) memoSources.push("h.MEMO");
    if (hasColumn("KETERANGAN")) memoSources.push("h.KETERANGAN");
    if (hasColumn("NOTE")) memoSources.push("h.NOTE");
    if (hasColumn("CATATAN")) memoSources.push("h.CATATAN");
    const memoExpr = buildCoalesceExpr(memoSources) || "NULL";

    const picSelect = `${picExpr} AS PIC_ID`;
    const picNameSelect =
        picExpr !== "NULL"
            ? `COALESCE(usr.NAME, ${picExpr}) AS PIC_NAME`
            : "NULL AS PIC_NAME";

    const userJoin =
        picExpr !== "NULL"
            ? `LEFT JOIN ILOS.TBL_USER usr ON usr.USER_ID = ${picExpr}`
            : "";

    const tanggalSelect =
        dateExpr !== "NULL"
            ? `TO_CHAR(${dateExpr}, 'YYYY-MM-DD HH24:MI:SS') AS TANGGAL_RAW`
            : "NULL AS TANGGAL_RAW";

    const orderExpr = dateExpr !== "NULL" ? dateExpr : "h.ROWID";

    const memoSelect = `${memoExpr} AS MEMO_RAW`;

    const query = `
        SELECT
            ${stageExpr} AS STAGE_RAW,
            ${picSelect},
            ${picNameSelect},
            ${tanggalSelect},
            ${memoSelect}
        FROM ILOS.${TABLE_NAME} h
        ${userJoin}
        WHERE h.NO_APLIKASI = :no_apl
        ORDER BY ${orderExpr} DESC
    `;

    try {
        const rows = await executeQuery(
            query,
            { no_apl: noAplikasi },
            { autoCommit: false }
        );

        if (!Array.isArray(rows)) return [];

        return rows.map((row) => {
            const stageRaw = row?.STAGE_RAW || "";
            const picId = row?.PIC_ID || "";
            const picName = row?.PIC_NAME || "";
            const tanggal = row?.TANGGAL_RAW || "";
            const memo = row?.MEMO_RAW || "";

            return {
                stageCode: stageRaw,
                stageLabel: stageLabelFromFlowCode(stageRaw),
                picId,
                picName,
                tanggal,
                memo,
            };
        });
    } catch (error) {
        console.error("Failed to fetch memo history:", error);
        return [];
    }
}


export async function GET(req) {
    try {
        //'20170427100030017',
        const p_no_apl = req.nextUrl.searchParams.get("no_apl");
        const rawPlatform = req.nextUrl.searchParams.get("platform") || "WISE";
        const platform = rawPlatform.toUpperCase();

        if (!p_no_apl) {
            return NextResponse.json(
                { success: false, message: "Parameter no_apl wajib diisi" },
                { status: 400 }
            );
        }

        if (platform !== "WISE") {
            return NextResponse.json({
                success: true,
                platform,
                data: [[], []],
                message: `DATA ${platform} TIDAK DITEMUKAN`,
            });
        }

        const query1 = `
            BEGIN
            ILOS.inquiry_aplikasi(:no_apl, :p_cursor);
            END;
        `;
        const binds = {
            no_apl: p_no_apl,
            p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        };


        const rows1 = await executeQuery(query1, binds);
        const rows2 = await fetchHistoryMemo(p_no_apl);
        const hasDetail = Array.isArray(rows1) && rows1.length > 0;
        const hasMemo = Array.isArray(rows2) && rows2.length > 0;
        const payloadMessage = !hasDetail && !hasMemo ? `DATA ${platform} TIDAK DITEMUKAN` : undefined;

        return NextResponse.json({
            success: true,
            platform,
            data: [rows1, rows2],
            message: payloadMessage,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
