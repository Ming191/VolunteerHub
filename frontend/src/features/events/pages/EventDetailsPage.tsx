
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetEvent } from '../hooks/useEvents';
import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import AnimatedPage from '@/components/common/AnimatedPage';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEventPermissions } from '../hooks/useEventPermissions';
import {
    EventHero,
    EventInfoSidebar,
    EventContentTabs
} from '../components/page';

export const EventDetailsPage = () => {
    const { eventId } = useParams({ from: '/_auth/events/$eventId' });
    const id = parseInt(eventId);
    const navigate = useNavigate();

    const { data: event, isLoading, isError, error, refetch } = useGetEvent(id);
    const { isOrganizer } = useEventPermissions(event || null);

    const handleRegister = () => {
        // Implement registration logic later, possibly opening a modal
        console.log("Register clicked");
    };

    const handleBack = () => {
        // Go back to previous page or dashboard
        if (window.history.length > 1) {
            navigate({ to: '..' });
        } else {
            navigate({ to: '/events' });
        }
    };

    return (
        <AnimatedPage>
            <SkeletonTransition
                isLoading={isLoading}
                skeleton={<div className="h-screen w-full bg-muted animate-pulse" />}
            >
                {isError ? (
                    <div className="container mx-auto py-8">
                        <ApiErrorState error={error} onRetry={refetch} />
                    </div>
                ) : event ? (
                    <div className="min-h-screen bg-background pb-20">
                        {/* Optional: Breadcrumbs or Back Button Area */}
                        <div className="container mx-auto py-4">
                            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" onClick={handleBack}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                            </Button>
                        </div>

                        <EventHero event={event} isOrganizer={isOrganizer} />

                        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
                            <div className="lg:col-span-2 space-y-8">
                                <EventContentTabs event={event} />
                            </div>

                            <div className="lg:col-span-1">
                                <EventInfoSidebar event={event} onRegister={handleRegister} isOrganizer={isOrganizer} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </SkeletonTransition>
        </AnimatedPage>
    );
};
