import { NextResponse } from "next/server";
import {
  findPermissionForPath,
  normalizePath,
} from "@/lib/page-permissions";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pathParam = searchParams.get("path") ?? "/";

  try {
    const permission = await findPermissionForPath(pathParam);
    return NextResponse.json({
      data: permission
        ? {
            ...permission,
            urlPath: normalizePath(permission.urlPath),
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/page-permissions/check error:", error);
    return NextResponse.json(
      { error: "Gagal memuat konfigurasi akses" },
      { status: 500 }
    );
  }
}
