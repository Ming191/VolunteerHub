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
    iconBg: "bg-gradient-to-br from-green-100 to-green-200",
    iconColor: "text-green-600",
    titleColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
  volunteer: {
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-200",
    iconColor: "text-green-600",
    titleColor: "text-green-600",
    borderColor: "border-gray-200",
  },
  orange: {
    iconBg: "bg-gradient-to-br from-orange-100 to-amber-200",
    iconColor: "text-orange-600",
    titleColor: "text-orange-600",
    borderColor: "border-gray-200",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-100 to-violet-200",
    iconColor: "text-purple-600",
    titleColor: "text-purple-600",
    borderColor: "border-gray-200",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-600",
    borderColor: "border-gray-200",
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
      } bg-white/80 backdrop-blur ${isClickable ? "cursor-pointer" : ""}`}
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
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
