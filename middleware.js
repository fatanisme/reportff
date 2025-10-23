import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const LOGIN_PATH = "/auth/login";
const AUTH_PREFIX = "/auth";
const AUTH_API_PREFIX = "/api/auth";
const UNAUTHORIZED_PATH = "/unauthorized";
const CACHE_BYPASS_HEADER = "x-page-permission-cache";

const normalizePath = (value) => {
  if (!value) return "/";
  let normalized = String(value).trim();
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized.toLowerCase();
};

const buildResponse = () => {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
};

const redirectTo = (url, destination) => {
  const response = NextResponse.redirect(new URL(destination, url));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
};

const hasIntersection = (source = [], target = []) => {
  if (!source.length || !target.length) return false;
  const targetSet = new Set(target.map((item) => String(item)));
  return source.some((item) => targetSet.has(String(item)));
};

const fetchPermission = async (origin, path) => {
  const url = new URL("/api/page-permissions/check", origin);
  url.searchParams.set("path", path);

  try {
    const res = await fetch(url, {
      headers: {
        [CACHE_BYPASS_HEADER]: "1",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("middleware: gagal memuat konfigurasi akses", error);
    return null;
  }
};

export async function middleware(req) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Abaikan request yang sudah difilter via matcher
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return buildResponse();
  }

  const normalizedPath = normalizePath(pathname);
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX);
  const isAuthApiRoute = pathname.startsWith(AUTH_API_PREFIX);
  const isLoginRoute = normalizedPath === normalizePath(LOGIN_PATH);

  const permission = await fetchPermission(nextUrl.origin, pathname);

  const token = await getToken({ req });

  // Halaman yang mengizinkan akses anonim
  if (permission?.allowAnonymous) {
    if (token && isLoginRoute) {
      return redirectTo(nextUrl, "/");
    }
    return buildResponse();
  }

  // Halaman login & auth API tetap publik
  if (!token) {
    if (isAuthRoute || isAuthApiRoute) {
      return buildResponse();
    }
    return redirectTo(nextUrl, LOGIN_PATH);
  }

  // Pengguna sudah login tetapi mencoba kembali ke halaman login
  if (isLoginRoute) {
    return redirectTo(nextUrl, "/");
  }

  if (permission) {
    if (permission.allowAll) {
      return buildResponse();
    }

    const allowedGroupIds = Array.isArray(permission.groupIds)
      ? permission.groupIds.map((id) => String(id))
      : [];
    const allowedDivisionIds = Array.isArray(permission.divisionIds)
      ? permission.divisionIds.map((id) => String(id))
      : [];

    const userGroupIds = Array.isArray(token.groupIds)
      ? token.groupIds.map((id) => String(id))
      : [];
    const userDivisionId =
      token.divisionId === null || token.divisionId === undefined
        ? null
        : String(token.divisionId);

    const hasGroupAccess = hasIntersection(userGroupIds, allowedGroupIds);
    const hasDivisionAccess =
      allowedDivisionIds.length > 0 &&
      userDivisionId !== null &&
      allowedDivisionIds.includes(userDivisionId);

    const hasAccess =
      (allowedGroupIds.length === 0 && allowedDivisionIds.length === 0) ||
      hasGroupAccess ||
      hasDivisionAccess;

    if (!hasAccess) {
      return redirectTo(nextUrl, UNAUTHORIZED_PATH);
    }
  }

  return buildResponse();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
