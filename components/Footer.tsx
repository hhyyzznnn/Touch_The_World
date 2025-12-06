import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, Instagram, Facebook } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function Footer() {
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
              {COMPANY_INFO.kakaoChannel ? (
                <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto border border-brand-green-primary/30">
                  <a 
                    href={COMPANY_INFO.kakaoChannel.startsWith('http') 
                      ? COMPANY_INFO.kakaoChannel 
                      : `https://pf.kakao.com/_${COMPANY_INFO.kakaoChannel}`}
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
                    카카오톡 문의
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
            
            {/* Social Media Links */}
            {(COMPANY_INFO.instagram || COMPANY_INFO.facebook) && (
              <div className="flex justify-center items-center gap-6 mt-6">
                {COMPANY_INFO.instagram && (
                  <a
                    href={COMPANY_INFO.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-brand-green-primary text-text-gray hover:text-white transition-all duration-300 transform hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {COMPANY_INFO.facebook && (
                  <a
                    href={COMPANY_INFO.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-brand-green-primary text-text-gray hover:text-white transition-all duration-300 transform hover:scale-110"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact & Company Info */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-gray-200 pt-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-brand-green" />
              <span className="text-xl font-medium text-text-dark">{COMPANY_INFO.phone}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-brand-green" />
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-text-gray hover:text-brand-green">
                {COMPANY_INFO.email}
              </a>
            </div>
            <p className="text-text-gray text-sm">
              {COMPANY_INFO.businessHours}
            </p>
          </div>
          <div className="text-left md:text-left">
            <p className="text-text-dark mb-2 text-sm sm:text-base">
              상호명: {COMPANY_INFO.name} ({COMPANY_INFO.englishName})
            </p>
            <p className="text-text-dark mb-2 text-sm sm:text-base">
              {COMPANY_INFO.founded} 설립 | 28년 이상의 운영 경험
            </p>
            <p className="text-text-dark text-sm sm:text-base">
              {COMPANY_INFO.businessType}
            </p>
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

