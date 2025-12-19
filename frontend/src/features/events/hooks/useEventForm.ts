import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useGetEventTags } from '../hooks/useEventTags';
import { eventFormSchema, type EventFormValues, MAX_IMAGES, MAX_IMAGE_SIZE } from '../schemas/eventFormSchema';

interface UseEventFormProps {
    defaultValues?: Partial<EventFormValues>;
    initialImages?: string[];
    onSubmit: (values: EventFormValues, files: File[], remainingImages: string[]) => Promise<void>;
    isSubmitting?: boolean;
}

export const useEventForm = ({
    defaultValues,
    initialImages,
    onSubmit,
    isSubmitting: externalIsSubmitting
}: UseEventFormProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialImages || []);
    const { data: eventTags, isLoading: tagsLoading } = useGetEventTags();

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            waitlistEnabled: false,
            tags: [],
            ...defaultValues,
        },
    });

    const { isSubmitting: formIsSubmitting } = form.formState;
    const isSubmitting = externalIsSubmitting || formIsSubmitting;

    // Reset form when defaultValues change
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                title: '',
                description: '',
                location: '',
                waitlistEnabled: false,
                tags: [],
                ...defaultValues
            });
        }
        if (initialImages) {
            setExistingImages(initialImages);
        }
    }, [defaultValues, initialImages,]);

    const validateFile = (file: File): boolean => {
        if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image file`);
            return false;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            toast.error(`${file.name} exceeds 5MB limit`);
            return false;
        }
        return true;
    };

    const handleFileChange = (updatedFiles: File[]): void => {
        const allowedSlots = MAX_IMAGES - existingImages.length;

        if (updatedFiles.length > files.length) {
            const newFilesStartIndex = files.length;
            const addedFiles = updatedFiles.slice(newFilesStartIndex);

            const validAddedFiles = addedFiles.filter(validateFile);

            if (validAddedFiles.length !== addedFiles.length) {
                const validFiles = [...files, ...validAddedFiles];
                if (validFiles.length > allowedSlots) {
                    toast.error(`Maximum ${MAX_IMAGES} images allowed`, {
                        description: `Only ${allowedSlots} more image(s) could be added. Extra files were discarded.`
                    });
                }
                const finalFiles = validFiles.slice(0, allowedSlots);
                setFiles(finalFiles);
                return;
            }
        }

        if (updatedFiles.length > allowedSlots) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`, {
                description: `Only ${allowedSlots} more image(s) could be added. Extra files were discarded.`
            });
        }
        const finalFiles = updatedFiles.slice(0, allowedSlots);
        setFiles(finalFiles);
    };

    const validateUserPermissions = (): { isValid: boolean; userRole?: string } => {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (!storedUser || !accessToken) {
            return { isValid: false };
        }

        try {
            const user = JSON.parse(storedUser);
            const isValid = user.role === 'EVENT_ORGANIZER' || user.role === 'ADMIN';
            return { isValid, userRole: user.role };
        } catch {
            return { isValid: false };
        }
    };

    const handleSubmit = async (values: EventFormValues) => {
        const { isValid, userRole } = validateUserPermissions();

        if (!isValid) {
            toast.error('Authentication required', {
                description: 'Please log in to manage events.',
            });
            return;
        }


        await onSubmit(values, files, existingImages);
    };

    return {
        form,
        files,
        setFiles,
        existingImages,
        setExistingImages,
        eventTags,
        tagsLoading,
        isSubmitting,
        handleFileChange,
        handleSubmit,
        MAX_IMAGES // Exporting this so the component can use it for UI
    };
};
