import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { DashboardEventItem } from "@/api-client";
import { motion } from "framer-motion";

interface UpcomingEventsListProps {
  events: DashboardEventItem[];
  onEventClick: (event: DashboardEventItem) => void;
}

export const UpcomingEventsList = ({
  events,
  onEventClick,
}: UpcomingEventsListProps) => {
  return (
    <Card className="lg:col-span-2 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                My Upcoming Events
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {events.length} {events.length === 1 ? "event" : "events"}{" "}
                scheduled
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onEventClick(event)}
                className="group w-full p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 bg-white hover:shadow-lg hover:shadow-green-500/20 cursor-pointer transition-all duration-300 text-left"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-500 transition-colors duration-300">
                        <Calendar className="h-4 w-4 text-green-600 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-xs font-semibold text-green-700 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.eventDateTime), "MMM dd, h:mm a")}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          {events.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                No upcoming events
              </p>
              <p className="text-xs text-gray-500">
                Browse events to find opportunities
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
