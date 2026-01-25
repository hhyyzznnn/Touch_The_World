import { Prisma } from "@prisma/client";

// Program 타입 확장
export type ProgramWithRelations = Prisma.ProgramGetPayload<{
  include: {
    images: true;
    schedules: true;
  };
}>;

// Event 타입 확장
export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    school: true;
    program: true;
    images: true;
  };
}>;

// School 타입 확장
export type SchoolWithRelations = Prisma.SchoolGetPayload<{
  include: {
    events: {
      include: {
        program: true;
        images: true;
      };
    };
  };
}>;

// Inquiry 타입
export type InquiryStatus = "pending" | "completed";

export interface Inquiry {
  id: string;
  schoolName: string;
  contact: string;
  phone: string;
  email: string;
  message: string | null;
  expectedDate: string | null;
  participantCount: number | null;
  purpose: string | null;
  hasInstructor: boolean | null;
  preferredTransport: string | null;
  mealPreference: string | null;
  specialRequests: string | null;
  estimatedBudget: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document 타입
export type DocumentCategory = 
  | "안전관리"
  | "교육과정"
  | "행정서류"
  | "기타";

// Achievement 타입
export interface AchievementWithYear {
  year: number;
  achievements: {
    id: string;
    institution: string;
    content: string;
    createdAt: Date;
  }[];
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

// Prisma Where 타입 유틸리티
export type ProgramWhereInput = Prisma.ProgramWhereInput;
export type EventWhereInput = Prisma.EventWhereInput;
export type SchoolWhereInput = Prisma.SchoolWhereInput;
export type AchievementWhereInput = Prisma.AchievementWhereInput;

