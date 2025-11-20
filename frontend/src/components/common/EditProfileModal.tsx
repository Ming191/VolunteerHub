import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import {
    UserProfileApi,
    Configuration,
    type UserResponse,
    type UpdateProfileRequest,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

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
        }
    }, [open, currentProfile, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: UpdateProfileRequest) => {
            return await userProfileApi.updateMyProfile({ updateProfileRequest: data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profile updated successfully');
            onOpenChange(false);
        },
        onError: (error: any) => {
            console.error('Failed to update profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: ProfileFormData) => {
        setIsSubmitting(true);
        
        const updateData: any = {
            name: data.name || undefined,
            phoneNumber: data.phoneNumber || undefined,
            bio: data.bio || undefined,
            location: data.location || undefined,
            dateOfBirth: data.dateOfBirth || undefined,
            skills: data.skills && data.skills.length > 0 ? data.skills : undefined,
            interests: data.interests && data.interests.length > 0 ? data.interests : undefined,
        };

        updateProfileMutation.mutate(updateData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information. Click save when you are done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            </DialogContent>
        </Dialog>
    );
}
