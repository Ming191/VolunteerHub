import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface PendingRegistration {
  eventId: number;
  eventTitle: string;
  registeredAt: string;
}

interface PendingRegistrationsListProps {
  registrations: PendingRegistration[];
  onEventClick: () => void;
}

export const PendingRegistrationsList = ({
  registrations,
  onEventClick,
}: PendingRegistrationsListProps) => {
  return (
    <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Pending Approvals
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Awaiting organizer response
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {registrations.map((registration, index) => (
            <motion.div
              key={`${registration.eventId}-${registration.registeredAt}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={onEventClick}
                className="group w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 bg-white hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-500 transition-colors duration-300">
                    <AlertCircle className="h-4 w-4 text-orange-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                      {registration.eventTitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span>
                        Registered{" "}
                        {formatDistanceToNow(
                          new Date(registration.registeredAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          {registrations.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex p-4 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                All caught up!
              </p>
              <p className="text-xs text-gray-500">No pending registrations</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
