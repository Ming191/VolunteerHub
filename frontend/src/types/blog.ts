export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    role: 'ADMIN' | 'EVENT_ORGANIZER' | 'VOLUNTEER';
}

export interface Comment {
    id: string;
    author: User;
    content: string;
    createdAt: string;
}

export interface Post {
    id: string;
    type: 'USER_POST' | 'EVENT_UPDATE' | 'EVENT_SHARE';
    author: User;
    content: string;
    imageUrl?: string;
    likes: number;
    comments: Comment[];
    createdAt: string;
    isLiked?: boolean; // For UI state
    eventTitle?: string; // For Event related posts
    eventId?: string;
}
