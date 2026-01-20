import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  List, 
  Send, 
  Shield,
  Lightbulb,
  Settings,
  ChevronRight
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { HeroChatInputWrapper } from "@/components/HeroChatInputWrapper";

async function getRecentEvents() {
  try {
    return await prisma.event.findMany({
      take: 3,
      include: {
        school: true,
        program: true,
        images: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const recentEvents = await getRecentEvents();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-medium tracking-wide mb-2 sm:mb-4">
              <span className="text-brand-green-primary">TOUCH</span>{" "}
              <span className="text-text-dark">THE WORLD</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-text-dark" style={{ lineHeight: '1.4', letterSpacing: '-0.02em' }}>
              안전과 교육의 가치를 실현하는
              <br />
              프리미엄 교육여행 파트너
            </p>
            <p className="text-sm sm:text-base md:text-lg text-text-gray leading-relaxed">
              교육자의 시간을 절약하고,
              <br />
              학습자의 세계를 확장합니다.
            </p>
            
            {/* AI Chat Input */}
            <div className="pt-4 sm:pt-6">
              <HeroChatInputWrapper category={resolvedSearchParams?.category} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center pt-4 sm:pt-6">
              <Button asChild size="lg" className="bg-brand-green-primary hover:bg-brand-green-primary/90 hover:scale-[1.02] text-white px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg rounded-xl shadow-sm transition-all duration-200">
                <Link href="/programs" className="flex items-center justify-center gap-2 sm:gap-3">
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  전체 프로그램
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white border-2 border-gray250/50 hover:border-brand-green/50 hover:bg-brand-green/5 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg text-text-dark rounded-xl transition-all duration-200">
                <Link href="/inquiry" className="flex items-center justify-center gap-2 sm:gap-3">
                  <Send className="w-4 h-4" />
                  문의하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Categories */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark mb-6 sm:mb-12 text-center">
            | 프로그램 유형을 선택하세요
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto">
            {PROGRAM_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex flex-col items-center justify-center px-5 sm:px-7 md:px-9 py-5 sm:py-6 md:py-6 rounded-lg bg-white shadow-sm transform transition-all hover:shadow-md group min-h-[130px] sm:min-h-[140px]"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-8 md:h-8 text-brand-green" />
                  </div>
                  <span
                    className="text-center text-text-dark text-xs sm:text-base md:text-lg leading-snug break-keep whitespace-pre-line"
                    style={{ fontWeight: 350 }}
                  >
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-brand-green" />
              </div>
              <h3 className="text-lg sm:text-2xl font-medium text-text-dark mb-2 sm:mb-4">안전 최우선</h3>
              <p className="text-text-gray text-sm sm:text-base leading-relaxed">
                철저한 사전 답사와 안전 점검을 통해 모든 참가자의 안전을 보장합니다.
              </p>
            </div>
            <div className="text-center p-4 sm:p-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Lightbulb className="w-7 h-7 sm:w-10 sm:h-10 text-brand-green" />
              </div>
              <h3 className="text-lg sm:text-2xl font-medium text-text-dark mb-2 sm:mb-4">교육 목표 지향</h3>
              <p className="text-text-gray text-sm sm:text-base leading-relaxed">
                교육 목표에 최적화된 맞춤형 프로그램을 설계합니다.
              </p>
            </div>
            <div className="text-center p-4 sm:p-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6">
                <Settings className="w-7 h-7 sm:w-10 sm:h-10 text-brand-green" />
              </div>
              <h3 className="text-lg sm:text-2xl font-medium text-text-dark mb-2 sm:mb-4">운영 전문성</h3>
              <p className="text-text-gray text-sm sm:text-base leading-relaxed">
                전문 인솔자 배치까지, 모든 과정을 체계적으로 관리합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="py-10 sm:py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-text-dark">
              | 최근 진행 행사
            </h2>
            <Link href="/events" className="text-brand-green hover:text-brand-green/80 font-medium flex items-center gap-1 text-sm sm:text-base">
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recentEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex flex-nowrap gap-4 sm:gap-6 pb-2 sm:pb-3">
                {recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white min-w-[300px] sm:min-w-[360px] md:min-w-[400px] max-w-[400px] flex-shrink-0"
                  >
                    {event.images[0] ? (
                      <div className="relative w-full h-36 sm:h-48 bg-gray-100">
                        <Image
                          src={event.images[0].url}
                          alt={`${event.school.name} 행사`}
                          fill
                          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 400px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder className="h-36 sm:h-48 text-sm" text="현장 사진" />
                    )}
                    <div className="p-4 sm:p-6">
                      <div className="text-xs sm:text-sm text-brand-green font-medium mb-1 sm:mb-2">
                        {getCategoryDisplayName(event.program.category)}
                      </div>
                      <div className="text-xs sm:text-sm text-text-gray mb-1 sm:mb-2">
                        {format(new Date(event.date), "yyyy.MM.dd")}
                      </div>
                      <div className="text-sm sm:text-base font-medium text-text-dark mb-1 sm:mb-2">
                        {event.school.name}
                      </div>
                      <div className="text-xs sm:text-sm text-text-gray line-clamp-1">
                        {event.program.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-text-gray text-sm sm:text-base">
              등록된 행사가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

