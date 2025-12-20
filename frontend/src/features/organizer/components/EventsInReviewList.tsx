import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileCheck, MapPin, ArrowRight } from "lucide-react";
import type { EventResponse } from "@/api-client";
import { motion } from "framer-motion";

interface EventsInReviewListProps {
  events: EventResponse[];
  onEventClick: (id: number) => void;
}

export const EventsInReviewList = ({
  events,
  onEventClick,
}: EventsInReviewListProps) => {
  return (
    <Card className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
            <FileCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Events In Review
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Awaiting admin approval
            </CardDescription>
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
                onClick={() => onEventClick(event.id)}
                className="group w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 bg-white hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer transition-all duration-300 text-left"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
                        <FileCheck className="h-4 w-4 text-blue-600 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            </motion.div>
          ))}
          {events.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
                <FileCheck className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-2">
                All events approved
              </p>
              <p className="text-sm text-gray-600">No events awaiting review</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
