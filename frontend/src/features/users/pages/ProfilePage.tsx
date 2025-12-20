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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useParams } from '@tanstack/react-router';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ProfilePage = () => {
    const params = useParams({ from: '/_auth/profile/$userId', shouldThrow: false, });
    const userId = params?.userId ? Number(params.userId) : undefined;
    const { profile, posts, loading, refetch } = useProfileData(userId);
    const { user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const isOwnProfile = !userId || (user && profile && user.userId === profile.id);

    const handleModalClose = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
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
                <div className="container mx-auto p-6 space-y-8 max-w-5xl">
                    {/* Hero Section */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Avatar */}
                                <div className="shrink-0">
                                    <Avatar className="h-32 w-32 border-4 border-muted/30 shadow-lg">
                                        <AvatarImage src={profile.profilePictureUrl} alt={profile.name} />
                                        <AvatarFallback className="text-3xl bg-primary/10">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-3xl font-bold tracking-tight">
                                                    {profile.name}
                                                </h1>
                                                {'role' in profile && (
                                                    <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                                                        {profile.role.replace(/_/g, ' ')}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <p className="text-muted-foreground text-base mb-3 max-w-2xl leading-relaxed">
                                                {profile.bio || 'No bio added yet'}
                                            </p>

                                            {'createdAt' in profile && (
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Joined {formatDate(profile.createdAt)}</span>
                                                    </div>
                                                    {profile.location && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{profile.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons - Desktop */}
                                        {isOwnProfile && (
                                            <div className="hidden md:flex gap-2 shrink-0">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => setIsEditModalOpen(true)}
                                                    className="hover:bg-muted"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Profile
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => setIsChangePasswordModalOpen(true)}
                                                    className="hover:bg-muted"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Change Password
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {'skills' in profile && profile.skills && profile.skills.size > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {Array.from(profile.skills).map((skill) => (
                                                <Badge 
                                                    key={skill} 
                                                    variant="outline" 
                                                    className="bg-muted/50 hover:bg-muted border-border/50"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons - Mobile */}
                                    {isOwnProfile && (
                                        <div className="flex md:hidden gap-2 mt-6">
                                            <Button 
                                                variant="outline"
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="flex-1"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Profile
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => setIsChangePasswordModalOpen(true)}
                                                className="flex-1"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Change Password
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Posts Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {isOwnProfile ? 'My Posts' : 'Posts'}
                            </h2>
                            {posts.length > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    ({posts.length})
                                </span>
                            )}
                        </div>
                        
                        {posts.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="text-center py-16">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                                        <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground font-medium mb-1">No posts yet</p>
                                    <p className="text-sm text-muted-foreground/60">
                                        {isOwnProfile ? "Share your thoughts with your first post" : "This user hasn't posted anything yet"}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    {isOwnProfile && profile && (
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