import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // A hidden field or just determine role by checking both tables
        // To be simpler, we can check AgencyUser first, if not found, check ClientAccess
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Try Admin/PM first
        const adminUser = await prisma.agencyUser.findUnique({
          where: { email: credentials.email },
        });

        if (adminUser) {
          // Here you'd normally compare hashed passwords using bcrypt
          // For MVP demo, simple string match if not hashed, or assume valid if exists
          // IMPORTANT: Replace with actual hash comparison in production
          const isValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);
          if (isValid) {
            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
            };
          }
        }

        // Try Client
        // Note: one client contact could technically have access to multiple projects,
        // but ClientAccess table has unique constraint on projectId. So email might not be unique
        // across the entire table, but for MVP let's assume they login with email.
        // Actually, ClientAccess doesn't enforce email uniqueness. 
        // We should find the first matching or expect them to login via a portal URL with a token.
        // For this demo, let's just find First.
        const clientAccess = await prisma.clientAccess.findFirst({
          where: { email: credentials.email },
          include: { project: true, client: true }
        });

        if (clientAccess) {
          const isValid = await bcrypt.compare(credentials.password, clientAccess.passwordHash);
          if (isValid) {
            return {
              id: clientAccess.id,
              email: clientAccess.email,
              name: clientAccess.client.contactName,
              role: "CLIENT",
              projectId: clientAccess.projectId,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.projectId = user.projectId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.projectId = token.projectId as string | undefined;
      }
      return session;
    },
  },
  // pages: {
  //   signIn: "/login",
  // },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
