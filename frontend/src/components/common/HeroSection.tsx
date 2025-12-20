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
    bgColor: "bg-white",
    borderLeft: "border-l-4 border-l-green-600",
    iconBg: "bg-gradient-to-br from-green-100 to-green-200",
    iconColor: "text-green-600",
    icon: HandHeart,
    borderColor: "border-gray-200",
  },
  volunteer: {
    bgColor: "bg-white",
    borderLeft: "border-l-4 border-l-green-600",
    iconBg: "bg-gradient-to-br from-green-100 to-green-200",
    iconColor: "text-green-600",
    icon: null,
    borderColor: "border-gray-200",
  },
  organizer: {
    bgColor: "bg-white",
    borderLeft: "border-l-4 border-l-orange-600",
    iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
    iconColor: "text-orange-600",
    icon: Users,
    borderColor: "border-gray-200",
  },
  admin: {
    bgColor: "bg-white",
    borderLeft: "border-l-4 border-l-blue-600",
    iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
    iconColor: "text-blue-600",
    icon: Award,
    borderColor: "border-gray-200",
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
      className={`rounded-2xl ${style.bgColor} ${style.borderLeft} border ${style.borderColor} shadow-sm hover:shadow-md transition-shadow mb-8 overflow-hidden`}
    >
      {/* Content */}
      <div className="px-8 py-8 sm:px-10 sm:py-10">
        <div className="max-w-4xl">
          {/* Icon decoration */}
          {IconComponent && (
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${style.iconBg} shadow-lg`}>
                <IconComponent className={`h-7 w-7 ${style.iconColor}`} />
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl leading-relaxed">
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
