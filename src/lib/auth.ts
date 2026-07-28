import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { parseContact } from "@/lib/contact";
import { parseUsername } from "@/lib/username";

const otpSchema = z.object({
  contact: z.string().min(3),
  code: z.string().min(4).max(12),
  purpose: z.enum(["login", "signup"]),
  name: z.string().optional(),
  username: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "otp",
      name: "One-time code",
      credentials: {
        contact: { label: "Contact", type: "text" },
        code: { label: "Code", type: "text" },
        purpose: { label: "Purpose", type: "text" },
        name: { label: "Name", type: "text" },
        username: { label: "Username", type: "text" },
      },
      async authorize(raw) {
        const parsed = otpSchema.safeParse(raw);
        if (!parsed.success) return null;

        const contactParsed = parseContact(parsed.data.contact);
        if (!contactParsed.ok) return null;

        const verified = await verifyOtp({
          contact: contactParsed.contact,
          purpose: parsed.data.purpose,
          code: parsed.data.code,
        });
        if (!verified.ok) return null;

        const channel = contactParsed.channel;
        const contact = contactParsed.contact;

        if (parsed.data.purpose === "signup") {
          const usernameParsed = parseUsername(
            parsed.data.username || verified.username || ""
          );
          if (!usernameParsed.ok) return null;

          const takenUser = await prisma.user.findUnique({
            where: { username: usernameParsed.username },
          });
          if (takenUser) return null;

          const existingContact =
            channel === "email"
              ? await prisma.user.findUnique({ where: { email: contact } })
              : await prisma.user.findUnique({ where: { phone: contact } });
          if (existingContact) return null;

          const name =
            (parsed.data.name || verified.name || "").trim() ||
            usernameParsed.username;

          const user = await prisma.user.create({
            data: {
              username: usernameParsed.username,
              name,
              email: channel === "email" ? contact : null,
              phone: channel === "phone" ? contact : null,
              emailVerified: channel === "email" ? new Date() : null,
              phoneVerified: channel === "phone" ? new Date() : null,
            },
          });

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.username || user.name,
          };
        }

        // login — contact already verified; resolve user by that contact
        const user =
          channel === "email"
            ? await prisma.user.findUnique({ where: { email: contact } })
            : await prisma.user.findUnique({ where: { phone: contact } });
        if (!user) return null;

        if (channel === "email" && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
        if (channel === "phone" && !user.phoneVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date() },
          });
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.username || user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        delete token.error;
        token.checkedAt = Date.now();
        return token;
      }

      if (
        token.sub &&
        (trigger === "update" ||
          !token.checkedAt ||
          Date.now() - Number(token.checkedAt) > 60_000)
      ) {
        try {
          const exists = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { id: true, name: true, email: true, username: true },
          });
          token.checkedAt = Date.now();
          if (!exists) {
            return { error: "UserNotFound" };
          }
          token.name = exists.username || exists.name;
          token.email = exists.email;
        } catch {
          /* keep session on transient DB errors */
        }
      }

      if (token.error === "UserNotFound") {
        return { error: "UserNotFound" };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "UserNotFound") {
        session.user = undefined as unknown as typeof session.user;
        return session;
      }
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.name) session.user.name = String(token.name);
        if (token.email) session.user.email = String(token.email);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
