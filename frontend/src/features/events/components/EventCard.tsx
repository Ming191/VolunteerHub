import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UiEvent } from "@/types/ui-models";
import type { EventResponse } from "@/api-client";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

interface EventCardProps<T extends UiEvent | EventResponse> {
  event: T;
  onViewDetails?: (event: T) => void;
}

export const EventCard = <T extends UiEvent | EventResponse>({
  event,
  onViewDetails,
}: EventCardProps<T>) => {
  const isUiEvent = (e: UiEvent | EventResponse): e is UiEvent =>
    "availableSpotsText" in e;

  const availableSpotsText = isUiEvent(event)
    ? event.availableSpotsText
    : event.maxParticipants
    ? `${event.availableSpots} spots available`
    : "Unlimited spots";

  const hasImage = event.imageUrls && event.imageUrls.length > 0;
  const tags = (
    Array.isArray(event.tags) ? event.tags : Array.from(event.tags || [])
  ) as string[];

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-xl border-2 border-gray-200 hover:border-green-600 bg-white shadow-sm">
      {/* Image Header */}
      <CardHeader className="p-0 relative">
        {hasImage ? (
          <div className="relative">
            <img
              src={event.imageUrls[0]}
              alt={event.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <CardTitle className="text-lg font-bold text-white line-clamp-2">
                {event.title}
              </CardTitle>
            </div>
            {/* Full badge */}
            {event.isFull && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                  Full
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-center px-4 line-clamp-2 text-gray-900">
              {event.title}
            </CardTitle>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow p-4 space-y-3">
        {/* Event Details */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="font-medium text-gray-900">
              {formatDate(event.eventDateTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-600">
              {formatTime(event.eventDateTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-600 truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span
              className={`font-medium ${
                event.isFull ? "text-red-600" : "text-gray-900"
              }`}
            >
              {event.isFull ? "Event Full" : availableSpotsText}
            </span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {tags.slice(0, 3).map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-green-100 text-green-700"
              >
                {tag.replace(/_/g, " ")}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onViewDetails?.(event)}
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
