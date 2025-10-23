import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { executeQuery } from "@/lib/oracle";

const buildDisplayName = (firstName, lastName, fallback = "") => {
  if (firstName && lastName) return `${firstName} ${lastName}`.trim();
  if (firstName) return firstName;
  if (lastName) return lastName;
  return fallback;
};

const STATUS_ACTIVE = 1;
const STATUS_DEACTIVE = 0;

const EMAIL_DOMAIN = "@bankbsi.co.id";

const normalizeEmail = (value = "") => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.endsWith(EMAIL_DOMAIN)) return trimmed;
  return `${trimmed.replace(/@.*/, "")}${EMAIL_DOMAIN}`;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials.email ?? "");
        const password = credentials.password ?? "";

        if (!email || !password) {
          throw new Error("Email dan password wajib diisi");
        }

        const query = `
          SELECT
            u.ID,
            u.FIRST_NAME,
            u.LAST_NAME,
            u.USERNAME,
            u.EMAIL,
            u.PASSWORD,
            u.ACTIVE,
            u.ID_DIVISI,
            u.PHONE,
            d.KODE_DIVISI,
            d.NAMA_DIVISI
          FROM REPORTFF.USERS u
          LEFT JOIN REPORTFF.TB_DIVISI d ON d.ID_DIVISI = u.ID_DIVISI
          WHERE u.EMAIL = :email
        `;
        const result = await executeQuery(query, { email });

        const user = result[0];
        if (!user) {
          throw new Error("User tidak ditemukan");
        }

        const valid = await bcrypt.compare(password, user.PASSWORD);

        if (!valid) {
          throw new Error("Password salah");
        }

        const status = Number(user.ACTIVE ?? STATUS_ACTIVE);

        if (status === STATUS_DEACTIVE) {
          throw new Error("Akun tidak aktif");
        }

        const fallbackName = user.EMAIL.split("@")[0];
        const fullName = buildDisplayName(
          user.FIRST_NAME,
          user.LAST_NAME,
          fallbackName
        ) || user.EMAIL;
        const divisionId =
          user.ID_DIVISI === null || user.ID_DIVISI === undefined
            ? null
            : user.ID_DIVISI;
        const divisionCodeRaw =
          user.KODE_DIVISI === null || user.KODE_DIVISI === undefined
            ? ""
            : String(user.KODE_DIVISI).trim();

        const groupsResult = await executeQuery(
          `
            SELECT
              ug.GROUP_ID,
              g.NAME
            FROM REPORTFF.USERS_GROUPS ug
            LEFT JOIN REPORTFF.GROUPS g ON g.ID = ug.GROUP_ID
            WHERE ug.USER_ID = :userId
          `,
          { userId: user.ID }
        );

        const groups = Array.isArray(groupsResult)
          ? groupsResult.map((row) => ({
              id: row.GROUP_ID?.toString() ?? "",
              name: row.NAME ?? "",
            }))
          : [];

        const groupIds = groups.map((group) => group.id);

        return {
          id: user.ID,
          name: fullName,
          email: user.EMAIL,
          status,
          divisionId,
          divisionCode: divisionCodeRaw,
          divisionCodeNormalized: divisionCodeRaw.toLowerCase(),
          divisionName:
            user.NAMA_DIVISI === null || user.NAMA_DIVISI === undefined
              ? ""
              : String(user.NAMA_DIVISI),
          firstName: user.FIRST_NAME,
          lastName: user.LAST_NAME,
          phone: user.PHONE,
          groups,
          groupIds,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.userId ?? token.sub ?? null;
      session.user.userId = session.user.id;
      session.user.status = token.status;
      session.user.divisionId = token.divisionId;
      session.user.divisionCode = token.divisionCode;
      session.user.divisionCodeNormalized = token.divisionCodeNormalized;
      session.user.divisionName = token.divisionName;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.phone = token.phone;
      session.user.groups = Array.isArray(token.groups) ? token.groups : [];
      session.user.groupIds = Array.isArray(token.groupIds)
        ? token.groupIds
        : [];
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? null;
        token.status = user.status;
        token.divisionId = user.divisionId;
        token.divisionCode = user.divisionCode;
        token.divisionCodeNormalized = user.divisionCodeNormalized;
        token.divisionName = user.divisionName;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.groups = Array.isArray(user.groups)
          ? user.groups.map((group) => ({
              id: group.id ?? "",
              name: group.name ?? "",
            }))
          : [];
        token.groupIds = Array.isArray(user.groupIds)
          ? user.groupIds.map((id) => id ?? "")
          : [];
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
