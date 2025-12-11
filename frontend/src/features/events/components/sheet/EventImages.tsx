import { Image as ImageIcon } from 'lucide-react';

interface EventImagesProps {
    imageUrls?: string[];
    title: string;
}

export function EventImages({ imageUrls, title }: EventImagesProps) {
    if (imageUrls && imageUrls.length > 0) {
        return (
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    {imageUrls.slice(0, 4).map((url, index) => (
                        <div
                            key={index}
                            className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                        >
                            <img
                                src={url}
                                alt={`${title} - ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No images available</p>
            </div>
        </div>
    );
}
