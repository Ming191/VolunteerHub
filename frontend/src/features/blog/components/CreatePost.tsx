import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Image, Smile } from 'lucide-react';

interface CreatePostProps {
    onPost: (content: string) => void;
    disabled?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPost, disabled }) => {
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        if (!content.trim()) return;
        onPost(content);
        setContent('');
    };

    return (
        <Card className="w-full mb-6">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                    <Textarea
                        placeholder="Share something with the community..."
                        className="min-h-[100px] resize-none border-none focus-visible:ring-0 px-0"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={disabled}
                    />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Image className="h-4 w-4 mr-2" />
                            Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Smile className="h-4 w-4 mr-2" />
                            Feeling
                        </Button>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() || disabled}
                        className="px-6"
                    >
                        Post
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
