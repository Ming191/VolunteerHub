import axiosInstance from '@/utils/axiosInstance';
import {
  type CommentRequest,
  CommentsApi,
  Configuration,
  LikesApi,
  type PagePostResponse,
  type PostResponse,
  PostsApi
} from '@/api-client';

const config = new Configuration({ basePath: '' });
const postsApi = new PostsApi(config, undefined, axiosInstance);
const likeApi = new LikesApi(config, undefined, axiosInstance);
const commentApi = new CommentsApi(config, undefined, axiosInstance);

export const blogService = {
  getPostsForEvent: async (eventId: number, page = 0, size = 20): Promise<PagePostResponse> => {
    const response = await axiosInstance.get<PagePostResponse>(
      `api/events/${eventId}/posts`,
      { params: { page, size } }
    );
    return response.data;
  },

  getRecentPostsFeed: async (days = 7, page = 0, size = 20): Promise<PagePostResponse> => {
    const response = await postsApi.getRecentPostsFeed({ days, page, size });
    return response.data;
  },

  getPost: async (eventId: number, postId: number) => {
    const response = await axiosInstance.get<PostResponse>(
      `api/events/${eventId}/posts/${postId}`
    );
    return response.data;
  },

  createPost: async (eventId: number, content: string, files?: File[]) => {
    const formData = new FormData();
    const postRequestPayload = { content };
    const requestBlob = new Blob([JSON.stringify(postRequestPayload)], {
      type: 'application/json'
    });
    formData.append('request', requestBlob);

    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }

    const response = await axiosInstance.post<PostResponse>(
      `api/events/${eventId}/posts`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  toggleLike: async (postId: number) => {
    const response = await likeApi.toggleLike({ postId });
    return response.data;
  },

  getComments: async (postId: number) => {
    const response = await commentApi.getNestedCommentsForPost({ postId });
    return response.data;
  },

  addComment: async (postId: number, content: string, parentCommentId?: number) => {
    const requestBody: CommentRequest = {
      content,
      parentCommentId,
    };

    const response = await commentApi.createComment({
      postId,
      commentRequest: requestBody,
    });
    return response.data;
  },

  deletePost: async (eventId: number, postId: number) => {
    await axiosInstance.delete(`api/events/${eventId}/posts/${postId}`);
  },

  updatePost: async (eventId: number, postId: number, content: string) => {
    const response = await axiosInstance.put(
      `api/events/${eventId}/posts/${postId}`,
      { content }
    );
    return response.data;
  },

  updateComment: async (postId: number, commentId: number, content: string) => {
    const response = await axiosInstance.put(
      `api/posts/${postId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  },

  deleteComment: async (postId: number, commentId: number) => {
    await axiosInstance.delete(`api/posts/${postId}/comments/${commentId}`);
  },
};
