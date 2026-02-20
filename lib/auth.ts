import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { sql } from "./db"

const backendSecret = new TextEncoder().encode(
  process.env.BACKEND_JWT_SECRET || process.env.NEXTAUTH_SECRET!
)

async function signBackendToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(backendSecret)
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rows = await sql`
          SELECT id, email, password_hash, full_name, role
          FROM users
          WHERE email = ${credentials.email}
          LIMIT 1
        `
        const user = rows[0]
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password_hash as string)
        if (!valid) return null

        return {
          id: String(user.id),
          email: user.email as string,
          name: (user.full_name as string) || "",
          role: (user.role as string) || "user",
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.backendToken = await signBackendToken(user.id, user.role)
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      session.backendToken = token.backendToken
      return session
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
