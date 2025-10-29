import { NextResponse } from "next/server";
import crypto from "crypto";

const secretKey = crypto
  .createHash("sha256")
  .update(process.env.MASTER_PARAM_SECRET || process.env.ENCRYPTION_SECRET || "REPORTFF_MASTER_PARAM_SECRET")
  .digest();

export async function POST(request) {
  try {
    const { strings } = await request.json();
    const plainText = typeof strings === "string" ? strings : "";

    if (!plainText) {
      return NextResponse.json({ success: true, result: "" });
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    const result = `${iv.toString("hex")}:${encrypted.toString("base64")}`;

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error encrypting string:", error);
    return NextResponse.json(
      { success: false, message: "Gagal melakukan enkripsi" },
      { status: 500 }
    );
  }
}
