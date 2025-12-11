import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/animate-ui/components/radix/dialog';
import { eventService } from '../api/eventService';
import type { CreateEventRequest } from '@/api-client';
import EventForm, { type EventFormValues } from './EventForm';

interface AddEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const formatDateForBackend = (date: Date): string => {
    return date.toISOString().substring(0, 19);
};

export default function AddEventModal({ open, onOpenChange, onSuccess }: AddEventModalProps) {

    const handleError = (error: unknown): void => {
        const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        const status = err?.response?.status;

        if (status === 401) {
            toast.error('Authentication required', {
                description: 'Your session has expired. Please log in again.',
            });
            localStorage.clear();
            setTimeout(() => {
                window.location.href = '/signin';
            }, 2000);
            return;
        }

        if (status === 400) {
            const errorMessage = err?.response?.data?.message || 'Invalid event data. Please check your inputs.';
            toast.error('Validation error', { description: errorMessage });
            return;
        }

        if (status === 403) {
            const storedUser = localStorage.getItem('user');
            const userRole = storedUser ? JSON.parse(storedUser).role : 'unknown';
            toast.error('Permission denied', {
                description: `You do not have permission to create events. Current role: ${userRole}. Required: EVENT_ORGANIZER or ADMIN.`,
            });
            return;
        }

        const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
        toast.error('Failed to create event', { description: errorMessage });
    };

    const handleCreateEvent = async (values: EventFormValues, files: File[]) => {
        try {
            const eventData = {
                title: values.title,
                description: values.description,
                location: values.location,
                eventDateTime: formatDateForBackend(values.eventDateTime),
                endDateTime: formatDateForBackend(values.endDateTime),
                registrationDeadline: values.registrationDeadline
                    ? formatDateForBackend(values.registrationDeadline)
                    : undefined,
                maxParticipants: values.maxParticipants,
                waitlistEnabled: values.waitlistEnabled,
                tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
            };

            await eventService.createEvent(eventData as CreateEventRequest, files);

            toast.success('Event created successfully!', {
                description: 'Your event has been submitted for approval.',
            });

            onOpenChange(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            handleError(error);
            // Re-throw to let EventForm know it failed (if it handles isSubmitting state internally)
            // But EventForm uses useForm's isSubmitting which depends on promise resolution.
            throw error;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new volunteer event. Events require admin approval before being published.
                    </DialogDescription>
                </DialogHeader>

                <EventForm
                    onSubmit={handleCreateEvent}
                    onCancel={() => onOpenChange(false)}
                    submitLabel="Create Event"
                />
            </DialogContent>
        </Dialog>
    );
}
