import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { executeQuery } from "@/lib/oracle"; // Sesuaikan dengan file koneksi Oracle kamu

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const query = `SELECT * FROM REPORTFF.USERS WHERE EMAIL = :email`;
        const result = await executeQuery(query, { email: credentials.email });

        const user = result[0];
        if (!user) throw new Error("User tidak ditemukan");

        const valid = await bcrypt.compare(credentials.password, user.PASSWORD);
        if (!valid) throw new Error("Password salah");

        return {
          id: user.ID,
          name: user.NAME,
          email: user.EMAIL,
          role: user.ROLE,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role;
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