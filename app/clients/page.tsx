import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Building2, GraduationCap, Globe, Briefcase } from "lucide-react";

async function getClients() {
  return await prisma.client.findMany({
    orderBy: [
      { type: "asc" },
      { name: "asc" },
    ],
  });
}

const typeLabels: Record<string, string> = {
  public: "공공·교육기관",
  university: "대학교",
  highschool: "고등학교",
  corporation: "기업·단체",
};

const typeIcons: Record<string, typeof Building2> = {
  public: Globe,
  university: GraduationCap,
  highschool: GraduationCap,
  corporation: Briefcase,
};

export const metadata = {
  title: "주요 고객사 - Touch The World",
  description: "터치더월드와 함께하는 주요 고객사 및 파트너 기관을 소개합니다.",
};

export default async function ClientsPage() {
  const clients = await getClients();

  // 타입별로 그룹화
  const groupedClients = clients.reduce((acc, client) => {
    if (!acc[client.type]) {
      acc[client.type] = [];
    }
    acc[client.type].push(client);
    return acc;
  }, {} as Record<string, typeof clients>);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-text-gray">
            <Link href="/" className="hover:text-brand-green transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-dark">주요 고객사</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-wide text-text-dark">
              Major Accounts & Clients
            </h1>
            <p className="text-lg text-text-gray leading-relaxed">
              터치더월드와 함께하는 주요 고객사 및 파트너 기관을 소개합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Clients by Type */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {Object.entries(groupedClients).map(([type, typeClients]) => {
              const Icon = typeIcons[type] || Building2;
              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-brand-green" />
                    </div>
                    <h2 className="text-3xl font-bold text-text-dark">
                      {typeLabels[type] || type}
                    </h2>
                    <span className="text-text-gray text-sm">
                      ({typeClients.length}개)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-6 border-2 border-gray-200 rounded-xl bg-white hover:border-brand-green hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {client.logoUrl ? (
                            <Image
                              src={client.logoUrl}
                              alt={client.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-dark mb-1">
                              {client.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-text-gray">
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {client.country}
                              </span>
                            </div>
                            {client.description && (
                              <p className="text-sm text-text-gray mt-2 line-clamp-2">
                                {client.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              함께 성장하는 파트너십
            </h2>
            <p className="text-lg text-text-gray mb-8">
              터치더월드와 함께 특별한 교육 경험을 만들어보세요.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-8 py-3 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] font-medium"
              >
                상품 보기
              </Link>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 hover:border-brand-green/50 hover:bg-brand-green/5 text-text-dark px-8 py-3 rounded-xl transition-all duration-200 font-medium"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

