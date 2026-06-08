"use client";

import {
  AreaChart,
  Area,
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

const C = { green: "#10b981", blue: "#6366f1" };

function formatMonth(value: string) {
  const [, month] = value.split("-");
  return month ? `${parseInt(month)}월` : value;
}

function LineTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-sm min-w-[140px]">
      <p className="text-gray-400 text-xs font-medium mb-2.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mb-1.5 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-gray-500 text-xs">{entry.name}</span>
          </div>
          <span className="font-semibold text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltipContent({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{payload[0].value}개</p>
    </div>
  );
}

export function AdminStatsChart({ monthlyData, categoryData }: AdminStatsChartProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* 월별 통계 */}
      <div className="bg-white p-5 rounded-xl border">
        <p className="text-sm font-semibold text-gray-700 mb-0.5">월별 진행 내역 및 문의</p>
        <p className="text-xs text-gray-400 mb-5">최근 6개월</p>
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.18} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.18} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <Tooltip content={<LineTooltip />} />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
              formatter={(value) => (
                <span style={{ color: "#6b7280", fontSize: 12 }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke={C.blue}
              strokeWidth={2}
              fill="url(#gradInquiries)"
              dot={{ r: 3, fill: C.blue, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name="문의"
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke={C.green}
              strokeWidth={2}
              fill="url(#gradEvents)"
              dot={{ r: 3, fill: C.green, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name="진행 내역"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 통계 */}
      <div className="bg-white p-5 rounded-xl border">
        <p className="text-sm font-semibold text-gray-700 mb-0.5">카테고리별 프로그램 수</p>
        <p className="text-xs text-gray-400 mb-5">등록된 프로그램 기준</p>
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -20, bottom: 36 }}>
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={1} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <Tooltip content={<BarTooltipContent />} cursor={{ fill: "#f9fafb", radius: 6 }} />
            <Bar
              dataKey="count"
              fill="url(#gradBar)"
              name="프로그램 수"
              radius={[5, 5, 0, 0]}
              maxBarSize={52}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
