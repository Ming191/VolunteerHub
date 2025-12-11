import axiosInstance from '@/utils/axiosInstance';
import {Configuration, PostsApi} from "@/api-client";

// Define Types based on Backend DTOs

const config = new Configuration({ basePath: '' });
const postsApi = new PostsApi(config, undefined, axiosInstance);

export interface AuthorResponse {
    id: number;
    name: string;
    profilePictureUrl?: string; // DTO doesn't show this, but AuthorResponse in backend might have it if I checked UserDTOs. Assuming name/id for now. DTO shows only id, name.
}

export interface CommentResponse {
    id: number;
    content: string;
    createdAt: string;
    author: AuthorResponse;
    parentCommentId?: number;
    replyCount: number;
    replies: CommentResponse[];
}

export interface PostResponse {
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
    author: AuthorResponse;
    totalLikes: number;
    totalComments: number;
    isLikedByCurrentUser: boolean;
    imageUrls: string[];
}

// Service Methods

export const blogService = {
    // Get Posts for Event
    getPostsForEvent: async (eventId: number) => {
        const response = await postsApi.getPostsForEvent({eventId})
        return response.data;
    },

    // Get Feed
    getRecentPostsFeed: async (days = 7, page = 0, size = 20) => {
        const response = await postsApi.getRecentPostsFeed({days, page, size});
        return response.data;
    },

    // Create Post for Event
    createPost: async (eventId: number, content: string, files?: File[]) => {
        const postRequestPayload = {
          content,
        }

        const response = await postsApi.createPostForEvent({
          eventId: eventId,
          request: postRequestPayload,
          files: files,
        })
        return response.data;
    },

    // Like/Unlike
    toggleLike: async (postId: number) => {
        const response = await axiosInstance.post<{ isLiked: boolean; totalLikes: number }>(`/api/posts/${postId}/like`);
        return response.data;
    },

    // Get Comments
    getComments: async (postId: number) => {
        const response = await axiosInstance.get<CommentResponse[]>(`/api/posts/${postId}/comments/nested`);
        return response.data;
    },

    // Add Comment
    addComment: async (postId: number, content: string, parentCommentId?: number) => {
        const response = await axiosInstance.post<CommentResponse>(`/api/posts/${postId}/comments`, {
            content,
            parentCommentId
        });
        return response.data;
    },

    // Delete Post
    deletePost: async (postId: number) => {
        await axiosInstance.delete(`/api/posts/${postId}`);
    }
};
