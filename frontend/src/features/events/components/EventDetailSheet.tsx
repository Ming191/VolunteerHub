import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/animate-ui/components/radix/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import type { EventResponse } from '@/api-client';
import { useRegisterForEvent } from "../hooks/useRegistration";
import { useState } from "react";
import { EventRegistrationsModal } from "./EventRegistrationsModal";
import EditEventModal from "./EditEventModal";
import { useDeleteEvent } from "../hooks/useMyEvents";
import { useEventPermissions } from "../hooks/useEventPermissions";

// Sub-components
import { EventHeader } from './sheet/EventHeader';
import { EventImages } from './sheet/EventImages';
import { EventBadges } from './sheet/EventBadges';
import { EventDateInfo } from './sheet/EventDateInfo';
import { EventParticipation } from './sheet/EventParticipation';
import { EventDescription } from './sheet/EventDescription';
import { EventTags } from './sheet/EventTags';
import { EventSheetFooter } from './sheet/EventSheetFooter';

interface EventDetailSheetProps {
    event: EventResponse | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

type SheetView = 'event-details' | 'registrations';

export default function EventDetailSheet({ event, isOpen, onOpenChange }: EventDetailSheetProps) {
    const [isEditEventModalOpen, setEditEventModalOpen] = useState(false);
    const registerMutation = useRegisterForEvent();
    const deleteEventMutation = useDeleteEvent();
    const [currentView, setCurrentView] = useState<SheetView>('event-details');

    // Use custom hook for permissions
    const { canRegister } = useEventPermissions(event);

    if (!event) return null;

    const handleRegister = () => {
        if (!event) return;
        if (!canRegister) return;
        registerMutation.mutate(event.id);
    };

    const handleViewRegistration = () => {
        setCurrentView('registrations');
    }

    const handleBackToDetails = () => {
        setCurrentView('event-details');
    }

    const handleDeleteEvent = () => {
        deleteEventMutation.mutate(event.id);
    }

    const handleEditEvent = () => {
        setEditEventModalOpen(true);
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">

                {currentView === 'event-details' ? (
                    <>
                        <EventHeader
                            event={event}
                            onEdit={handleEditEvent}
                            onDelete={handleDeleteEvent}
                        />

                        <div className="space-y-6 pb-20">
                            <EventImages
                                imageUrls={event.imageUrls}
                                title={event.title}
                            />

                            <EventBadges event={event} />

                            <EventDateInfo event={event} />

                            <Separator />

                            <EventParticipation event={event} />

                            <Separator />

                            <EventDescription description={event.description} />

                            <EventTags tags={event.tags} />
                        </div>

                        <EventSheetFooter
                            event={event}
                            onViewRegistrations={handleViewRegistration}
                            onRegister={handleRegister}
                        />
                    </>
                ) : (
                    // View registrations
                    <div className="h-full flex flex-col">
                        <SheetHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleBackToDetails}
                                    className="h-8 w-8"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <SheetTitle className="text-2xl">Registrations</SheetTitle>
                                    <SheetDescription>
                                        {event.title} - {event.creatorName}
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto">
                            <EventRegistrationsModal eventId={event.id} />
                        </div>
                    </div>
                )}
            </SheetContent>

            <EditEventModal
                open={isEditEventModalOpen}
                onOpenChange={setEditEventModalOpen}
                event={event}
                onSuccess={() => {
                    // reload data or callback
                }}
            />
        </Sheet>
    );
}
