import { useState, useEffect, useCallback } from 'react';
import { UserProfileApi, PostsApi, UserApi, Configuration, type UserResponse, type PostResponse, type PublicUserResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);
const postsApi = new PostsApi(config, undefined, axiosInstance);
const userApi = new UserApi(config, undefined, axiosInstance);

export const useProfileData = (userId?: number) => {
    const [profile, setProfile] = useState<UserResponse | PublicUserResponse | null>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            if (userId) {
                // Fetch another user's public profile and their posts
                const [profileRes, postsRes] = await Promise.all([
                    userApi.getUserById({ id: userId }),
                    postsApi.getPostsByUserId({ userId }),
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data.content);
            } else {
                // Fetch current user's full profile and posts
                const [profileRes, postsRes] = await Promise.all([
                    userProfileApi.getMyProfile(),
                    postsApi.getMyPosts(),
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    return {
        profile,
        posts,
        loading,
        refetch: fetchProfileData,
    };
};
