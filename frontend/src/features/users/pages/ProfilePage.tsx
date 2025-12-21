import { useState } from "react";
import { Calendar, MapPin, Edit, MessageCircle, Key, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonTransition } from "@/components/common/SkeletonTransition";
import { ProfilePageSkeleton } from "@/features/users/components/ProfilePageSkeleton";
import { EditProfileModal } from "@/features/users/components/EditProfileModal";
import { ChangePasswordModal } from "@/features/users/components/ChangePasswordModal";
import { useProfileData } from "../hooks/useProfileData";
import { PostCard } from "@/features/blog/components/PostCard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useParams } from "@tanstack/react-router";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ProfilePage = () => {
  const params = useParams({
    from: "/_auth/profile/$userId",
    shouldThrow: false,
  });
  const userId = params?.userId ? Number(params.userId) : undefined;
  const { profile, posts, loading, refetch } = useProfileData(userId);
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  // Check if viewing own profile
  const isOwnProfile =
    !userId || (user && profile && user.userId === profile.id);

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

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <SkeletonTransition
      isLoading={loading || !profile}
      skeleton={<ProfilePageSkeleton />}
    >
      {profile && (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl">
          {/* Hero Section */}
          <Card className="border-2 border-gray-200 shadow-md">
            <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-lg" />
            <CardContent className="p-8 -mt-16">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage
                    src={profile.profilePictureUrl}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.name}
                    </h1>
                    {"role" in profile && (
                      <Badge
                        variant="secondary"
                        className="w-fit mx-auto md:mx-0 bg-green-100 text-green-700 border-green-200"
                      >
                        {profile.role.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {profile.bio || "No bio added yet"}
                  </p>
                  {"createdAt" in profile && (
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 justify-center md:justify-start">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span>Joined {formatDate(profile.createdAt)}</span>
                      </div>
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {"skills" in profile &&
                    profile.skills &&
                    profile.skills.size > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        {Array.from(profile.skills).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
                {isOwnProfile && (
                  <div className="flex md:flex-col gap-2">
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-between w-full"
                    >
                      <span className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </span>
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="border-green-200 hover:bg-green-50 flex items-center justify-between w-full"
                    >
                      <span className="flex items-center">
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <Card className="border-2 border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
              <CardTitle className="text-xl font-bold text-gray-900">
                {isOwnProfile ? "My Posts" : "Posts"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!isOwnProfile && "isPrivate" in profile && profile.isPrivate ? (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-semibold text-lg mb-2">Private Profile</p>
                  <p className="text-muted-foreground">
                    This user's posts are private
                  </p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Profile Modal */}
          {isOwnProfile && profile && "email" in profile && (
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
};
