import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface PostImagesProps {
    images: string[];
}

export const PostImages: React.FC<PostImagesProps> = ({ images }) => {
    const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const openImagePreview = (index: number) => {
        setPreviewImageIndex(index);
    };

    const nextImage = () => {
        if (previewImageIndex !== null && previewImageIndex < images.length - 1) {
            setPreviewImageIndex(previewImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (previewImageIndex !== null && previewImageIndex > 0) {
            setPreviewImageIndex(previewImageIndex - 1);
        }
    };

    return (
        <>
            {/* --- GRID DISPLAY --- */}
            <div className={cn(
                "grid gap-1 rounded-md overflow-hidden mb-3",
                images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
                {/* First Image */}
                <div
                    className="relative cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => openImagePreview(0)}
                >
                    <img
                        src={images[0]}
                        alt="View 1"
                        className="w-full h-64 object-cover"
                    />
                </div>

                {/* Second Image or Overlay */}
                {images.length > 1 && (
                    <div
                        className="relative cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => openImagePreview(1)}
                    >
                        <img
                            src={images[1]}
                            alt="View 2"
                            className="w-full h-64 object-cover"
                        />
                        {/* Overlay if more than 2 images */}
                        {images.length > 2 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                    +{images.length - 2}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- FULL SCREEN PREVIEW DIALOG --- */}
            <Dialog
                open={previewImageIndex !== null}
                onOpenChange={(open) => !open && setPreviewImageIndex(null)}
            >
                <DialogContent
                    showCloseButton={false}
                    className="w-[95vw] h-[80vh] sm:w-[80vw] sm:h-[80vh] max-w-none sm:max-w-none m-0 p-0 rounded-lg bg-black/95 border-none text-white overflow-hidden flex flex-col items-center justify-center shadow-none data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200"
                >
                    {/* Close Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <Button
                            variant="ghost" size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={() => setPreviewImageIndex(null)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {previewImageIndex !== null && images.length > 0 && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Prev Button */}
                            {previewImageIndex > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                            )}

                            {/* Main Image */}
                            <img
                                src={images[previewImageIndex]}
                                alt={`Preview ${previewImageIndex}`}
                                className="max-h-full max-w-full object-contain"
                            />

                            {/* Next Button */}
                            {previewImageIndex < images.length - 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            )}

                            {/* Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm">
                                {previewImageIndex + 1} / {images.length}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
