import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative Background Circle */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-rose-50/50"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className={`text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}
            >
              {trendUp ? "↗" : "↘"} {trend}
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
