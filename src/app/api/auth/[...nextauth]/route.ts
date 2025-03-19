import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { User } from "next-auth";

// Definindo as opções do NextAuth sem o GoogleProvider
export const authOptions: NextAuthOptions = {
  providers: [], // Nenhum provedor, login normal (por exemplo, com email/senha)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // A função 'jwt' agora usa tipos explícitos
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id; // Adicionando id do usuário no token
      }
      return token;
    },
    // A função 'session' agora usa tipos explícitos
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.id) {
        session.user.id = token.id as string; // Garantindo que 'id' seja string
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

// Exporte os métodos GET e POST
export { handler as GET, handler as POST };
