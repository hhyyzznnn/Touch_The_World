import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getUserReviews(userId: string) {
  return await prisma.review.findMany({
    where: { userId },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function MyReviewsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const reviews = await getUserReviews(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "내 후기" }]} />
        <div className="bg-white rounded-lg shadow p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-medium mb-6">내가 작성한 후기</h1>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">작성한 후기가 없습니다.</p>
              <Button asChild>
                <Link href="/programs">프로그램 보러가기</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/programs/${review.program.id}`}
                        className="text-lg font-semibold text-brand-green-primary hover:underline flex items-center gap-2"
                      >
                        {review.program.title}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
