import { useState } from 'react';
import { Calendar, MapPin, Edit, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonTransition } from '@/components/common/SkeletonTransition';
import { ProfilePageSkeleton } from '@/features/users/components/ProfilePageSkeleton';
import { EditProfileModal } from '@/features/users/components/EditProfileModal';
import { ChangePasswordModal } from "@/features/users/components/ChangePasswordModal";
import { useProfileData } from '../hooks/useProfileData';
import { PostCard } from '@/features/blog/components/PostCard';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ProfilePage = () => {
    const { profile, posts, loading, refetch } = useProfileData();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleModalClose = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
            // Refetch profile data in background when modal closes
            refetch(false);
        }
    };

    const handleCloseChangePassword = (open: boolean) => {
        setIsChangePasswordModalOpen(open);
    };

    const initials = profile?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() ?? '';

    return (
        <SkeletonTransition
            isLoading={loading || !profile}
            skeleton={<ProfilePageSkeleton />}
        >
            {profile && (
                <div className="container mx-auto p-6 space-y-6">
                    {/* Hero Section */}
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={profile.profilePictureUrl} alt={profile.name} />
                                    <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                                        <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                                            {profile.role.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground mb-4">
                                        {profile.bio || 'No bio added yet'}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Joined {formatDate(profile.createdAt)}</span>
                                        </div>
                                        {profile.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                    {profile.skills && profile.skills.size > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                            {Array.from(profile.skills).map((skill) => (
                                                <Badge key={skill} variant="outline">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <Button onClick={() => setIsEditModalOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                    <Button variant={'secondary'} onClick={() => setIsChangePasswordModalOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Posts Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Posts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground">No posts yet</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {posts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Profile Modal */}
                    {profile && (
                        <EditProfileModal
                            open={isEditModalOpen}
                            onOpenChange={handleModalClose}
                            currentProfile={profile}
                        />
                    )}

                    {isChangePasswordModalOpen && (
                        <ChangePasswordModal
                            open={isChangePasswordModalOpen}
                            onOpenChange={handleCloseChangePassword}
                        />
                    )}
                </div>
            )}
        </SkeletonTransition>
    );
}
