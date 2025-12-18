import type { ReactNode } from "react";
import { Heart, Users, Award, HandHeart } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: "default" | "volunteer" | "organizer" | "admin";
}

const variantStyles = {
  default: {
    bgColor:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
    iconBg: "bg-gradient-to-br from-green-400 to-green-600",
    iconColor: "text-white",
    icon: HandHeart,
    borderColor: "border-green-200 dark:border-green-800",
  },
  volunteer: {
    bgColor:
      "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20",
    iconBg: "bg-gradient-to-br from-green-400 to-green-600",
    iconColor: "text-white",
    icon: Heart,
    borderColor: "border-green-200 dark:border-green-800",
  },
  organizer: {
    bgColor:
      "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20",
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    iconColor: "text-white",
    icon: Users,
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  admin: {
    bgColor:
      "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20",
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    iconColor: "text-white",
    icon: Award,
    borderColor: "border-blue-200 dark:border-blue-800",
  },
};

export const HeroSection = ({
  title,
  subtitle,
  children,
  variant = "default",
}: HeroSectionProps) => {
  const style = variantStyles[variant];
  const IconComponent = style.icon;

  return (
    <div
      className={`rounded-2xl ${style.bgColor} border-2 ${style.borderColor} shadow-lg mb-8 overflow-hidden`}
    >
      {/* Content */}
      <div className="px-8 py-10 sm:px-12 sm:py-12">
        <div className="max-w-4xl">
          {/* Icon decoration */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl ${style.iconBg} shadow-lg`}>
              <IconComponent className={`h-7 w-7 ${style.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Children content */}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </div>
  );
};
