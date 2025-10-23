import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getAllowedPagePermissionsForUser,
  listPagePermissions,
  pathMatches,
} from "@/lib/page-permissions";
import { MENU_ENTRIES } from "@/lib/menu-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const [allPermissions, allowedPermissions] = await Promise.all([
      listPagePermissions(),
      getAllowedPagePermissionsForUser({
      userId: user?.id ?? null,
      groupIds: user?.groupIds ?? [],
      divisionId: user?.divisionId ?? null,
      }),
    ]);

    const allowedIds = new Set(
      allowedPermissions.map((permission) => permission.id)
    );

    const findBestPermission = (path) => {
      let match = null;
      for (const permission of allPermissions) {
        if (!permission?.urlPath) continue;
        if (pathMatches(path, permission.urlPath)) {
          if (
            !match ||
            permission.urlPath.length > match.urlPath.length
          ) {
            match = permission;
          }
        }
      }
      return match;
    };

    const data = MENU_ENTRIES.filter((entry) =>
      Boolean(entry?.urlPath)
    ).filter((entry) => {
      const bestPermission = findBestPermission(entry.urlPath);
      if (!bestPermission) {
        return false;
      }
      if (bestPermission.allowAnonymous) {
        return true;
      }
      if (allowedIds.has(bestPermission.id)) {
        return true;
      }
      return false;
    }).map((entry) => ({
      urlPath: entry.urlPath,
      normalizedPath: entry.normalizedPath,
      label: entry.label,
      category: entry.category,
      title: entry.title,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/menu-permissions/allowed error:", error);
    return NextResponse.json(
      { error: "Gagal memuat menu yang diizinkan" },
      { status: 500 }
    );
  }
}
