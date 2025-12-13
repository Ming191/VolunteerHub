import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Image, Smile, X } from 'lucide-react'; // Import thêm icon X để xóa ảnh

interface CreatePostProps {
  // Cập nhật interface để nhận thêm ảnh (nếu cần xử lý upload)
  onPost: (content: string, image: File[] | null) => void;
  disabled?: boolean;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPost, disabled }) => {
  const [content, setContent] = useState('');
  // Store both file and preview URL together
  const [selectedImages, setSelectedImages] = useState<{ file: File; url: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!content.trim() && selectedImages.length === 0) return;

    const files = selectedImages.map(img => img.file);
    onPost(content, files);

    // Reset form
    setContent('');
    removeAllImages();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: { file: File; url: string }[] = [];
      // Calculate how many we can add
      const remainingSlots = 5 - selectedImages.length;
      const countToAdd = Math.min(files.length, remainingSlots);

      for (let i = 0; i < countToAdd; i++) {
        const file = files[i];
        newImages.push({
          file: file,
          url: URL.createObjectURL(file)
        });
      }

      if (files.length > remainingSlots) {
        // Could add a toast warning here about max 5 images
      }

      setSelectedImages(prev => [...prev, ...newImages]);

      // Reset input value to allow selecting the same file again if needed (though usually for 'add more' flow)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      // Revoke URL to avoid memory leaks
      URL.revokeObjectURL(newImages[indexToRemove].url);
      newImages.splice(indexToRemove, 1);
      return newImages;
    });
  };

  const removeAllImages = () => {
    selectedImages.forEach(img => URL.revokeObjectURL(img.url));
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
          <div className="w-full">
            <Textarea
              placeholder="Share something with the community..."
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 px-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={disabled}
            />

            {/* Image Preview Grid */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 mb-2">
                {selectedImages.map((image, index) => (
                  <div key={`${image.file.name}-${index}`} className="relative group">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple // Allow multiple selection
              onChange={handleFileChange}
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={handlePhotoClick}
              disabled={disabled || selectedImages.length >= 5}
            >
              <Image className="h-4 w-4 mr-2" />
              Photo {selectedImages.length > 0 && `(${selectedImages.length}/5)`}
            </Button>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Smile className="h-4 w-4 mr-2" />
              Feeling
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={(!content.trim() && selectedImages.length === 0) || disabled}
            className="px-6"
          >
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
