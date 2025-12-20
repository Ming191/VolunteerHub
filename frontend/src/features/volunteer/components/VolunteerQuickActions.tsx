import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Bell, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface VolunteerQuickActionsProps {
  onBrowse: () => void;
  onRegistrations: () => void;
  onNotifications: () => void;
  onProfile: () => void;
}

export const VolunteerQuickActions = ({
  onBrowse,
  onRegistrations,
  onNotifications,
  onProfile,
}: VolunteerQuickActionsProps) => {
  const actions = [
    {
      icon: Calendar,
      label: "Browse Events",
      onClick: onBrowse,
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: Users,
      label: "Registrations",
      onClick: onRegistrations,
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: onNotifications,
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: UserCircle,
      label: "Profile",
      onClick: onProfile,
      color: "from-purple-600 to-purple-700",
    },
  ];

  return (
    <Card className="h-full border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              onClick={action.onClick}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative w-full p-3 rounded-lg border-2 border-gray-200 hover:border-green-600 bg-white hover:shadow-md transition-all duration-200 overflow-hidden"
              aria-label={action.label}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white/20 transition-colors duration-200">
                  <Icon className="h-5 w-5 text-green-600 group-hover:text-white transition-colors duration-200" />
                </div>
                <span className="font-semibold text-sm text-gray-900 group-hover:text-white transition-colors duration-200">
                  {action.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </CardContent>
    </Card>
  );
};
