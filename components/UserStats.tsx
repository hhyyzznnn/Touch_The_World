"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserStatsProps {
  userId: string;
}

export function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch stats:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">작성한 후기</span>
          </div>
          <div className="text-2xl font-bold">{stats.stats.reviewCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">즐겨찾기</span>
          </div>
          <div className="text-2xl font-bold">{stats.stats.favoriteCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">문의 내역</span>
          </div>
          <div className="text-2xl font-bold">{stats.stats.inquiryCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">상담 내역</span>
          </div>
          <div className="text-2xl font-bold">{stats.stats.consultingLogCount}</div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 최근 후기 */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">최근 작성한 후기</h3>
            {stats.stats.reviewCount > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/my-reviews">전체 보기</Link>
              </Button>
            )}
          </div>
          {stats.recentReviews.length === 0 ? (
            <p className="text-gray-500 text-sm">작성한 후기가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentReviews.map((review: any) => (
                <div key={review.id} className="border-b pb-3 last:border-b-0">
                  <Link
                    href={`/programs/${review.program.id}`}
                    className="text-sm font-medium text-brand-green-primary hover:underline flex items-center gap-1 mb-1"
                  >
                    {review.program.title}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 즐겨찾기 */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">최근 즐겨찾기</h3>
            {stats.stats.favoriteCount > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/favorites">전체 보기</Link>
              </Button>
            )}
          </div>
          {stats.recentFavorites.length === 0 ? (
            <p className="text-gray-500 text-sm">즐겨찾기한 프로그램이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentFavorites.map((favorite: any) => (
                <div key={favorite.id} className="border-b pb-3 last:border-b-0">
                  <Link
                    href={`/programs/${favorite.program.id}`}
                    className="text-sm font-medium text-brand-green-primary hover:underline flex items-center gap-1 mb-1"
                  >
                    {favorite.program.title}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <div className="text-xs text-gray-500">
                    {new Date(favorite.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
