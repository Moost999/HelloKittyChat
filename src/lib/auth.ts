import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        
        if (!user) {
          return null;
        }
        
        // Check if password matches
        const passwordValid = await compare(credentials.password, user.password);
        
        if (!passwordValid) {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined // Convert null to undefined
        };
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"  // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};