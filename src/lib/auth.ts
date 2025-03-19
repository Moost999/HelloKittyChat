import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Adicione o segredo do NextAuth.js
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth function started"); // Debug log

        try {
          // Verifica se o email e a senha foram fornecidos
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Busca o usuário no banco de dados
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, name: true, password: true }, // Seleciona apenas os campos necessários
          });

          // Verifica se o usuário existe
          if (!user) {
            throw new Error("User not found");
          }

          // Compara a senha fornecida com a senha armazenada
          const passwordValid = await compare(credentials.password, user.password);

          // Verifica se a senha é válida
          if (!passwordValid) {
            throw new Error("Invalid password");
          }

          // Retorna o objeto do usuário (sem a senha)
          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined, // Converte null para undefined
          };
        } catch (error) {
          console.error("Auth error:", error); // Log de erros
          throw error; // Lança o erro para ser tratado pelo NextAuth.js
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Usa JWT para gerenciar a sessão
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      // Adiciona o ID do usuário ao token JWT
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Adiciona o ID do usuário à sessão
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Página de login personalizada
    error: "/login", // Página de erro personalizada
  },
};