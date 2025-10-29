import { NextResponse } from "next/server";
import crypto from "crypto";

const secretKey = crypto
  .createHash("sha256")
  .update(process.env.MASTER_PARAM_SECRET || process.env.ENCRYPTION_SECRET || "REPORTFF_MASTER_PARAM_SECRET")
  .digest();

function decryptText(payload) {
  if (!payload) return "";
  const [ivHex, encryptedBase64] = payload.split(":");
  if (!ivHex || !encryptedBase64) return "";

  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export async function POST(request) {
  try {
    const { strings } = await request.json();
    const encryptedText = typeof strings === "string" ? strings : "";

    if (!encryptedText) {
      return NextResponse.json({ success: true, result: "" });
    }

    const result = decryptText(encryptedText);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error decrypting string:", error);
    return NextResponse.json(
      { success: false, message: "Gagal melakukan dekripsi" },
      { status: 500 }
    );
  }
}
