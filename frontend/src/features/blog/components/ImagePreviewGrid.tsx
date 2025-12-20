import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { X } from 'lucide-react';

interface ImagePreview {
    file: File;
    url: string;
}

interface ImagePreviewGridProps {
    images: ImagePreview[];
    onRemove: (index: number) => void;
}

export const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({ images, onRemove }) => {
    if (images.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 mb-2">
            {images.map((image, index) => (
                <div key={`${image.file.name}-${index}`} className="relative group overflow-hidden rounded-md aspect-square">
                    <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover border"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="!absolute !top-2 !right-2 h-7 w-7 rounded-full shadow-lg !z-10 opacity-90 hover:opacity-100"
                        onClick={() => onRemove(index)}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
};

