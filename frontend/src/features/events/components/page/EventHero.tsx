import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import type { EventResponse } from '@/api-client';
import { format } from 'date-fns';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface EventHeroProps {
    event: EventResponse;
    isOrganizer?: boolean;
    onRegister?: () => void;
}

export const EventHero = ({ event, isOrganizer, onRegister }: EventHeroProps) => {
    const bgImage = event.imageUrls?.[0] || null;
    const { user } = useAuth();
    const { canRegister, isVolunteer, isEventEnded: eventEnded, isRegistrationClosed: registrationClosedByDeadline } = useEventPermissions(event);

    const getButtonConfig = () => {
        if (eventEnded) {
            return { text: 'Event Ended', disabled: true };
        }
        if (registrationClosedByDeadline) {
            return { text: 'Registration Closed', disabled: true };
        }
        if (event.isFull) {
            return { text: event.waitlistEnabled ? 'Join Waitlist' : 'Event Full', disabled: !event.waitlistEnabled };
        }
        return { text: 'Register Now', disabled: false };
    };

    const buttonConfig = getButtonConfig();

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Check out ${event.title} on VolunteerHub!`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // Ideally we'd show a toast here, but for now this is the fallback
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="relative w-full h-[400px] bg-muted overflow-hidden rounded-xl mb-8">
            {bgImage ? (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
            )}

            <div className="relative h-full container mx-auto px-6 py-8 flex flex-col justify-end text-white">
                <div className="space-y-4 max-w-4xl">
                    <div className="flex gap-2">
                        {Array.from(event.tags || []).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                {tag.replace(/_/g, ' ')}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        {event.title}
                    </h1>

                    <div className="flex items-center gap-4 text-white/90">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Hosted by {event.creatorName}</span>
                        </div>
                        <span>•</span>
                        <span>{format(new Date(event.eventDateTime), 'MMMM d, yyyy')}</span>
                    </div>

                    {!isOrganizer && user && isVolunteer && canRegister && (
                        <div className="flex gap-3 pt-4">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-white/90"
                                onClick={onRegister}
                                disabled={buttonConfig.disabled}
                            >
                                {buttonConfig.text}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent text-white border-white hover:bg-white/20"
                                onClick={handleShare}
                            >
                                <Share2 className="mr-2 h-4 w-4" /> Share
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
