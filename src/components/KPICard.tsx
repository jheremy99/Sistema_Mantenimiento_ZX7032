import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

const KPICard = ({ title, value, subtitle, icon, trend, className }: KPICardProps) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-sm font-medium mt-2",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default KPICard;