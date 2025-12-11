import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EventTagsProps {
    tags?: Set<string> | string[];
}

export function EventTags({ tags }: EventTagsProps) {
    const tagsArray = Array.from(tags || []);

    if (tagsArray.length === 0) return null;

    return (
        <>
            <Separator />
            <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag) => (
                        <Badge key={tag} variant="outline">
                            {tag.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                </div>
            </div>
        </>
    );
}
