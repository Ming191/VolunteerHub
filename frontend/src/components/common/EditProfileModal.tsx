import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Camera, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/animate-ui/components/radix/dialog';
import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    UserProfileApi,
    Configuration,
    type UserResponse,
    type UpdateProfileRequest,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import getCroppedImg from '@/utils/imageUtils';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phoneNumber: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional().or(z.literal('')),
    location: z.string().max(100).optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentProfile: UserResponse;
}

const SKILLS = [
    'PUBLIC_SPEAKING', 'COMMUNICATION', 'ACTIVE_LISTENING', 'PRESENTATION', 'WRITING', 'TRANSLATION', 'SIGN_LANGUAGE',
    'LEADERSHIP', 'TEAM_MANAGEMENT', 'PROJECT_MANAGEMENT', 'EVENT_PLANNING', 'COORDINATION', 'PROBLEM_SOLVING',
    'TEACHING', 'TUTORING', 'MENTORING', 'COACHING', 'TRAINING', 'CHILD_CARE',
    'FIRST_AID', 'CPR', 'NURSING', 'COUNSELING', 'MENTAL_HEALTH_SUPPORT',
    'WEB_DEVELOPMENT', 'GRAPHIC_DESIGN', 'VIDEO_EDITING', 'PHOTOGRAPHY', 'SOCIAL_MEDIA_MANAGEMENT',
    'FUNDRAISING', 'GRANT_WRITING', 'ACCOUNTING', 'BUDGETING',
];

const INTERESTS = [
    'POVERTY_ALLEVIATION', 'HOMELESSNESS', 'HUNGER_RELIEF', 'AFFORDABLE_HOUSING', 'SOCIAL_JUSTICE',
    'EDUCATION', 'YOUTH_DEVELOPMENT', 'LITERACY', 'MENTORSHIP',
    'HEALTHCARE', 'MENTAL_HEALTH', 'DISABILITY_SUPPORT', 'ELDERLY_CARE',
    'ENVIRONMENTAL_CONSERVATION', 'CLIMATE_CHANGE', 'WILDLIFE_PROTECTION',
    'ANIMAL_WELFARE', 'ANIMAL_RESCUE',
    'ARTS_CULTURE', 'COMMUNITY_DEVELOPMENT', 'DISASTER_RELIEF',
];

const formatLabel = (value: string) => {
    return value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

export default function EditProfileModal({
    open,
    onOpenChange,
    currentProfile,
}: EditProfileModalProps) {
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
            if (croppedFile) {
                setSelectedImage(croppedFile);
                setPreviewUrl(URL.createObjectURL(croppedFile));
                setIsCropping(false);
                setCropImageSrc(null);
            }
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
                skills: data.skills && data.skills.length > 0 ? new Set(data.skills) as any : undefined,
                interests: data.interests && data.interests.length > 0 ? new Set(data.interests) as any : undefined,
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

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!isCropping) onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information. Click save when you are done.
                    </DialogDescription>
                </DialogHeader>

                {isCropping && cropImageSrc ? (
                    <div className="flex flex-col gap-4">
                        <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden">
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex items-center gap-4 px-4">
                            <span className="text-sm text-muted-foreground w-12">Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value: number[]) => setZoom(value[0])}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="outline" onClick={handleCropCancel}>
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button onClick={handleCropConfirm}>
                                <Check className="mr-2 h-4 w-4" /> Apply Crop
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Avatar className="h-24 w-24 border-2 border-muted">
                                        <AvatarImage src={previewUrl || undefined} />
                                        <AvatarFallback className="text-2xl">
                                            {currentProfile.name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Click to change photo (max 5MB)
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Your name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="+1234567890" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="City, Country" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Tell us about yourself..."
                                                rows={4}
                                                className="resize-none"
                                            />
                                        </FormControl>
                                        <FormDescription>Maximum 500 characters</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skills</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={field.value || []}
                                                    onValueChange={field.onChange}
                                                    className="flex-wrap justify-start gap-2"
                                                >
                                                    {SKILLS.map((skill) => (
                                                        <ToggleGroupItem
                                                            key={skill}
                                                            value={skill}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            {formatLabel(skill)}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Select skills that apply to you</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interests"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interests</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                <ToggleGroup
                                                    type="multiple"
                                                    value={field.value || []}
                                                    onValueChange={field.onChange}
                                                    className="flex-wrap justify-start gap-2"
                                                >
                                                    {INTERESTS.map((interest) => (
                                                        <ToggleGroupItem
                                                            key={interest}
                                                            value={interest}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                        >
                                                            {formatLabel(interest)}
                                                        </ToggleGroupItem>
                                                    ))}
                                                </ToggleGroup>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Select causes you care about</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2">
                                <RippleButton
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </RippleButton>
                                <RippleButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </RippleButton>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
