import { useState, useEffect, useCallback } from 'react';
import { UserProfileApi, PostsApi, Configuration, type UserResponse, type PostResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);
const postsApi = new PostsApi(config, undefined, axiosInstance);

export const useProfileData = () => {
    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = useCallback(async (showLoading = true) => {
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
    }, []);

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
