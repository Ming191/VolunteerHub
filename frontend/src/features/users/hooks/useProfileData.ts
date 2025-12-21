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
    const [hasMorePosts, setHasMorePosts] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchProfileData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
                setProfile(null); // Clear profile while loading
            }

            if (userId) {
                // Fetch another user's public profile first
                const profileRes = await userApi.getUserById({ id: userId });
                setProfile(profileRes.data);
                
                // Only fetch posts if profile is not private
                if (!profileRes.data.isPrivate) {
                    const postsRes = await postsApi.getPostsByUserId({ 
                        userId,
                        page: 0,
                        size: 10,
                        sort: 'createdAt',
                        direction: 'desc'
                    });
                    setPosts(postsRes.data.content);
                    setHasMorePosts(!postsRes.data.last);
                    setCurrentPage(0);
                } else {
                    setPosts([]);
                    setHasMorePosts(false);
                }
            } else {
                // Fetch current user's full profile and posts
                const [profileRes, postsRes] = await Promise.all([
                    userProfileApi.getMyProfile(),
                    postsApi.getMyPosts({ page: 0, size: 10, sort: 'createdAt', direction: 'desc' }),
                ]);
                setProfile(profileRes.data);
                setPosts(postsRes.data.content);
                setHasMorePosts(!postsRes.data.last);
                setCurrentPage(0);
            }
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [userId]);

    const loadMorePosts = useCallback(async () => {
        try {
            const nextPage = currentPage + 1;
            if (userId) {
                const postsRes = await postsApi.getPostsByUserId({ 
                    userId,
                    page: nextPage,
                    size: 10,
                    sort: 'createdAt',
                    direction: 'desc'
                });
                setPosts(prev => [...prev, ...postsRes.data.content]);
                setHasMorePosts(!postsRes.data.last);
                setCurrentPage(nextPage);
            } else {
                const postsRes = await postsApi.getMyPosts({ 
                    page: nextPage, 
                    size: 10, 
                    sort: 'createdAt', 
                    direction: 'desc' 
                });
                setPosts(prev => [...prev, ...postsRes.data.content]);
                setHasMorePosts(!postsRes.data.last);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Failed to load more posts:', error);
        }
    }, [userId, currentPage]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    return {
        profile,
        posts,
        loading,
        hasMorePosts,
        loadMorePosts,
        refetch: fetchProfileData,
    };
};
