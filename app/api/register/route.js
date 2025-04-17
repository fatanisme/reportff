import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req) {
    const body = await req.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
        return Response.json({ error: validatedData.error.format() }, { status: 400 });
    }

    const { name, email, password } = validatedData.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: "user" },
        });
        return Response.json(newUser);
    } catch (error) {
        return Response.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }
}
