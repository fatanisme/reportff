import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { executeQuery } from "@/lib/oracle";
import { authOptions } from "../auth/[...nextauth]/route";

async function findPreviousStage(noAplikasi, connectionName = "default") {
  const sanitizedNoAplikasi = (noAplikasi ?? "").toString().trim();
  if (!sanitizedNoAplikasi) {
    return { flowCode: "" };
  }

  const previousStageQuery = `
    SELECT a.FLOW_CODE
      FROM ILOS.TBL_APLIKASI_HIST a
     WHERE a.NO_APLIKASI = :no_apl
       AND a.FLOW_CODE LIKE '%OTORISASI%'
       AND a.FLOW_CODE LIKE '%REVIEW%'
     ORDER BY a.CREATE_DATE DESC
     FETCH FIRST 1 ROW ONLY
  `;

  const rows = await executeQuery(previousStageQuery, { no_apl: sanitizedNoAplikasi }, { connectionName });
  if (!Array.isArray(rows) || rows.length === 0) {
    return { flowCode: "" };
  }

  const flowCode = rows[0]?.FLOW_CODE ?? "";
  const normalizedFlowCode = typeof flowCode === "string" ? flowCode.trim() : "";

  return { flowCode: normalizedFlowCode };
}

function extractClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "0.0.0.0";
}

function buildActionDescription(type = "", memo = "") {
  const typeMap = {
    reset: "RESET_ONE_UP_LEVEL",
    otor: "OTOR_LIVE",
    hold: "BUKA_HOLD",
    back: "BACK_TO_REVIEW",
    cancel: "CANCEL_REQUEST",
  };

  const normalizedType = (type || "").toLowerCase();
  const memoValue = memo?.trim() || "";
  if (normalizedType === "cancel") {
    const cancelLabel = memoValue
      ? `Cancel Request : ${memoValue}`
      : "Cancel Request";
    return cancelLabel.trim();
  }
  if (normalizedType === "hold") {
    const holdLabel = memoValue
      ? `Buka Hold : ${memoValue}`
      : "Buka Hold";
    return holdLabel.trim();
  }
  const label = typeMap[normalizedType] || normalizedType.toUpperCase() || "UNKNOWN";
  return `TASK ${label} : ${memoValue}`.trim();
}

const REJECTED_SUFFIX_PATTERN = /[-_]REJECTED/gi;
const HOLD_SUFFIX_PATTERN = /[-_]HOLD/gi;

function stripSuffix(flowCode = "", suffixPattern = null) {
  if (!flowCode) {
    return "";
  }

  const stringValue = flowCode.toString();
  if (!suffixPattern) {
    return stringValue.trim();
  }
  return stringValue.replace(suffixPattern, "").trim();
}

