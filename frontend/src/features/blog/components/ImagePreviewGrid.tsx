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
                <div key={`${image.file.name}-${index}`} className="relative group">
                    <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                        onClick={() => onRemove(index)}
                        type="button"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ))}
        </div>
    );
};

