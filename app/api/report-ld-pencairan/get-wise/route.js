import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

const sanitizeProcedure = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^[A-Z0-9_.]+$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
};

export async function POST() {
  const configuredProcedure = sanitizeProcedure(
    process.env.LD_PENCAIRAN_SYNC_PROCEDURE
  );
  const procedureName =
    configuredProcedure || "REPORTFF.PKG_LD_SYNC.PROCESS_LD";

  try {
    await executeQuery(
      `BEGIN ${procedureName}; END;`,
      {},
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      message: "Proses sinkronisasi LD pencairan berhasil dijalankan.",
    });
  } catch (error) {
    console.error("Error menjalankan sinkronisasi LD pencairan:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menjalankan proses sinkronisasi LD pencairan. Silakan coba lagi atau hubungi administrator.",
      },
      { status: 500 }
    );
  }
}
