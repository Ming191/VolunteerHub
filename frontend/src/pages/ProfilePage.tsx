import { useEffect, useState } from 'react';
import { Calendar, MapPin, Edit, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfileApi, PostsApi, Configuration, type UserResponse, type PostResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import Loading from '@/components/common/Loading';
import EditProfileModal from '@/components/common/EditProfileModal';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);
const postsApi = new PostsApi(config, undefined, axiosInstance);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProfileData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const [profileRes, postsRes] = await Promise.all([
                userProfileApi.getMyProfile(),
                postsApi.getMyPosts(),
            ]);
            setProfile(profileRes.data);
            setPosts(postsRes.data.content);
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleModalClose = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
            // Refetch profile data in background when modal closes
            fetchProfileData(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!profile) {
        return null;
    }

    const initials = profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
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
                        <Button onClick={() => setIsEditModalOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
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
                            {posts.map((post) => {
                                const hasImages = post.imageUrls && post.imageUrls.length > 0;

                                return (
                                    <div
                                        key={post.id}
                                        className="rounded-lg border p-6 hover:bg-muted/50 transition-colors"
                                    >
                                        {/* Post Content */}
                                        <p className="text-base mb-4 whitespace-pre-wrap">{post.content}</p>

                                        {/* Post Images */}
                                        {hasImages && (
                                            <div className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' :
                                                    post.imageUrls.length === 2 ? 'grid-cols-2' :
                                                        'grid-cols-2 md:grid-cols-3'
                                                }`}>
                                                {post.imageUrls.map((url, index) => (
                                                    <img
                                                        key={index}
                                                        src={url}
                                                        alt={`Post image ${index + 1}`}
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Post Footer */}
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Heart className={`h-4 w-4 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`} />
                                                <span>{post.totalLikes} {post.totalLikes === 1 ? 'like' : 'likes'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{post.totalComments} {post.totalComments === 1 ? 'comment' : 'comments'}</span>
                                            </div>
                                            <div className="ml-auto">
                                                {formatRelativeTime(post.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
        </div>
    );
}
