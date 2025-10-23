import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET(request) {
  const url = request.nextUrl;
  const flow_code = url.searchParams.get("flow_code")?.toUpperCase();
  const mode = url.searchParams.get("mode"); // "last" atau "in"

  if (!flow_code || !mode) {
    return NextResponse.json(
      { error: "Parameter flow_code dan mode wajib diisi" },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const dateCondition =
    mode === "LAST"
      ? `TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD') <= '${today}'`
      : mode === "IN"
      ? `TO_CHAR(a.CREATE_DATE, 'YYYY-MM-DD') = '${today}'`
      : null;
  if (!dateCondition) {
    return NextResponse.json(
      { error: "Mode harus 'last' atau 'in'" },
      { status: 400 }
    );
  }

  const query = `
    SELECT a.CREATE_DATE,a.JENIS_PRODUK,a.NO_APLIKASI,a.FLOW_CODE,a.BRANCH_CODE,a.NAMA_CUSTOMER,a.UPDATE_DATE,ILOS.F_GET_VALUE_CLOB(a.DATA,'branchName') AS BRANCH_NAME,
    a.UPDATE_BY
    FROM ILOS.TBL_APLIKASI a
    INNER JOIN ILOS.TBL_BRANCH b ON b.BRANCH_CODE = a.BRANCH_CODE
    WHERE
      a.FLOW_CODE NOT LIKE '%REJECT%'
      AND a.FLOW_CODE LIKE '%${flow_code}%'
      AND (a.JENIS_PRODUK LIKE '%MITRAGUNA%' OR a.JENIS_PRODUK LIKE '%PENSIUN%')
      AND a.NO_APLIKASI > '20190615'
      AND ${dateCondition}
      AND a.FLOW_CODE NOT LIKE '%_HOLD%'
  `;
  try {
    const datas = await executeQuery(query);

    return NextResponse.json({ success: true, data: datas });
  } catch (error) {
    console.error("Error fetch grafik detail-wise:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}
