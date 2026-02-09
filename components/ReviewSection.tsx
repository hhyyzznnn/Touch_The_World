"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Edit2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewSectionProps {
  programId: string;
  initialReviews?: Review[];
  programRating?: number | null;
  reviewCount?: number;
}

export function ReviewSection({
  programId,
  initialReviews = [],
  programRating = 0,
  reviewCount = 0,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [user, setUser] = useState<any>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?programId=${programId}`);
      const data = await response.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }, [programId]);

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // 후기 목록 새로고침
    fetchReviews();
  }, [programId, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rating || !content.trim()) {
      setError("평점과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId
        ? `/api/reviews/${editingId}`
        : "/api/reviews";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          rating,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsWriting(false);
        setRating(0);
        setContent("");
        setEditingId(null);
        await fetchReviews();
        router.refresh(); // 프로그램 평점 업데이트를 위해 새로고침
      } else {
        setError(data.error || "후기 작성에 실패했습니다.");
      }
    } catch (error) {
      setError("후기 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setContent(review.content);
    setIsWriting(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("정말 이 후기를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchReviews();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "후기 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("후기 삭제 중 오류가 발생했습니다.");
    }
  };

  const myReview = reviews.find((r) => r.user.id === user?.id);

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">후기</h2>
          <div className="flex items-center gap-2">
            {programRating && programRating > 0 && (
              <>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(programRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {programRating.toFixed(1)} ({reviewCount}개)
                </span>
              </>
            )}
          </div>
        </div>
        {user && !myReview && !isWriting && (
          <Button onClick={() => setIsWriting(true)} size="sm">
            후기 작성
          </Button>
        )}
      </div>

      {isWriting && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="review-content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              후기 내용
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
              placeholder="후기를 작성해주세요..."
              required
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : editingId ? "수정" : "작성"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsWriting(false);
                setRating(0);
                setContent("");
                setEditingId(null);
                setError("");
              }}
            >
              취소
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          아직 작성된 후기가 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{review.user.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {user && user.id === review.user.id && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="p-1 text-gray-500 hover:text-brand-green-primary"
                        aria-label="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
