import { Prisma } from "@prisma/client";

// Event 타입 확장
export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    school: true;
    program: true;
    images: true;
  };
}>;

// Inquiry 타입
export type InquiryStatus = "pending" | "reviewing" | "quoted" | "completed";

export interface Inquiry {
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  message: string | null;
  expectedDate: string | null;
  departureDate: Date | null;
  returnDate: Date | null;
  linkedEventId: string | null;
  participantCount: number | null;
  purpose: string | null;
  hasInstructor: boolean | null;
  preferredTransport: string | null;
  mealPreference: string | null;
  specialRequests: string | null;
  estimatedBudget: number | null;
  destination: string | null;
  schoolLevel: string | null;
  accommodation: string | null;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// User Stats 타입
export interface UserStatsData {
  stats: {
    reviewCount: number;
    favoriteCount: number;
    inquiryCount: number;
    consultingLogCount: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
    program: {
      id: string;
      title: string;
    };
  }>;
  recentFavorites: Array<{
    id: string;
    createdAt: Date;
    program: {
      id: string;
      title: string;
      category: string;
    };
  }>;
}
