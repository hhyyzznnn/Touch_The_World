import NextAuth, { type DefaultSession, type User } from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

interface NextAuthUser extends User {
  id?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      // 기존 사용자 확인
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // username 생성 (이메일의 @ 앞부분 사용, 중복 시 숫자 추가)
        let baseUsername = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        if (baseUsername.length < 3) {
          baseUsername = "user";
        }
        if (baseUsername.length > 20) {
          baseUsername = baseUsername.substring(0, 20);
        }

        let username = baseUsername;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          const suffix = `${counter}`;
          const maxLength = 20 - suffix.length;
          username = baseUsername.substring(0, maxLength) + suffix;
          counter++;
        }

        // 새 사용자 생성 (소셜 로그인)
        dbUser = await prisma.user.create({
          data: {
            username,
            email: user.email,
            name: user.name || "사용자",
            image: user.image || null,
            emailVerified: true, // 소셜 로그인은 이메일 인증 완료로 간주
            phoneVerified: false,
          },
        });
      } else {
        // 기존 사용자 정보 업데이트 (이미지 등)
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            emailVerified: true, // 소셜 로그인은 이메일 인증 완료로 간주
            image: user.image || dbUser.image,
          },
        });
      }

      // Account 연결
      if (account) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token as string | null,
            refresh_token: account.refresh_token as string | null,
            expires_at: account.expires_at as number | null,
            token_type: account.token_type as string | null,
            scope: account.scope as string | null,
            id_token: account.id_token as string | null,
            session_state: account.session_state as string | null,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token as string | null,
            refresh_token: account.refresh_token as string | null,
            expires_at: account.expires_at as number | null,
            token_type: account.token_type as string | null,
            scope: account.scope as string | null,
            id_token: account.id_token as string | null,
            session_state: account.session_state as string | null,
          },
        });
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
