import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, Building2 } from "lucide-react";

async function getProducts() {
  return await prisma.product.findMany({
    orderBy: [
      { category: "asc" },
      { title: "asc" },
    ],
  });
}

const categoryLabels: Record<string, string> = {
  camp: "교육·학습 캠프",
  culture: "문화·예술·체험",
  sports: "스포츠 연계",
  study_abroad: "해외연수·유학",
  leadership: "리더십·인성",
};

const regionLabels: Record<string, string> = {
  Korea: "국내",
  Japan: "일본",
  Philippines: "필리핀",
  Global: "글로벌",
};

export const metadata = {
  title: "주요 상품 - Touch The World",
  description: "터치더월드의 다양한 교육 프로그램과 상품을 소개합니다.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  // 카테고리별로 그룹화
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

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
            <span className="text-text-dark">주요 상품</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-green/5 to-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-wide text-text-dark">
              주요 상품 소개
            </h1>
            <p className="text-lg text-text-gray leading-relaxed">
              터치더월드의 다양한 교육 프로그램과 상품을 소개합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Products by Category */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-3xl font-bold text-text-dark">
                    {categoryLabels[category] || category}
                  </h2>
                  <span className="text-text-gray text-sm">
                    ({categoryProducts.length}개)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-6 border-2 border-gray-200 rounded-xl bg-white hover:border-brand-green hover:shadow-lg transition-all group"
                    >
                      {product.imageUrl && (
                        <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-text-dark mb-3">
                        {product.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-text-gray">
                        {product.region && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{regionLabels[product.region] || product.region}</span>
                          </div>
                        )}
                        {product.duration && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{product.duration}</span>
                          </div>
                        )}
                        {product.target && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{product.target}</span>
                          </div>
                        )}
                        {product.partner && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="text-xs">{product.partner}</span>
                          </div>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-sm text-text-gray mt-4 line-clamp-3">
                          {product.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              맞춤형 프로그램 문의
            </h2>
            <p className="text-lg text-text-gray mb-8">
              학교와 기관에 맞는 맞춤형 프로그램을 제안해드립니다.
            </p>
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-8 py-3 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] font-medium"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

