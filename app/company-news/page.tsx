import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Metadata } from "next";
import { CompanyNewsType } from "@prisma/client";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "회사 소식 | 터치더월드",
  description:
    "터치더월드의 수상 소식, 혜택 안내, 모집 공고 및 대표 추천 도서를 확인하세요.",
  keywords: ["터치더월드 소식", "교육여행 뉴스", "수학여행 업체 소식", "추천 도서", "교육여행 전문기업"],
  alternates: { canonical: "/company-news" },
};

async function getCompanyNews() {
  return await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.COMPANY_NEWS },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, isPinned: true, createdAt: true },
  });
}

async function getBookCardNews() {
  return await prisma.companyNews.findMany({
    where: { type: CompanyNewsType.BOOK_CARD_NEWS, imageUrl: { not: null } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true, summary: true, imageUrl: true, createdAt: true },
  });
}

export default async function CompanyNewsPage() {
  const [list, books] = await Promise.all([getCompanyNews(), getBookCardNews()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-12">

        {/* 회사 소식 */}
        <section>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mb-2">회사 소식</h1>
          <p className="text-text-gray mb-6">수상 소식, 혜택 안내, 모집 공고 등 터치더월드의 최신 소식입니다.</p>

          {list.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
              등록된 소식이 없습니다.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">제목</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-24 sm:w-28">작성일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/news/${item.id}`}
                          className="flex items-center gap-2 text-text-dark hover:text-brand-green-primary hover:underline underline-offset-2"
                        >
                          {item.isPinned && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white flex-shrink-0">
                              공지
                            </span>
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-gray whitespace-nowrap">
                        {format(new Date(item.createdAt), "yyyy.MM.dd")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 도서 추천 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-brand-green-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-text-dark">추천 도서</h2>
          </div>
          <p className="text-text-gray mb-6">교육여행·진로·성장에 관한 추천 도서를 소개합니다.</p>

          {books.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-text-gray">
              등록된 도서가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/news/${book.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/5] bg-gray-100">
                    <Image
                      src={book.imageUrl!}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-text-dark line-clamp-2 leading-snug">{book.title}</p>
                    {book.summary && (
                      <p className="text-xs text-text-gray mt-1 line-clamp-2">{book.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{format(new Date(book.createdAt), "yyyy.MM.dd")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
