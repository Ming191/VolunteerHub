import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface ImagePreview {
    file: File;
    url: string;
}

const MAX_IMAGES = 5;

export const useImageUpload = () => {
    const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imagesRef = useRef<ImagePreview[]>(selectedImages);

    // Keep ref in sync with state for cleanup
    useEffect(() => {
        imagesRef.current = selectedImages;
    }, [selectedImages]);

    useEffect(() => {
        return () => {
            // Use ref to access latest images on unmount without capturing outdated state
            imagesRef.current.forEach(img => URL.revokeObjectURL(img.url));
        };
    }, []);
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_IMAGES - selectedImages.length;
        const countToAdd = Math.min(files.length, remainingSlots);

        if (files.length > remainingSlots) {
            toast.warning(`Maximum ${MAX_IMAGES} images allowed. Only added ${countToAdd} images.`);
        }

        const newImages: ImagePreview[] = [];
        for (let i = 0; i < countToAdd; i++) {
            const file = files[i];
            newImages.push({
                file,
                url: URL.createObjectURL(file)
            });
        }

        setSelectedImages(prev => [...prev, ...newImages]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedImages.length]);

    const removeImage = useCallback((indexToRemove: number) => {
        setSelectedImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[indexToRemove].url);
            newImages.splice(indexToRemove, 1);
            return newImages;
        });
    }, []);

    const removeAllImages = useCallback(() => {
        selectedImages.forEach(img => URL.revokeObjectURL(img.url));
        setSelectedImages([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [selectedImages]);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return {
        selectedImages,
        fileInputRef,
        handleFileSelect,
        removeImage,
        removeAllImages,
        openFileDialog,
        canAddMore: selectedImages.length < MAX_IMAGES,
        maxImages: MAX_IMAGES,
    };
};

