import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface EventImagesProps {
    imageUrls?: string[];
    title: string;
}

const EventImageItem = ({ url, title, index, className }: { url: string, title: string, index: number, className?: string }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    return (
        <div className={`relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center ${className || ''}`}>
            {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            {status !== 'error' && (
                <img
                    src={url}
                    alt={`${title} - ${index + 1}`}
                    className={`relative w-full h-full object-contain z-10 transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}
        </div>
    );
};

export function EventImages({ imageUrls, title }: EventImagesProps) {
    if (imageUrls && imageUrls.length > 0) {
        return (
            <div className="space-y-2">
                <div className={`grid gap-2 ${imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {imageUrls.slice(0, 4).map((url, index) => (
                        <EventImageItem
                            key={index}
                            url={url}
                            title={title}
                            index={index}
                            className={imageUrls.length === 3 && index === 0 ? 'col-span-2' : ''}
                        />
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
