import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* CTA Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            가장 안전하고 유익한 여행, 지금 준비하세요.
          </h3>
          <p className="text-gray-300 mb-8">
            견적 요청을 남겨주시면 담당자가 24시간 내에 연락드립니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8">
              <Link href="/inquiry" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                카카오톡 상담
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8">
              <Link href="/inquiry" className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                온라인 견적 문의
              </Link>
            </Button>
          </div>
        </div>

        {/* Contact & Company Info */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-gray-700 pt-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5" />
              <span className="text-xl font-semibold">1800-8078</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:syh2123@naver.com" className="text-gray-300 hover:text-white">
                syh2123@naver.com
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
            </p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-gray-300 mb-2">
              상호명: 터치더월드 (Touch The World)
            </p>
            <p className="text-gray-300 mb-2">
              1996년 설립 | 28년 이상의 운영 경험
            </p>
            <p className="text-gray-300">
              교육·체험·AI 융합 프로그램 전문 기업
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 TouchTheWorld. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

