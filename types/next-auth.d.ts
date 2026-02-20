import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    /** JWT signé pour le backend Railway */
    backendToken: string
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    backendToken: string
  }
}
