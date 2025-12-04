import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  List, 
  Send, 
  Bus, 
  Mountain, 
  Plane, 
  Briefcase, 
  GraduationCap, 
  Globe,
  Shield,
  Lightbulb,
  Settings,
  ChevronRight
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Image from "next/image";

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

const programCategories = [
  { name: "수학여행", icon: Bus, href: "/programs?category=수학여행" },
  { name: "수련활동", icon: Mountain, href: "/programs?category=수련활동" },
  { name: "해외탐방", icon: Plane, href: "/programs?category=해외탐방" },
  { name: "진로체험", icon: Briefcase, href: "/programs?category=진로체험" },
  { name: "교사연수", icon: GraduationCap, href: "/programs?category=교사연수" },
  { name: "유학프로그램", icon: Globe, href: "/programs?category=유학프로그램" },
];

export default async function HomePage() {
  const recentEvents = await getRecentEvents();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl font-serif font-bold text-text-dark mb-4">
              TOUCH THE WORLD
            </h1>
            <p className="text-2xl font-semibold text-text-dark">
              터치더월드는 안전과 교육을 기반으로 하는 전문 교육여행사입니다.
            </p>
            <p className="text-lg text-text-gray">
              선생님의 행정 부담은 줄이고, 학생들의 경험은 넓힙니다.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-6 text-lg">
                <Link href="/programs" className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  전체 프로그램 보기
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white border-2 border-text-gray hover:bg-gray-50 px-8 py-6 text-lg text-text-dark">
                <Link href="/inquiry" className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  바로 문의하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-text-dark mb-12 text-center">
            | 어떤 여행을 찾으시나요?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {programCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-brand-green hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-green transition-colors">
                    <Icon className="w-8 h-8 text-brand-green group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-center font-semibold text-text-dark">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-brand-green" />
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">안전 최우선</h3>
              <p className="text-text-gray leading-relaxed">
                사전 답사 및 안전 점검 의무화, 전원 여행자 보험 가입을 원칙으로 합니다.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-10 h-10 text-brand-green" />
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">교육 목표 지향</h3>
              <p className="text-text-gray leading-relaxed">
                단순 관광이 아닌, 학교급별 교육 목표에 부합하는 맞춤형 커리큘럼을 제공합니다.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-brand-green" />
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-4">운영 전문성</h3>
              <p className="text-text-gray leading-relaxed">
                교육청 행정 서류 완벽 지원 및 안전 요원 자격증 소지 전문 인솔자 동행.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-text-dark">
              | 최근 진행 행사
            </h2>
            <Link href="/events" className="text-brand-green hover:text-brand-green/80 font-semibold flex items-center gap-1">
              더보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recentEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.images[0] ? (
                    <div className="relative w-full h-48 bg-gray-100">
                      <Image
                        src={event.images[0].url}
                        alt={`${event.school.name} 행사`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                      현장 사진 (썸네일)
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-brand-green font-semibold mb-2">
                      {event.program.category}
                    </div>
                    <div className="text-sm text-text-gray mb-2">
                      {format(new Date(event.date), "yyyy.MM.dd")}
                    </div>
                    <div className="text-base font-semibold text-text-dark mb-2">
                      {event.school.name}
                    </div>
                    <div className="text-sm text-text-gray">
                      {event.program.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-gray">
              등록된 행사가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

