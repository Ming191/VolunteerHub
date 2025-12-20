import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogPopup,
} from '@/components/animate-ui/components/base/alert-dialog';
import { motion, type Transition } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const transition: Transition = {
    type: 'spring',
    stiffness: 240,
    damping: 24,
};

interface PostImagesProps {
    images: string[];
}

export const PostImages: React.FC<PostImagesProps> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
    });

    /* ---------------- Embla sync ---------------- */
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (!emblaApi || selectedIndex === null) return;
        emblaApi.scrollTo(selectedIndex, true);
        emblaApi.reInit();
    }, [emblaApi, selectedIndex]);

    if (!images?.length) return null;

    /* ---------------- Render ---------------- */
    return (
        <>
            {/* ================= GRID ================= */}
            <div
                className={cn(
                    'grid gap-1 rounded-md overflow-hidden mb-3',
                    images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                )}
            >
                {images.slice(0, 4).map((image, index) => {
                    const isLarge = images.length === 3 && index === 0;

                    return (
                        <motion.div
                            key={image}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'relative overflow-hidden rounded-lg cursor-pointer',
                                isLarge && 'col-span-2'
                            )}
                            whileHover={{ scale: 1.02 }}
                            transition={transition}
                        >
                            {/* Background Logic:
                                - Single Image: Permanent blurred background
                                - Multiple Images: Hover-only blurred background
                            */}
                            {images.length === 1 ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center scale-110 opacity-60 blur-[100px]"
                                    style={{ backgroundImage: `url(${image})` }}
                                />
                            ) : (
                                <motion.div
                                    className="absolute inset-0 bg-cover bg-center scale-110"
                                    style={{ backgroundImage: `url(${image})` }}
                                    initial={{ opacity: 0, filter: 'blur(0px)' }}
                                    whileHover={{
                                        opacity: 0.6,
                                        filter: 'blur(16px)',
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}

                            {/* Main image */}
                            <motion.img
                                src={image}
                                alt=""
                                className={cn(
                                    'relative z-10 w-full rounded-lg',
                                    images.length === 1
                                        ? 'h-[500px] object-contain' // Removed bg-black/5 as we have the blur
                                        : 'aspect-[4/3] object-cover'
                                )}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            />

                            {/* +N overlay */}
                            {index === 3 && images.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                    <span className="text-white text-3xl font-bold">
                                        +{images.length - 4}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* ================= MODAL ================= */}
            <AlertDialog
                open={selectedIndex !== null}
                onOpenChange={(open) => !open && setSelectedIndex(null)}
            >
                <AlertDialogPopup
                    className="
                        w-full max-w-[95vw] md:max-w-7xl
                        bg-black/70 backdrop-blur-xl
                        border-none p-0
                    "
                >
                    <div className="relative">
                        {/* Close */}
                        <button
                            onClick={() => setSelectedIndex(null)}
                            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Carousel */}
                        <div ref={emblaRef} className="overflow-hidden">
                            <div className="flex">
                                {images.map((image, index) => (
                                    <div
                                        key={image}
                                        className="flex-[0_0_100%] min-w-0"
                                    >
                                        <motion.div
                                            className="relative h-[70vh] md:h-[60vh] lg:h-[75vh] flex items-center justify-center overflow-hidden"
                                            animate={{
                                                scale:
                                                    index === currentIndex
                                                        ? 1
                                                        : 0.95,
                                            }}
                                            transition={transition}
                                        >
                                            {/* Blur background */}
                                            <motion.div
                                                className="absolute inset-0 bg-cover bg-center scale-110"
                                                style={{
                                                    backgroundImage: `url(${image})`,
                                                }}
                                                initial={{
                                                    opacity: 0,
                                                    filter: 'blur(0px)',
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    filter: 'blur(40px)',
                                                }}
                                                transition={{ duration: 0.4 }}
                                            />

                                            {/* Dark overlay */}
                                            <div className="absolute inset-0 bg-black/40" />

                                            {/* Main image */}
                                            <motion.img
                                                src={image}
                                                alt=""
                                                className="relative z-10 w-full h-full object-contain"
                                                initial={{ scale: 0.96 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    duration: 0.35,
                                                }}
                                            />
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                            <Button
                                size="icon"
                                onClick={() => emblaApi?.scrollPrev()}
                                className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 text-white"
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                size="icon"
                                onClick={() => emblaApi?.scrollNext()}
                                className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 text-white"
                            >
                                <ChevronRight />
                            </Button>
                        </div>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() =>
                                        emblaApi?.scrollTo(index)
                                    }
                                    className="h-2 rounded-full bg-white/50"
                                    animate={{
                                        width:
                                            index === currentIndex ? 24 : 8,
                                        backgroundColor:
                                            index === currentIndex
                                                ? 'rgb(255 255 255 / 0.9)'
                                                : 'rgb(255 255 255 / 0.5)',
                                    }}
                                    transition={transition}
                                />
                            ))}
                        </div>
                    </div>
                </AlertDialogPopup>
            </AlertDialog>
        </>
    );
};
