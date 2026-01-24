"use client";

import dynamic from "next/dynamic";
import { AdminStatsChart } from "@/components/AdminStatsChart";

interface MonthlyData {
  month: string;
  events: number;
  inquiries: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface AdminStatsChartWrapperProps {
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

// 차트 컴포넌트 동적 import (번들 크기 최적화, 클라이언트에서만 렌더링)
const DynamicAdminStatsChart = dynamic(
  () => Promise.resolve({ default: AdminStatsChart }),
  { 
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-gray-400">차트 로딩 중...</div>
  }
);

export function AdminStatsChartWrapper({ monthlyData, categoryData }: AdminStatsChartWrapperProps) {
  return <DynamicAdminStatsChart monthlyData={monthlyData} categoryData={categoryData} />;
}
