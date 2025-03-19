import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Auth function started"); // Debug log
        
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, name: true, password: true } // Only select what you need
          });
          
          if (!user) {
            return null;
          }
          
          const passwordValid = await compare(credentials.password, user.password);
          
          if (!passwordValid) {
            return null;
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined
          };
        } catch (error) {
          console.error("Auth error:", error); // Log errors
          throw error; // Re-throw to return proper error response
        }
      }
    })
  ],
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