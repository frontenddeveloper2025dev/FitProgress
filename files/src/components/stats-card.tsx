import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  className
}: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-slate-200", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColor === "text-primary" ? "bg-primary/10" : iconColor === "text-secondary" ? "bg-secondary/10" : iconColor === "text-accent" ? "bg-accent/10" : "bg-red-500/10")}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {trend && (
          <span className="text-xs text-secondary font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
