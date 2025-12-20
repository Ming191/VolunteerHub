import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImageUpload } from '@/features/blog/hooks/useImageUpload';
import { ImagePreviewGrid } from './ImagePreviewGrid';

interface CreatePostProps {
  onPost: (content: string, image: File[] | null) => void;
  disabled?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPost, disabled }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const {
    selectedImages,
    fileInputRef,
    handleFileSelect,
    removeImage,
    removeAllImages,
    openFileDialog,
    canAddMore,
    maxImages,
  } = useImageUpload();

  const handleSubmit = () => {
    if (!content.trim() && selectedImages.length === 0) return;

    const files = selectedImages.map(img => img.file);
    onPost(content, files);

    // Reset form
    setContent('');
    removeAllImages();
  };


  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="Share something with the community..."
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 px-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={disabled}
            />

            <ImagePreviewGrid images={selectedImages} onRemove={removeImage} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                openFileDialog();
              }}
              disabled={disabled || !canAddMore}
              type="button"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo {selectedImages.length > 0 && `(${selectedImages.length}/${maxImages})`}
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && selectedImages.length === 0) || disabled}
            className="px-6"
            type="button"
          >
            {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
