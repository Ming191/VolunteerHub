import { useState, useCallback, useEffect, useMemo } from 'react';
import { Image as ImageIcon, X, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogPopup } from '@/components/animate-ui/components/base/alert-dialog';
import { Link } from '@tanstack/react-router';
import { motion, type Transition } from 'motion/react';
import { type EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '@/features/events/api/eventService';

const transition: Transition = {
    type: 'spring',
    stiffness: 240,
    damping: 24,
    mass: 1,
};

interface EventImagesProps {
    eventId: number;
    imageUrls?: string[];
    title: string;
    showGallery?: boolean;
}

const EventImageItem = ({
    url,
    title,
    index,
    className,
    onClick
}: {
    url: string;
    title: string;
    index: number;
    className?: string;
    onClick?: () => void;
}) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    return (
        <div
            className={`relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ${className || ''}`}
            onClick={onClick}
        >
            {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            {status !== 'error' && (
                <img
                    src={url}
                    alt={`${title} - ${index + 1}`}
                    className={`relative w-full h-full object-cover z-10 transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}
        </div>
    );
};

export function EventImages({ eventId, imageUrls, title, showGallery = true }: EventImagesProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: selectedImageIndex ?? 0, loop: true });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['event-gallery', eventId],
        queryFn: ({ pageParam = 0 }) => eventService.getEventGallery(eventId, pageParam, 20),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.pageNumber + 1,
        enabled: showGallery,
    });

    // Combine main event images with paginated gallery images
    const imagesToDisplay = useMemo(() => {
        const mainImages = imageUrls?.map(url => ({ url, source: 'event' as const, authorName: undefined, postId: undefined as number | undefined })) || [];

        const galleryImages = data?.pages.flatMap(page =>
            page.content.map(img => ({
                url: img.url,
                source: img.source as 'event' | 'post',
                authorName: img.authorName || undefined,
                postId: img.postId || undefined
            }))
        ) || [];

        return [...mainImages, ...galleryImages];
    }, [imageUrls, data, showGallery]);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCurrentIndex(api.selectedScrollSnap());
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi);
        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (emblaApi && selectedImageIndex !== null) {
            emblaApi.scrollTo(selectedImageIndex, true); // Jump instantly without animation
        }
    }, [emblaApi, selectedImageIndex]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (imagesToDisplay.length > 0) {
        return (
            <>
                <div className="space-y-4">
                    <div className={`grid gap-2 ${imagesToDisplay.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                        {imagesToDisplay.map((image, index) => (
                            <EventImageItem
                                key={`${image.url}-${index}`}
                                url={image.url}
                                title={title}
                                index={index}
                                onClick={() => setSelectedImageIndex(index)}
                            />
                        ))}
                    </div>

                    {hasNextPage && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isFetchingNextPage ? 'Loading more...' : 'Load more images'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Carousel Lightbox */}
                <AlertDialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
                    <AlertDialogPopup className="max-w-[95vw] md:max-w-7xl lg:max-w-[90vw] w-full p-0 bg-black/95 border-none">
                        <div className="relative">
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Carousel */}
                            <div className="overflow-hidden" ref={emblaRef}>
                                <div className="flex">
                                    {imagesToDisplay.map((image, index) => (
                                        <div key={index} className="flex-[0_0_100%] min-w-0">
                                            <motion.div
                                                className="flex flex-col"
                                                initial={false}
                                                animate={{
                                                    scale: index === currentIndex ? 1 : 0.95,
                                                }}
                                                transition={transition}
                                            >
                                                <div className="relative overflow-hidden flex items-center justify-center h-[70vh] md:h-[60vh] lg:h-[75vh]">
                                                    {/* Blurred background */}
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center"
                                                        style={{
                                                            backgroundImage: `url(${image.url})`,
                                                            filter: 'blur(40px)',
                                                            transform: 'scale(1.1)'
                                                        }}
                                                    />
                                                    {/* Dark overlay */}
                                                    <div className="absolute inset-0 bg-black/40" />
                                                    {/* Main image */}
                                                    <img
                                                        src={image.url}
                                                        alt={`${title} - ${index + 1}`}
                                                        className="relative w-full h-full object-contain z-10"
                                                    />
                                                </div>

                                                {/* Attribution footer */}
                                                {image.source === 'post' && image.authorName && (
                                                    <div className="bg-black/90 text-white p-4 flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            Posted by{' '}
                                                            {image.postId ? (
                                                                <Link
                                                                    to="/events/$eventId"
                                                                    params={{ eventId: String(eventId) }}
                                                                    // Wait, link to event page? Or post?
                                                                    // The original code linked to /events/$eventId with params eventId: image.postId ??
                                                                    // That looks like a bug or misuse in original code.
                                                                    // Assuming intent was linking to user or post.
                                                                    // I'll keep it as is or fix if obvious.
                                                                    // Previous code: params={{ eventId: String(image.postId) }}
                                                                    // That implies routing to event details using post ID? That's weird.
                                                                    // I'll just keep it consistent with previous code but use eventId for the base if needed.
                                                                    // Actually, let's just use eventId from props if we want to stay in event.
                                                                    // But likely it wanted to link to the post context.
                                                                    // I'll use image.postId as eventId parameter like before?
                                                                    // No, that's definitely weird.
                                                                    // I'll just disable the link or make it simple text for now to avoid breaking routing.
                                                                    // Or just keep logic:
                                                                    className="font-semibold hover:underline"
                                                                >
                                                                    {image.authorName}
                                                                </Link>
                                                            ) : (
                                                                <span className="font-semibold">{image.authorName}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                                <Button
                                    size="icon"
                                    onClick={scrollPrev}
                                    disabled={!canScrollPrev}
                                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={scrollNext}
                                    disabled={!canScrollNext}
                                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Dot indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                                {imagesToDisplay.map((_, index) => (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        onClick={() => emblaApi?.scrollTo(index)}
                                        initial={false}
                                        className="pointer-events-auto cursor-pointer rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                                        animate={{
                                            width: index === currentIndex ? 24 : 8,
                                            height: 8,
                                            backgroundColor: index === currentIndex ? 'rgb(255 255 255 / 0.9)' : 'rgb(255 255 255 / 0.5)',
                                        }}
                                        transition={transition}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </AlertDialogPopup>
                </AlertDialog>
            </>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No images available</p>
            </div>
        </div>
    );
}
