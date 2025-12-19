import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EventMap } from './page/EventMap';
import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DateTimePicker } from './DateTimePicker';
import { FileUpload } from '@/components/ui/file-upload';
import { useEventForm } from '../hooks/useEventForm';
import { type EventFormValues } from '../schemas/eventFormSchema';

// Re-export type for consumers
export type { EventFormValues } from '../schemas/eventFormSchema';

interface EventFormProps {
    defaultValues?: Partial<EventFormValues>;
    initialImages?: string[];
    onSubmit: (values: EventFormValues, files: File[], remainingImages: string[]) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting?: boolean;
    formId?: string;
    hideActions?: boolean;
}

export const EventForm = (props: EventFormProps) => {
    const {
        form,
        files,
        existingImages,
        setExistingImages,
        eventTags,
        tagsLoading,
        isSubmitting,
        handleFileChange,
        handleSubmit,
        MAX_IMAGES
    } = useEventForm(props);

    const { onCancel, submitLabel, formId, hideActions } = props;
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Watch location for geocoding
    const locationValue = form.watch('location');
    const latitude = form.watch('latitude');
    const longitude = form.watch('longitude');

    // Debounced geocoding
    useEffect(() => {
        if (!locationValue || locationValue.length < 3) return;

        // Skip if location matches current lat/long (to avoid loops if we reverse geocode later)
        // For now, simple text entry triggers lookup

        const timeoutId = setTimeout(async () => {
            setIsGeocoding(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationValue)}&limit=1`
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    // Only update if no manual pin drop has happened yet OR if user explicitly types a new address
                    // For simplicity, we always update on address change, user can refine causing "manual override"
                    form.setValue('latitude', lat);
                    form.setValue('longitude', lon);
                }
            } catch (error) {
                console.error("Geocoding failed", error);
            } finally {
                setIsGeocoding(false);
            }
        }, 1500); // 1.5s debounce to be nice to OSM

        return () => clearTimeout(timeoutId);
    }, [locationValue, form]);

    const handleLocationSelect = (lat: number, lng: number) => {
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
    };

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="Community Cleanup Day" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your event in detail..."
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Main Street, City, State" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Map Location
                    </label>
                    <div className="relative border rounded-md overflow-hidden">
                        <EventMap
                            latitude={latitude}
                            longitude={longitude}
                            interactive={true}
                            onLocationSelect={handleLocationSelect}
                        />
                        {isGeocoding && (
                            <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full shadow-sm animate-spin">
                                <Loader2 className="h-4 w-4 text-primary" />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground p-2 bg-muted/30">
                            {latitude && longitude
                                ? "Click on the map to refine the location pin."
                                : "Enter a location above to find it on the map, or click to set manually."}
                        </p>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="eventDateTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Event Start Date & Time *</FormLabel>
                            <FormControl>
                                <DateTimePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Pick a date and time"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="endDateTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Event End Date & Time *</FormLabel>
                            <FormControl>
                                <DateTimePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Pick a date and time"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Registration Deadline (Optional)</FormLabel>
                            <FormControl>
                                <DateTimePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Pick a date and time"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Participants (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="50"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormDescription>Leave empty for unlimited participants</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="waitlistEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Waitlist</FormLabel>
                                <FormDescription>
                                    Allow people to join a waitlist when event is full
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Tags (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    {tagsLoading ? (
                                        <div className="text-sm text-muted-foreground">Loading tags...</div>
                                    ) : eventTags && eventTags.length > 0 ? (
                                        <div className="max-h-48 overflow-y-auto p-2 border rounded-md">
                                            <ToggleGroup
                                                type="multiple"
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                className="flex-wrap justify-start gap-2"
                                            >
                                                {eventTags.map((tag) => (
                                                    <ToggleGroupItem
                                                        key={tag.value}
                                                        value={tag.value}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                    >
                                                        {tag.label}
                                                    </ToggleGroupItem>
                                                ))}
                                            </ToggleGroup>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No tags available</div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>Select tags that describe your event</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Event Images (Optional)
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                        Upload up to {MAX_IMAGES} images (max 5MB each)
                    </p>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {existingImages.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url} alt={url}
                                        className="w-full h-24 object-cover rounded-md border"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-80 hover:opacity-100"
                                        onClick={() =>
                                            setExistingImages(prev => prev.filter((_, i) => i !== index))
                                        }
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {files.length + existingImages.length < MAX_IMAGES && (
                        <FileUpload
                            files={files}
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple={true}
                        />
                    )}

                    {files.length + existingImages.length >= MAX_IMAGES && (
                        <p className="text-sm text-muted-foreground text-center p-4 bg-muted rounded-lg">
                            Maximum of {MAX_IMAGES} images reached
                        </p>
                    )}
                </div>

                {!hideActions && (
                    <div className="flex justify-end gap-2">
                        <RippleButton
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </RippleButton>
                        <RippleButton type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitLabel}
                        </RippleButton>
                    </div>
                )}
            </form>
        </Form>
    );
}
