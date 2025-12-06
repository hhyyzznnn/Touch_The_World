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

