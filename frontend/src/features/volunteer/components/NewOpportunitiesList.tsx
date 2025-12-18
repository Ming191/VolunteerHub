import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardEventItem } from '@/api-client';
import { motion } from 'framer-motion';

interface NewOpportunitiesListProps {
    events: DashboardEventItem[];
    onEventClick: (id: number) => void;
}

export const NewOpportunitiesList = ({ events, onEventClick }: NewOpportunitiesListProps) => {
    return (
        <Card className="lg:col-span-3 border-2 border-purple-100 dark:border-purple-900/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-b-2 border-purple-100 dark:border-purple-900/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                New Opportunities
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Fresh events just for you
                            </CardDescription>
                        </div>
                    </div>
                    {events.length > 0 && (
                        <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                                {events.length} New
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.slice(0, 6).map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <button
                                className="group relative w-full text-left p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-gray-800 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer transition-all duration-300 overflow-hidden"
                                onClick={() => onEventClick(event.id)}
                            >
                                {/* New badge */}
                                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold shadow-lg">
                                    NEW
                                </div>

                                {/* Icon */}
                                <div className="mb-4">
                                    <div className="inline-flex p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-500 transition-colors duration-300">
                                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 pr-8 min-h-[2.5rem]">
                                        {event.title}
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
                                            <span className="font-medium">
                                                {format(new Date(event.eventDateTime), 'MMM dd, yyyy • h:mm a')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
                                            <span className="line-clamp-1">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* View details prompt */}
                                    <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span>View Details</span>
                                        <svg
                                            className="h-3 w-3 transform group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    ))}
                    {events.length === 0 && (
                        <motion.div
                            className="col-span-full text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="inline-flex p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                                <TrendingUp className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                No new events yet
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Check back soon for fresh opportunities
                            </p>
                        </motion.div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
