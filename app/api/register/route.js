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
  if (trimmed.endsWith(EMAIL_DOMAIN)) return trimmed;
  return `${trimmed.replace(/@.*/, "")}${EMAIL_DOMAIN}`;
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

export async function POST(req) {
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
  } = await req.json();

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
    const existingUser = await executeQuery(
      "SELECT ID FROM REPORTFF.USERS WHERE EMAIL = :email",
      { email: normalizedEmail }
    );

    if (existingUser.length > 0) {
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
        ip: extractClientIp(req),
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

    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error register:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
