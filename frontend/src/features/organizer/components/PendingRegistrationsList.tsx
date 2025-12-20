import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, Users, ArrowRight } from "lucide-react";
import { formatDistanceToNowUTC } from "@/lib/dateUtils";
import { motion } from "framer-motion";

// Based on usage in OrganizerDashboard.tsx
interface PendingRegistration {
  id: number;
  primaryText: string;
  secondaryText: string;
  timestamp: string; // or Date
}

interface PendingRegistrationsListProps {
  registrations: PendingRegistration[];
  onRegistrationClick: () => void;
}

export const PendingRegistrationsList = ({
  registrations,
  onRegistrationClick,
}: PendingRegistrationsListProps) => {
  return (
    <Card className="lg:col-span-2 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Pending Registrations
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {registrations.length} volunteers waiting for approval
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {registrations.map((registration, index) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={onRegistrationClick}
                className="group w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 bg-white hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer transition-all duration-300 text-left"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-500 transition-colors duration-300">
                        <Users className="h-4 w-4 text-orange-600 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {registration.primaryText}
                        </p>
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                          {registration.secondaryText}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-xs font-semibold text-orange-700 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {(() => {
                        try {
                          const date = registration.timestamp
                            ? new Date(registration.timestamp)
                            : new Date();
                          if (isNaN(date.getTime())) return "Recently";
                          return formatDistanceToNowUTC(
                            registration.timestamp,
                            {
                              addSuffix: true,
                            }
                          );
                        } catch {
                          return "Recently";
                        }
                      })()}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          {registrations.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 mb-4">
                <Users className="h-12 w-12 text-orange-600" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-2">
                No pending registrations
              </p>
              <p className="text-sm text-gray-600">
                All volunteers have been reviewed
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
