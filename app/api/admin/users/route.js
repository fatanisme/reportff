import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany();
    return Response.json(users);
}
