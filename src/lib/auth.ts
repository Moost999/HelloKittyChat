// src/app/lib/auth.ts (new file)
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { User } from "next-auth";

// Defining NextAuth options without GoogleProvider
export const authOptions: NextAuthOptions = {
  providers: [], // No provider, normal login (e.g., with email/password)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // The 'jwt' function now uses explicit types
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id; // Adding user id to token
      }
      return token;
    },
    // The 'session' function now uses explicit types
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.id && session.user) { // Add null check for session.user
        session.user.id = token.id as string; // Ensuring 'id' is a string
      }
      return session;
    },
  },
};