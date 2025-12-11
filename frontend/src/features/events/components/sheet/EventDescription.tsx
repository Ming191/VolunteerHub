interface EventDescriptionProps {
    description: string;
}

export function EventDescription({ description }: EventDescriptionProps) {
    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {description}
            </p>
        </div>
    );
}
