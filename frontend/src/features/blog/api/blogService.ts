import axiosInstance from '@/utils/axiosInstance';
import {type CommentRequest, CommentsApi, Configuration, LikesApi, type PostResponse, PostsApi} from "@/api-client";

const config = new Configuration({ basePath: '' });
const postsApi = new PostsApi(config, undefined, axiosInstance);
const likeApi = new LikesApi(config, undefined, axiosInstance);
const commentApi = new CommentsApi(config, undefined, axiosInstance);

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
        const formData = new FormData();
        const postRequestPayload = {
          content,
        }
        const requestBlob = new Blob([JSON.stringify(postRequestPayload)], {
          type: 'application/json'
        });
        formData.append('request', requestBlob);
        if (files && files.length > 0) {
          files.forEach(file => {
            // Key 'files' phải khớp với @RequestPart("files")
            formData.append('files', file);
          });
        }

        const url = `api/posts/event/${eventId}`;

        const response = await axiosInstance.post<PostResponse>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
    },

    // Like/Unlike
    toggleLike: async (postId: number) => {
        const response = await likeApi.toggleLike({postId});
        return response.data;
    },

    // Get Comments
    getComments: async (postId: number) => {
        const response = await commentApi.getCommentsForPost({postId});
        return response.data;
    },

    // Add Comment
    addComment: async (postId: number, content: string, parentCommentId?: number) => {
        const requestBody: CommentRequest = {
          content: content,
          parentCommentId: parentCommentId,
        }

        const response = await commentApi.createComment({
          postId: postId,
          commentRequest: requestBody,
        })
        return response.data;
    },

    // Delete Post
    deletePost: async (postId: number) => {
        await postsApi.deletePost({postId});
    }
};
