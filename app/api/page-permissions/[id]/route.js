import { NextResponse } from "next/server";
import {
  deletePagePermission,
  getPagePermissionById,
  updatePagePermission,
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

export async function GET(_request, { params }) {
  const id = Number(params?.id);

  if (!id) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const data = await getPagePermissionById(id, { refresh: true });
    if (!data) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`GET /api/page-permissions/${id} error:`, error);
    return NextResponse.json(
      { error: "Gagal memuat data" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const id = Number(params?.id);
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const existing = await getPagePermissionById(id, { refresh: true });
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

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

    const data = await updatePagePermission(id, {
      urlPath,
      description,
      allowAll,
      allowAnonymous,
      divisionIds,
      groupIds,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`PUT /api/page-permissions/${id} error:`, error);
    if (error?.errorNum === 1) {
      return NextResponse.json(
        { error: "URL path sudah terdaftar" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui data hak akses" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const id = Number(params?.id);
  if (!id) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    const existing = await getPagePermissionById(id, { refresh: true });
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const affected = await deletePagePermission(id);
    if (!affected) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/page-permissions/${id} error:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus data hak akses" },
      { status: 500 }
    );
  }
}
