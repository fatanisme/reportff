import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const token = await getToken({ req });
    if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));

    return NextResponse.next();
}

export const config = {
  matcher: ["/administrator/:path*"],
};
