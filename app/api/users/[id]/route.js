import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { insertUserGroupMappings } from "@/lib/user-groups";
const STATUS_ACTIVE = 1;
const STATUS_DEACTIVE = 0;

const EMAIL_DOMAIN = "@bankbsi.co.id";

function normalizeEmail(rawEmail = "") {
  const trimmed = rawEmail.trim().toLowerCase();
  if (!trimmed) return "";
  return trimmed.endsWith(EMAIL_DOMAIN)
    ? trimmed
    : `${trimmed.replace(/@.*/, "")}${EMAIL_DOMAIN}`;
}

function normalizeStatus(value) {
  if (value === 0 || value === "0") return STATUS_DEACTIVE;
  return STATUS_ACTIVE;
}

function buildUsernameFromEmail(email) {
  if (!email) return "";
  const localPart = email.split("@")[0] || "";
  return localPart.substring(0, 100);
}

// GET user by ID
export async function GET(request, { params }) {
  const { id } = params;

  const query = `
    SELECT
      u.ID,
      u.FIRST_NAME,
      u.LAST_NAME,
      u.USERNAME,
      u.EMAIL,
      u.ACTIVE,
      u.ID_DIVISI,
      u.PHONE,
      u.IP_ADDRESS,
      d.KODE_DIVISI,
      d.NAMA_DIVISI
    FROM REPORTFF.USERS u
    LEFT JOIN REPORTFF.TB_DIVISI d ON d.ID_DIVISI = u.ID_DIVISI
    WHERE u.ID = :id
  `;

  try {
    const rows = await executeQuery(query, { id });

    if (rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    const row = rows[0];
    const statusValue =
      row.ACTIVE === null || row.ACTIVE === undefined
        ? STATUS_ACTIVE
        : Number(row.ACTIVE);
    const divisionIdValue =
      row.ID_DIVISI === null || row.ID_DIVISI === undefined
        ? ""
        : String(row.ID_DIVISI);
    const divisionCode =
      row.KODE_DIVISI === null || row.KODE_DIVISI === undefined
        ? ""
        : String(row.KODE_DIVISI).trim();
    const divisionName =
      row.NAMA_DIVISI === null || row.NAMA_DIVISI === undefined
        ? ""
        : String(row.NAMA_DIVISI);

    const groupRows = await executeQuery(
      `SELECT
         ug.GROUP_ID,
         g.NAME AS GROUP_NAME
       FROM REPORTFF.USERS_GROUPS ug
       LEFT JOIN REPORTFF.GROUPS g ON g.ID = ug.GROUP_ID
       WHERE ug.USER_ID = :userId`,
      { userId: id }
    );

    const groupIds = Array.isArray(groupRows)
      ? groupRows
          .map((group) => group?.GROUP_ID?.toString().trim())
          .filter((value) => value)
      : [];

    const groups = Array.isArray(groupRows)
      ? groupRows.map((group) => ({
          id: group?.GROUP_ID,
          name: group?.GROUP_NAME ?? "",
        }))
      : [];

    const payload = {
      ID: row.ID,
      FIRST_NAME: row.FIRST_NAME,
      LAST_NAME: row.LAST_NAME,
      USERNAME: row.USERNAME,
      EMAIL: row.EMAIL,
      ACTIVE: row.ACTIVE,
      STATUS: statusValue,
      ID_DIVISI: row.ID_DIVISI,
      DIVISION_ID: divisionIdValue,
      DIVISION_CODE: divisionCode,
      DIVISION_CODE_NORMALIZED: divisionCode.toLowerCase(),
      DIVISION_NAME: divisionName,
      PHONE: row.PHONE,
      IP_ADDRESS: row.IP_ADDRESS,
      GROUP_ID: groupIds[0] ?? "",
      GROUP_NAME: groups[0]?.name ?? "",
      GROUP_IDS: groupIds,
      GROUPS: groups,
    };

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error("Gagal ambil data user:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, context) {
  const { params } = context;
  const {
    firstName,
    lastName,
    email,
    phone,
    status,
    divisionId,
    groupId,
    groupIds,
  } = await request.json();
  const id = params.id;

  const trimmedFirstName = firstName?.trim();
  const trimmedLastName = lastName?.trim() || "";
  const normalizedEmail = normalizeEmail(email);
  const trimmedPhone = phone?.trim() || "";
  const normalizedStatus = normalizeStatus(status);
  const normalizedDivisionId = (divisionId ?? "").toString().trim();
  const normalizedGroupCandidates = Array.isArray(groupIds)
    ? groupIds
    : groupId !== undefined
    ? [groupId]
    : [];

  const sanitizedGroupIds = Array.from(
    new Set(
      normalizedGroupCandidates
        .map((value) => value?.toString().trim())
        .filter((value) => value)
    )
  ).slice(0, 1);

  if (
    !trimmedFirstName ||
    !normalizedEmail ||
    !normalizedDivisionId ||
    sanitizedGroupIds.length === 0
  ) {
    return NextResponse.json(
      {
        error: "First name, email, divisi, dan group wajib diisi",
      },
      { status: 400 }
    );
  }

  const query = `
    UPDATE REPORTFF.USERS
       SET FIRST_NAME = :firstName,
           LAST_NAME = :lastName,
           USERNAME = :username,
           EMAIL = :email,
           ACTIVE = :status,
           ID_DIVISI = :divisionId,
           PHONE = :phone
     WHERE ID = :id
  `;

  try {
    const existing = await executeQuery(
      `SELECT ID FROM REPORTFF.USERS WHERE EMAIL = :email AND ID <> :id`,
      { email: normalizedEmail, id }
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah digunakan oleh user lain" },
        { status: 400 }
      );
    }

    const username = buildUsernameFromEmail(normalizedEmail);

    await executeQuery(query, {
      id,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      username,
      email: normalizedEmail,
      status: normalizedStatus,
      divisionId: normalizedDivisionId,
      phone: trimmedPhone,
    });

    await executeQuery("DELETE FROM REPORTFF.USERS_GROUPS WHERE USER_ID = :userId", {
      userId: id,
    });

    await insertUserGroupMappings(id, sanitizedGroupIds);

    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update user:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// DELETE tetap sama (tidak perlu ubah)
export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;

  const query = `DELETE FROM REPORTFF.USERS WHERE ID = :id`;

  try {
    await executeQuery(query, { id });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus user:", error);
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}
