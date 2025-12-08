import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
    async session({ session, user }: any) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (!user.email) {
        return false;
      }

      // 기존 사용자 확인
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        // 새 사용자 생성 (소셜 로그인)
        dbUser = await prisma.user.create({
          data: {
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
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });
      }

      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};
