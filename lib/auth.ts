import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Warn if no auth secret is configured — NextAuth will generate a random one at build time,
// which invalidates all sessions on every deploy.
if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.warn(
    "[Auth] WARNING: NEXTAUTH_SECRET is not set. Sessions will be invalidated on every server restart."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          return null;
        }

        if (credentials?.email !== adminEmail) {
          return null;
        }

        // Support both plain text (dev) and hashed passwords
        const passwordStr = String(credentials.password);
        const isHashed = adminPassword.startsWith("$2");
        const isValid = isHashed
          ? await bcrypt.compare(passwordStr, adminPassword)
          : passwordStr === adminPassword;

        if (!isValid) {
          return null;
        }

        return {
          id: "admin",
          email: adminEmail,
          name: "Admin",
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      const isLoggedIn = !!auth?.user;

      if (isAdmin && !isLoginPage && !isLoggedIn) {
        return Response.redirect(new URL("/admin/login", nextUrl));
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
});
