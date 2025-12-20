import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface PostCardLoadingProps {
    content: string;
    imageUrls?: string[];
    hasImages: boolean;
}

export const PostCardLoading: React.FC<PostCardLoadingProps> = ({ content, imageUrls, hasImages }) => {
    const { user } = useAuth();

    return (
        <Card className="w-full mb-4 relative">
            {/* Loading Overlay */}
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">
                        {hasImages ? 'Processing images...' : 'Creating post...'}
                    </p>
                    {hasImages && (
                        <p className="text-xs text-muted-foreground text-center px-4">
                            This may take a few moments
                        </p>
                    )}
                </div>
            </div>

            {/* Post Preview (dimmed) */}
            <div className="opacity-50 pointer-events-none">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Avatar>
                        <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                    <p className="text-sm whitespace-pre-wrap break-words">{content}</p>

                    {hasImages && imageUrls && imageUrls.length > 0 && (
                        <div className="mt-3">
                            {imageUrls.length === 1 && (
                                <div className="w-full overflow-hidden rounded-lg border">
                                    <img
                                        src={imageUrls[0]}
                                        alt="Preview"
                                        className="w-full h-auto max-h-[500px] object-contain bg-muted"
                                    />
                                </div>
                            )}
                            {imageUrls.length === 2 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {imageUrls.map((url, idx) => (
                                        <div key={idx} className="overflow-hidden rounded-lg border aspect-square">
                                            <img
                                                src={url}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {imageUrls.length >= 3 && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="overflow-hidden rounded-lg border aspect-square">
                                        <img
                                            src={imageUrls[0]}
                                            alt="Preview 1"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="grid grid-rows-2 gap-2">
                                        <div className="overflow-hidden rounded-lg border">
                                            <img
                                                src={imageUrls[1]}
                                                alt="Preview 2"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="overflow-hidden rounded-lg border relative">
                                            <img
                                                src={imageUrls[2]}
                                                alt="Preview 3"
                                                className="w-full h-full object-cover"
                                            />
                                            {imageUrls.length > 3 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-white text-2xl font-bold">
                                                        +{imageUrls.length - 3}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex items-center justify-around">
                        <Button variant="ghost" size="sm" className="flex-1 gap-2" disabled>
                            <Heart className="h-4 w-4" />
                            <span className="text-xs">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2" disabled>
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2" disabled>
                            <Share2 className="h-4 w-4" />
                            <span className="text-xs">Share</span>
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

