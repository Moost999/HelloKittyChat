import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

          // Chama a sua rota de login personalizada
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Verifica se a resposta foi bem-sucedida
          if (!response.ok) {
            throw new Error(data.error || "Login failed");
          }

          // Retorna o objeto do usuário (sem a senha)
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || undefined, // Converte null para undefined
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