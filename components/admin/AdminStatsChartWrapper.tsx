"use client";

import dynamic from "next/dynamic";
import { AdminStatsChart } from "@/components/admin/AdminStatsChart";

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
    loading: () => (
      <div className="grid md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-5 h-[336px] flex items-center justify-center">
            <span className="text-sm text-gray-300">차트 불러오는 중…</span>
          </div>
        ))}
      </div>
    )
  }
);

export function AdminStatsChartWrapper({ monthlyData, categoryData }: AdminStatsChartWrapperProps) {
  return <DynamicAdminStatsChart monthlyData={monthlyData} categoryData={categoryData} />;
}
