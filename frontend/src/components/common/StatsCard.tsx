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
    borderColor: "border-gray-200",
  },
  volunteer: {
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-200",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
    borderColor: "border-green-200",
  },
  orange: {
    iconBg: "bg-gradient-to-br from-orange-100 to-amber-200",
    iconColor: "text-orange-600",
    valueColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-100 to-violet-200",
    iconColor: "text-purple-600",
    valueColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-200",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
    borderColor: "border-blue-200",
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
      className={`transition-shadow hover:shadow-lg border-2 ${styles.borderColor} bg-white shadow-sm`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${styles.iconBg} shadow-md`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
      </CardHeader>

      <CardContent>
        <div className={`text-2xl font-bold ${styles.valueColor}`}>
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};