export async function GET(request) {
  const url = request.nextUrl;
  const NO_APL = (url.searchParams.get("no_apl") || "").trim();
  const type = (url.searchParams.get("type") || "").toLowerCase();
  const emptyResponse = { data: [], previousStage: "", history: [] };
  const CONNECTION_NAME = "itHelpdesk";

  if (!NO_APL) {
    return NextResponse.json(emptyResponse);
  }

  if (!type || type === "reset") {
    const applicationQuery = `
      SELECT
        a.NO_APLIKASI,
        a.FLOW_CODE,
        TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE
      FROM ILOS.TBL_APLIKASI a
      WHERE a.NO_APLIKASI = :no_apl
      FETCH FIRST 1 ROW ONLY
    `;

    const historyQuery = `
      SELECT
        TO_CHAR(o.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
        o.NO_APLIKASI,
        o.BRANCH_CODE,
        o.FLOW_CODE,
        o.CREATE_BY,
        o.USER_ID
      FROM ILOS.TBL_ONE_UP_LEVEL o
      WHERE o.NO_APLIKASI = :no_apl
      ORDER BY o.CREATE_DATE DESC
    `;

    try {
      const [applicationRows, historyRows] = await Promise.all([
        executeQuery(applicationQuery, { no_apl: NO_APL }, { connectionName: CONNECTION_NAME }),
        executeQuery(historyQuery, { no_apl: NO_APL }, { connectionName: CONNECTION_NAME }),
      ]);
      const applications = Array.isArray(applicationRows) ? applicationRows : [];
      const history = Array.isArray(historyRows) ? historyRows : [];

      return NextResponse.json({
        data: applications,
        previousStage: "",
        history,
      });
    } catch (error) {
      console.error("Error fetch it help desk task (reset):", error);
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 }
      );
    }
  }

  if (type === "back") {
    const historyQuery = `
      SELECT
        TO_CHAR(h.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
        h.NO_APLIKASI,
        a.NAMA_CUSTOMER AS NAMA_NASABAH,
        a.JENIS_PRODUK AS JENIS_PRODUK,
        a.FLOW_CODE AS LAST_POSISI
      FROM ILOS.TBL_APLIKASI_HIST h
      LEFT JOIN ILOS.TBL_APLIKASI a ON a.NO_APLIKASI = h.NO_APLIKASI
      WHERE h.NO_APLIKASI = :no_apl
      ORDER BY h.CREATE_DATE DESC
      FETCH FIRST 1 ROW ONLY
    `;

    try {
      const rows = await executeQuery(historyQuery, { no_apl: NO_APL }, { connectionName: CONNECTION_NAME });
      const records = Array.isArray(rows) ? rows : [];

      const previousStageInfo = await findPreviousStage(NO_APL, CONNECTION_NAME);
      const previousStage = previousStageInfo.flowCode;

      return NextResponse.json({ data: records, previousStage, history: [] });
    } catch (error) {
      console.error("Error fetch it help desk task:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 }
      );
    }
  }

  if (type === "cancel") {
    const applicationQuery = `
      SELECT
        TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
        a.NO_APLIKASI,
        a.NAMA_CUSTOMER AS NAMA_NASABAH,
        a.JENIS_PRODUK AS JENIS_PRODUK,
        a.FLOW_CODE AS LAST_POSISI
      FROM ILOS.TBL_APLIKASI a
      WHERE a.NO_APLIKASI = :no_apl
      FETCH FIRST 1 ROW ONLY
    `;

    try {
      const rows = await executeQuery(applicationQuery, { no_apl: NO_APL }, { connectionName: CONNECTION_NAME });
      const records = Array.isArray(rows) ? rows : [];

      const firstRow = records[0] ?? {};
      const currentFlow =
        firstRow?.LAST_POSISI ??
        firstRow?.FLOW_CODE ??
        "";
      const previousStage = stripSuffix(currentFlow, REJECTED_SUFFIX_PATTERN);

      return NextResponse.json({ data: records, previousStage, history: [] });
    } catch (error) {
      console.error("Error fetch it help desk task (cancel):", error);
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 }
      );
    }
  }

  if (type === "hold") {
    const applicationQuery = `
      SELECT
        TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
        a.NO_APLIKASI,
        a.NAMA_CUSTOMER AS NAMA_NASABAH,
        a.JENIS_PRODUK AS JENIS_PRODUK,
        a.FLOW_CODE AS LAST_POSISI
      FROM ILOS.TBL_APLIKASI a
      WHERE a.NO_APLIKASI = :no_apl
      FETCH FIRST 1 ROW ONLY
    `;

    try {
      const rows = await executeQuery(applicationQuery, { no_apl: NO_APL }, { connectionName: CONNECTION_NAME });
      const records = Array.isArray(rows) ? rows : [];

      const firstRow = records[0] ?? {};
      const currentFlow =
        firstRow?.LAST_POSISI ??
        firstRow?.FLOW_CODE ??
        "";
      const normalizedFlow = currentFlow.toString().toLowerCase();

      const hasHoldSuffix =
        normalizedFlow.endsWith("_hold") || normalizedFlow.endsWith("-hold");
      const previousStage = hasHoldSuffix
        ? stripSuffix(currentFlow, HOLD_SUFFIX_PATTERN)
        : "";

      return NextResponse.json({ data: records, previousStage, history: [] });
    } catch (error) {
      console.error("Error fetch it help desk task (hold):", error);
      return NextResponse.json(
        { error: "Gagal mengambil data" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(emptyResponse);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const rawNoAplikasi = body?.no_apl ?? body?.noAplikasi ?? "";
  const memo = (body?.memo ?? "").toString().trim();
  const type = (body?.type ?? "").toString().trim().toLowerCase();
  const CONNECTION_NAME = "itHelpdesk";

  const noAplikasi = rawNoAplikasi.toString().trim();

  if (!noAplikasi) {
    return NextResponse.json(
      { error: "Nomor aplikasi wajib diisi" },
      { status: 400 }
    );
  }

  const allowedTypes = new Set(["back", "cancel", "reset", "hold"]);
  if (type && !allowedTypes.has(type)) {
    return NextResponse.json(
      { error: "Tipe pencarian tidak didukung" },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const actionBy =
      session.user?.userId ??
      session.user?.id ??
      session.user?.email ??
      session.user?.name ??
      "Unknown";
    const ipAddress = extractClientIp(request);
    const responseActionDate = new Date().toISOString();

    if (type === "reset") {
      if (!memo) {
        return NextResponse.json(
          { error: "Memo wajib diisi" },
          { status: 400 }
        );
      }

      await executeQuery(
        `DELETE FROM ILOS.TBL_ONE_UP_LEVEL WHERE NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );

      const resetActionDescription = `RESET ONE UP LEVEL : ${memo}`.trim();

      await executeQuery(
        `INSERT INTO REPORTFF.HISTORY_HELPDESK (NO_APP, ACTION_DESC, ACTION_BY, ACTION_DATE, IP_ADDRESS)
         VALUES (:no_app, :action_desc, :action_by, CURRENT_TIMESTAMP, :ip_address)`,
        {
          no_app: noAplikasi,
          action_desc: resetActionDescription,
          action_by: actionBy,
          ip_address: ipAddress,
        },
        { connectionName: CONNECTION_NAME }
      );

      return NextResponse.json({
        message: "Reset One Up Level berhasil diproses",
        memo,
        history: {
          no_app: noAplikasi,
          action_desc: resetActionDescription,
          action_by: actionBy,
          action_date: responseActionDate,
          ip_address: ipAddress,
        },
      });
    }

    let currentFlowCode = "";
    let targetFlowCode = "";
    let responsePreviousStage = "";

    if (type === "back" || type === "cancel" || type === "hold") {
      if (!memo) {
        return NextResponse.json(
          { error: "Memo wajib diisi" },
          { status: 400 }
        );
      }

      const applicationResult = await executeQuery(
        `SELECT FLOW_CODE FROM ILOS.TBL_APLIKASI WHERE NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );

      const applicationRows = Array.isArray(applicationResult) ? applicationResult : [];
      if (applicationRows.length === 0) {
        return NextResponse.json(
          { error: "Data aplikasi tidak ditemukan" },
          { status: 404 }
        );
      }

      currentFlowCode = (applicationRows[0]?.FLOW_CODE ?? "").toString().trim();
      const normalizedFlowCode = currentFlowCode.toLowerCase();

      if (type === "back" && !normalizedFlowCode.includes("live")) {
        return NextResponse.json(
          { error: "Flow code aplikasi tidak dalam status LIVE" },
          { status: 400 }
        );
      }

      const cancelEligible =
        normalizedFlowCode.endsWith("-rejected") ||
        normalizedFlowCode.endsWith("_rejected");
      if (type === "cancel" && !cancelEligible) {
        return NextResponse.json(
          { error: "Flow code aplikasi tidak dalam status REJECTED" },
          { status: 400 }
        );
      }

      const holdEligible =
        normalizedFlowCode.endsWith("_hold") || normalizedFlowCode.endsWith("-hold");
      if (type === "hold" && !holdEligible) {
        return NextResponse.json(
          { error: "Flow code aplikasi tidak dalam status HOLD" },
          { status: 400 }
        );
      }

      if (type === "cancel" || type === "hold") {
        const suffixPattern =
          type === "cancel" ? REJECTED_SUFFIX_PATTERN : HOLD_SUFFIX_PATTERN;
        const cleanedFlowCode = stripSuffix(currentFlowCode, suffixPattern);
        if (!cleanedFlowCode) {
          return NextResponse.json(
            { error: "Flow code tujuan tidak ditemukan" },
            { status: 404 }
          );
        }
        targetFlowCode = cleanedFlowCode;
        responsePreviousStage = cleanedFlowCode;
      }
    }

    const actionDescription = buildActionDescription(type, memo);

    if (type === "back") {
      const previousStageInfo = await findPreviousStage(noAplikasi, CONNECTION_NAME);
      const previousStageValue = previousStageInfo.flowCode;
      if (!previousStageValue) {
        return NextResponse.json(
          { error: "Stage sebelumnya tidak ditemukan" },
          { status: 404 }
        );
      }
      targetFlowCode = previousStageValue;
      responsePreviousStage = previousStageValue;
    }

    if (!targetFlowCode) {
      return NextResponse.json(
        { error: "Flow code tujuan tidak ditemukan" },
        { status: 404 }
      );
    }

    let updateResult;

    if (type === "hold") {
      await executeQuery(
        `UPDATE ILOS.TBL_DRAFT_APLIKASI a
           SET a.CREATE_DATE = CURRENT_TIMESTAMP,
               a.FLOW_CODE = REPLACE(REPLACE(a.FLOW_CODE, '_HOLD', ''), '-HOLD', '')
         WHERE a.NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );

      updateResult = await executeQuery(
        `UPDATE ILOS.TBL_APLIKASI a
           SET a.CREATE_DATE = CURRENT_TIMESTAMP,
               a.FLOW_CODE = REPLACE(REPLACE(a.FLOW_CODE, '_HOLD', ''), '-HOLD', '')
         WHERE a.NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );
    } else {
      updateResult = await executeQuery(
        `UPDATE ILOS.TBL_APLIKASI SET FLOW_CODE = :flow_code WHERE NO_APLIKASI = :no_apl`,
        { flow_code: targetFlowCode, no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );
    }

    const rowsAffected = updateResult?.rowsAffected ?? 0;
    if (rowsAffected === 0) {
      return NextResponse.json(
        { error: "Data aplikasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (type === "cancel") {
      await executeQuery(
        `DELETE FROM ILOS.TBL_APLIKASI_HIST
         WHERE NO_APLIKASI = :no_apl
           AND UPPER(FLOW_CODE) LIKE '%-REJECTED%'`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );

      await executeQuery(
        `DELETE FROM ILOS.TBL_CANCEL_APLIKASI WHERE NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );

      await executeQuery(
        `DELETE FROM ILOS.TBL_APLIKASI_REJECT WHERE NO_APLIKASI = :no_apl`,
        { no_apl: noAplikasi },
        { connectionName: CONNECTION_NAME }
      );
    }

    await executeQuery(
      `INSERT INTO REPORTFF.HISTORY_HELPDESK (NO_APP, ACTION_DESC, ACTION_BY, ACTION_DATE, IP_ADDRESS)
       VALUES (:no_app, :action_desc, :action_by, CURRENT_TIMESTAMP, :ip_address)`,
      {
        no_app: noAplikasi,
        action_desc: actionDescription,
        action_by: actionBy,
        ip_address: ipAddress,
      },
      { connectionName: CONNECTION_NAME }
    );

    return NextResponse.json({
      message: "Flow code berhasil diperbarui",
      flowCode: targetFlowCode,
      previousStage: responsePreviousStage,
      memo,
      history: {
        no_app: noAplikasi,
        action_desc: actionDescription,
        action_by: actionBy,
        action_date: responseActionDate,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error("Error update flow code:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui flow code" },
      { status: 500 }
    );
  }
}
