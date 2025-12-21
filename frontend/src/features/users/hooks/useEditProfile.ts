import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    UserProfileApi,
    Configuration,
    type UserResponse,
    type UpdateProfileRequest,
    UpdateProfileRequestSkillsEnum,
    UpdateProfileRequestInterestsEnum,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import getCroppedImg from '@/utils/imageUtils';
import { profileSchema, type ProfileFormData } from '../schemas/profileSchema';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

interface UseEditProfileProps {
    currentProfile: UserResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const useEditProfile = ({ currentProfile, open, onOpenChange }: UseEditProfileProps) => {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image Upload & Cropping State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfile.profilePictureUrl || null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentProfile.name || '',
            phoneNumber: currentProfile.phoneNumber || '',
            bio: currentProfile.bio || '',
            location: currentProfile.location || '',
            dateOfBirth: currentProfile.dateOfBirth || '',
            skills: Array.from(currentProfile.skills || []),
            interests: Array.from(currentProfile.interests || []),
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: currentProfile.name || '',
                phoneNumber: currentProfile.phoneNumber || '',
                bio: currentProfile.bio || '',
                location: currentProfile.location || '',
                dateOfBirth: currentProfile.dateOfBirth || '',
                skills: Array.from(currentProfile.skills || []),
                interests: Array.from(currentProfile.interests || []),
            });
            setPreviewUrl(currentProfile.profilePictureUrl || null);
            setSelectedImage(null);
            setIsCropping(false);
            setCropImageSrc(null);
        }
    }, [open, currentProfile, form]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            const url = URL.createObjectURL(file);
            setCropImageSrc(url);
            setIsCropping(true);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;

        try {
            const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);
            if (!croppedFile) {
                toast.error('Failed to crop image');
                return;
            }
            setSelectedImage(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile));
            setIsCropping(false);
            setCropImageSrc(null);
        } catch (e) {
            console.error(e);
            toast.error('Failed to crop image');
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setCropImageSrc(null);
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            // 1. Upload profile picture if selected
            if (selectedImage) {
                await userProfileApi.uploadProfilePicture({ file: selectedImage });
            }

            // 2. Update profile data
            const updateData: UpdateProfileRequest = {
                name: data.name || undefined,
                phoneNumber: data.phoneNumber || undefined,
                bio: data.bio || undefined,
                location: data.location || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
                skills: data.skills && data.skills.length > 0
                    ? (data.skills as unknown as UpdateProfileRequestSkillsEnum[])
                    : undefined,
                interests: data.interests && data.interests.length > 0
                    ? (data.interests as unknown as UpdateProfileRequestInterestsEnum[])
                    : undefined,
            };

            await userProfileApi.updateMyProfile({ updateProfileRequest: updateData });

            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profile updated successfully');
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        isSubmitting,
        selectedImage,
        previewUrl,
        isCropping,
        cropImageSrc,
        crop,
        setCrop,
        zoom,
        setZoom,
        fileInputRef,
        handleImageSelect,
        onCropComplete,
        handleCropConfirm,
        handleCropCancel,
        onSubmit,
    };
};
