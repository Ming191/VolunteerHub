import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  variant?: "default" | "volunteer" | "orange" | "purple" | "blue";
}

const variantStyles = {
  default: {
    iconBg: "bg-gradient-to-br from-green-100 to-green-200",
    iconColor: "text-green-600",
    valueColor: "text-gray-900",
    accentColor: "text-green-600",
    hoverBorder: "hover:border-green-600",
  },
  volunteer: {
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-200",
    iconColor: "text-green-600",
    valueColor: "text-gray-900",
    accentColor: "text-green-600",
    hoverBorder: "hover:border-green-600",
  },
  orange: {
    iconBg: "bg-gradient-to-br from-orange-100 to-amber-200",
    iconColor: "text-orange-600",
    valueColor: "text-gray-900",
    accentColor: "text-orange-600",
    hoverBorder: "hover:border-orange-600",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-100 to-violet-200",
    iconColor: "text-purple-600",
    valueColor: "text-gray-900",
    accentColor: "text-purple-600",
    hoverBorder: "hover:border-purple-600",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-200",
    iconColor: "text-blue-600",
    valueColor: "text-gray-900",
    accentColor: "text-blue-600",
    hoverBorder: "hover:border-blue-600",
  },
};

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: StatsCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card
      className={`transition-shadow duration-200 border-2 border-gray-200 bg-white shadow-sm`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3.5 rounded-xl ${styles.iconBg} shadow-sm`}>
            <Icon className={`h-7 w-7 ${styles.iconColor}`} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        <div
          className={`text-4xl font-bold ${styles.valueColor} tracking-tight leading-none flex items-center justify-start`}
        >
          {value.toLocaleString()}
        </div>
        <CardTitle className={`text-sm font-semibold ${styles.accentColor}`}>
          {title}
        </CardTitle>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};
