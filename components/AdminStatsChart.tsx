"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  events: number;
  inquiries: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface AdminStatsChartProps {
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

export function AdminStatsChart({ monthlyData, categoryData }: AdminStatsChartProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 월별 통계 */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="text-lg font-semibold mb-4">월별 진행 내역 및 문의</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#10b981"
              strokeWidth={2}
              name="진행 내역"
            />
            <Line
              type="monotone"
              dataKey="inquiries"
              stroke="#3b82f6"
              strokeWidth={2}
              name="문의"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 통계 */}
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="text-lg font-semibold mb-4">카테고리별 상품 수</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" name="상품 수" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
