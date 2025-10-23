import { executeQuery } from "@/lib/oracle";
import { readFileSync } from "fs";
import path from "path";

const chartQuery = readFileSync(
  path.join(process.cwd(), "lib/sql/akumulasi_realtime_chart.sql"),
  "utf8",
);

export async function GET() {
  try {
    const data = await executeQuery(chartQuery);
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
