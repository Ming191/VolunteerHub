import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Award, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Define locally based on dashboard usage
interface TopEvent {
  id: number;
  title: string;
  count: number;
}

interface TopEventsListProps {
  events: TopEvent[];
  onEventClick: (id: number) => void;
}

export const TopEventsList = ({ events, onEventClick }: TopEventsListProps) => {
  const getMedalColor = (index: number) => {
    if (index === 0) return "from-yellow-100 to-yellow-200 text-yellow-700";
    if (index === 1) return "from-gray-100 to-gray-200 text-gray-700";
    if (index === 2) return "from-orange-100 to-orange-200 text-orange-700";
    return "from-green-100 to-green-200 text-green-700";
  };

  return (
    <Card className="lg:col-span-3 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-sm">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Top Performing Events
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              Most popular events by registration
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onEventClick(event.id)}
                className="group w-full p-5 rounded-xl border-2 border-gray-200 hover:border-purple-500 bg-white hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer transition-all duration-300 text-left relative overflow-hidden"
              >
                {/* Medal Badge */}
                <div
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br ${getMedalColor(
                    index
                  )} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-xs font-bold">#{index + 1}</span>
                </div>

                {/* Event Content */}
                <div className="pr-10">
                  <p className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-3 min-h-[40px]">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 group-hover:from-purple-100 group-hover:to-purple-200 transition-colors">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <span className="text-2xl font-bold text-purple-600">
                        {event.count}
                      </span>
                      <p className="text-xs text-gray-600 font-medium">
                        registrations
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          {events.length === 0 && (
            <motion.div
              className="col-span-3 text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 mb-4">
                <Award className="h-12 w-12 text-purple-600" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-2">
                No events with registrations yet
              </p>
              <p className="text-sm text-gray-600">
                Create events to start building your community
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
