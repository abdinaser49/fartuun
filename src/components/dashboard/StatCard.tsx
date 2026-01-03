import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: ReactNode;
  trend?: "up" | "down";
  className?: string;
}

export function StatCard({ title, value, change, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("stat-card opacity-0 animate-slide-up", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <ArrowUp className="w-4 h-4 text-success" />
              ) : (
                <ArrowDown className="w-4 h-4 text-destructive" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-success" : "text-destructive"
                )}
              >
                {change}%
              </span>
              <span className="text-sm text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
