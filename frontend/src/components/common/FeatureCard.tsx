import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "volunteer" | "orange" | "purple" | "blue";
  onClick?: () => void;
}

const variantStyles = {
  default: {
    iconBg:
      "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-gray-900 dark:text-white",
    borderColor: "border-green-100 dark:border-green-900/30",
  },
  volunteer: {
    iconBg:
      "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-100 dark:border-green-900/30",
  },
  orange: {
    iconBg:
      "bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-800/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    titleColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-100 dark:border-orange-900/30",
  },
  purple: {
    iconBg:
      "bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/30 dark:to-violet-800/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-900/30",
  },
  blue: {
    iconBg:
      "bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-900/30",
  },
};

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  variant = "default",
  onClick,
}: FeatureCardProps) => {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;

  return (
    <Card
      className={`transition-all hover:shadow-xl border-2 ${
        styles.borderColor
      } bg-white/80 dark:bg-gray-900/80 backdrop-blur ${
        isClickable ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        {/* Icon */}
        <div
          className={`inline-flex p-3.5 rounded-xl ${styles.iconBg} shadow-md`}
        >
          <Icon className={`h-8 w-8 ${styles.iconColor}`} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={`text-xl font-bold ${styles.titleColor}`}>{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
