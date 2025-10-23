import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";
import { insertUserGroupMappings } from "@/lib/user-groups";
import bcrypt from "bcryptjs";

const EMAIL_DOMAIN = "@bankbsi.co.id";
const STATUS_ACTIVE = 1;
const STATUS_DEACTIVE = 0;

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

function extractClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "0.0.0.0";
}

function buildUsernameFromEmail(email) {
  if (!email) return "";
  const localPart = email.split("@")[0] || "";
  return localPart.substring(0, 100);
}

export async function GET() {
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
  `;

  try {
    const rows = await executeQuery(query);
    const data = Array.isArray(rows)
      ? rows.map((row) => {
          const rawStatus =
            row.ACTIVE === null || row.ACTIVE === undefined
              ? STATUS_ACTIVE
              : Number(row.ACTIVE);
          const divisionIdValue =
            row.ID_DIVISI === null || row.ID_DIVISI === undefined
              ? ""
              : String(row.ID_DIVISI);
          const divisionCodeRaw =
            row.KODE_DIVISI === null || row.KODE_DIVISI === undefined
              ? ""
              : String(row.KODE_DIVISI).trim();
          const divisionCodeNormalized = divisionCodeRaw.toLowerCase();

          return {
            ID: row.ID,
            FIRST_NAME: row.FIRST_NAME,
            LAST_NAME: row.LAST_NAME,
            USERNAME: row.USERNAME,
            EMAIL: row.EMAIL,
            ACTIVE: row.ACTIVE,
            STATUS: rawStatus,
            ID_DIVISI: row.ID_DIVISI,
            DIVISION_ID: divisionIdValue,
            DIVISION_CODE: divisionCodeRaw,
            DIVISION_CODE_NORMALIZED: divisionCodeNormalized,
            DIVISION_NAME:
              row.NAMA_DIVISI === null || row.NAMA_DIVISI === undefined
                ? ""
                : String(row.NAMA_DIVISI),
            PHONE: row.PHONE,
            IP_ADDRESS: row.IP_ADDRESS,
          };
        })
      : [];
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetch users:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    status,
    divisionId,
    groupId,
    groupIds,
  } = await request.json();

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
    !password?.trim() ||
    !normalizedDivisionId ||
    sanitizedGroupIds.length === 0
  ) {
    return NextResponse.json(
      {
        error: "First name, email, password, divisi, dan group wajib diisi",
      },
      { status: 400 }
    );
  }

  try {
    const existing = await executeQuery(
      "SELECT ID FROM REPORTFF.USERS WHERE EMAIL = :email",
      { email: normalizedEmail }
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const username = buildUsernameFromEmail(normalizedEmail);

    await executeQuery(
      `INSERT INTO REPORTFF.USERS (
        FIRST_NAME,
        LAST_NAME,
        USERNAME,
        EMAIL,
        PASSWORD,
        ACTIVE,
        ID_DIVISI,
        PHONE,
        IP_ADDRESS
      ) VALUES (
        :firstName,
        :lastName,
        :username,
        :email,
        :password,
        :status,
        :divisionId,
        :phone,
        :ip
      )`,
      {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        username,
        email: normalizedEmail,
        password: hashedPassword,
        status: normalizedStatus,
        divisionId: normalizedDivisionId,
        phone: trimmedPhone,
        ip: extractClientIp(request),
      }
    );

    const insertedUser = await executeQuery(
      "SELECT ID FROM REPORTFF.USERS WHERE EMAIL = :email",
      { email: normalizedEmail }
    );

    const userId = insertedUser?.[0]?.ID;

    if (!userId) {
      throw new Error("Gagal mendapatkan ID user yang baru dibuat");
    }

    await executeQuery("DELETE FROM REPORTFF.USERS_GROUPS WHERE USER_ID = :userId", {
      userId,
    });

    await insertUserGroupMappings(userId, sanitizedGroupIds);

    return NextResponse.json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    console.error("Gagal tambah user:", error);
    return NextResponse.json({ error: "Gagal tambah data" }, { status: 500 });
  }
}

export { STATUS_ACTIVE, STATUS_DEACTIVE };
