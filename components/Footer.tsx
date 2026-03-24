import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function Footer() {
  const configuredKakaoChannel =
    process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL ||
    process.env.KAKAO_CHANNEL_URL ||
    COMPANY_INFO.kakaoChannel;

  const kakaoChannel = configuredKakaoChannel?.trim();
  const kakaoChannelUrl =
    kakaoChannel && kakaoChannel.length > 0
      ? kakaoChannel.startsWith("http")
        ? kakaoChannel
        : `https://pf.kakao.com/_${kakaoChannel.replace(/^_+/, "")}`
      : null;

  return (
    <footer className="bg-white text-text-dark mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* CTA Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-medium mb-4 text-text-dark px-2">
            가장 안전하고 유익한 여행, 지금 준비하세요.
          </h3>
          <p className="text-text-gray mb-6 sm:mb-8 px-2 text-sm sm:text-base">
            견적 요청을 남겨주시면 담당자가 24시간 내에 연락드립니다.
          </p>
          <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 w-full">
              {kakaoChannelUrl ? (
                <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto border border-brand-green-primary/30">
                  <a
                    href={kakaoChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    카카오톡 문의
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto border border-brand-green-primary/30">
                  <Link href="/inquiry" className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    카카오톡 채널 준비중
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="bg-white border border-text-dark text-text-dark hover:bg-gray-50 px-6 sm:px-8 w-full sm:w-auto">
                <Link href="/inquiry" className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  온라인 견적 문의
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact & Company Info */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-text-gray uppercase">Contact</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-brand-green flex-shrink-0" />
                  <span className="text-sm text-text-gray">대표전화</span>
                  <span className="text-2xl font-semibold text-text-dark">{COMPANY_INFO.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-base text-text-gray hover:text-brand-green transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </div>
                <p className="text-sm text-text-gray break-keep">{COMPANY_INFO.businessHours}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-text-gray uppercase">Company</p>
              <dl className="mt-3 space-y-2 text-sm sm:text-base">
                <div className="grid grid-cols-[88px_1fr] gap-3">
                  <dt className="text-text-gray">회사명</dt>
                  <dd className="font-medium text-text-dark break-keep">
                    {COMPANY_INFO.name} ({COMPANY_INFO.englishName})
                  </dd>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-3">
                  <dt className="text-text-gray">설립</dt>
                  <dd className="font-medium text-text-dark">{COMPANY_INFO.founded}</dd>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-3">
                  <dt className="text-text-gray">업종</dt>
                  <dd className="font-medium text-text-dark break-keep">{COMPANY_INFO.businessType}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 mt-6 text-center">
          <p className="text-text-gray text-sm">
            © 2025 TouchTheWorld. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
