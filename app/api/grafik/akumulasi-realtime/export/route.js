import { executeQuery } from "@/lib/oracle";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const baseExportQuery = readFileSync(
  path.join(process.cwd(), "lib/sql/akumulasi_realtime_export.sql"),
  "utf8",
);

const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((val) => val.replace(/-/g, ""));

const ExportSchema = z.object({
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
});

const buildQuery = ({ startDate, endDate }) => {
  const clauses = [];
  const binds = {};

  const normalize = (value) => value?.replace(/-/g, "");

  const normalizedStart = normalize(startDate);
  const normalizedEnd = normalize(endDate);

  if (normalizedStart) {
    clauses.push("AND SUBSTR(a.NO_APLIKASI,1,8) >= :p_tglawal");
    binds.p_tglawal = normalizedStart;
  }

  if (normalizedEnd) {
    clauses.push("AND SUBSTR(a.NO_APLIKASI,1,8) <= :p_tglakhir");
    binds.p_tglakhir = normalizedEnd;
  }

  const query = baseExportQuery.replace("/*DATE_FILTER*/", clauses.join("\n"));
  return { query, binds };
};

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const validated = ExportSchema.parse(params);

    const { query, binds } = buildQuery(validated);
    const data = await executeQuery(query, binds);

    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: "Invalid parameters",
          details: error.errors,
          message: "Optional parameters must be formatted as YYYY-MM-DD",
        },
        { status: 400 },
      );
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic"; // This ensures the route is not cached
