import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils.ts';
import { AlertDialog, AlertDialogPopup } from '@/components/animate-ui/components/base/alert-dialog';
import { motion, type Transition } from 'motion/react';
import { type EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const transition: Transition = {
    type: 'spring',
    stiffness: 240,
    damping: 24,
    mass: 1,
};

interface PostImagesProps {
    images: string[];
}

export const PostImages: React.FC<PostImagesProps> = ({ images }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: 0, loop: true });
    const [currentIndex, setCurrentIndex] = useState(0);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setCurrentIndex(api.selectedScrollSnap());
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
            emblaApi.scrollTo(selectedImageIndex);
        }
    }, [emblaApi, selectedImageIndex]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (!images || images.length === 0) return null;

    const gridClass = cn(
        "grid gap-1 rounded-md overflow-hidden mb-3",
        images.length === 1 ? "grid-cols-1" :
        images.length === 2 ? "grid-cols-2" :
        images.length === 3 ? "grid-cols-2" :
        "grid-cols-2"
    );

    return (
        <>
            {/* Grid Display */}
            <div className={gridClass}>
                {images.slice(0, 4).map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative cursor-pointer hover:opacity-90 transition-opacity",
                            images.length === 3 && index === 0 ? "col-span-2" : ""
                        )}
                        onClick={() => setSelectedImageIndex(index)}
                    >
                        <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-48 object-cover"
                        />
                        {/* Show overlay on last visible image if there are more */}
                        {index === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-3xl font-bold">
                                    +{images.length - 4}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Carousel Modal */}
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
                                {images.map((image, index) => (
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
                                                        backgroundImage: `url(${image})`,
                                                        filter: 'blur(40px)',
                                                        transform: 'scale(1.1)'
                                                    }}
                                                />
                                                {/* Dark overlay */}
                                                <div className="absolute inset-0 bg-black/40" />
                                                {/* Main image */}
                                                <img
                                                    src={image}
                                                    alt={`Post image ${index + 1}`}
                                                    className="relative w-full h-full object-contain z-10"
                                                />
                                            </div>
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
                                className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                onClick={scrollNext}
                                className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                            {images.map((_, index) => (
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
};
