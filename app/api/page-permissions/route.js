import { NextResponse } from "next/server";
import {
  createPagePermission,
  listPagePermissions,
} from "@/lib/page-permissions";

const normalizeFlag = (value) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1" ||
  Number(value) === 1;

const sanitizeIds = (values) =>
  Array.isArray(values)
    ? Array.from(
        new Set(
          values
            .map((value) => {
              if (value === null || value === undefined) return null;
              const stringified = String(value).trim();
              return stringified ? stringified : null;
            })
            .filter(Boolean)
        )
      )
    : [];

export async function GET() {
  try {
    const data = await listPagePermissions();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/page-permissions error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data hak akses halaman" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const urlPathRaw = body?.urlPath ?? "";
    const urlPath = typeof urlPathRaw === "string" ? urlPathRaw.trim() : "";
    const descriptionRaw = body?.description ?? "";
    const description =
      typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";
    const allowAll = normalizeFlag(body?.allowAll);
    const allowAnonymous = normalizeFlag(body?.allowAnonymous);
    const divisionIds = sanitizeIds(body?.divisionIds ?? []);
    const groupIds = sanitizeIds(body?.groupIds ?? []);

    if (!urlPath) {
      return NextResponse.json(
        { error: "URL path wajib diisi" },
        { status: 400 }
      );
    }

    if (!allowAll && !allowAnonymous) {
      if (divisionIds.length === 0 && groupIds.length === 0) {
        return NextResponse.json(
          { error: "Pilih minimal satu divisi atau group, atau aktifkan akses bebas" },
          { status: 400 }
        );
      }
    }

    const data = await createPagePermission({
      urlPath,
      description,
      allowAll,
      allowAnonymous,
      divisionIds,
      groupIds,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/page-permissions error:", error);

    if (error?.errorNum === 1) {
      return NextResponse.json(
        { error: "URL path sudah terdaftar" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menyimpan data hak akses" },
      { status: 500 }
    );
  }
}
