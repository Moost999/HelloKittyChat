import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt"; // Importa o tipo JWT
import { Session } from "next-auth"; // Importa o tipo Session

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Adicionando id do usuário no token (caso necessário)
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string; // Passando id do token para o usuário na sessão
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export async function someFunction({
  token,
  user,
  session,
}: {
  token: JWT;
  user: any; // Se você souber a estrutura de 'user', substitua 'any' pelo tipo correto
  session: Session;
}) {
  console.log(token);
  console.log(user);
  console.log(session);
}

export { handler as GET, handler as POST };
