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
    iconBg:
      "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30",
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-gray-900 dark:text-white",
    borderColor: "border-green-100 dark:border-green-900/30",
  },
  volunteer: {
    iconBg:
      "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30",
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-100 dark:border-green-900/30",
  },
  orange: {
    iconBg:
      "bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    valueColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-100 dark:border-orange-900/30",
  },
  purple: {
    iconBg:
      "bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    valueColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/30",
  },
  blue: {
    iconBg:
      "bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-900/30",
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
      className={`transition-shadow hover:shadow-lg border-2 ${styles.borderColor} bg-white/80 dark:bg-gray-900/80 backdrop-blur`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
