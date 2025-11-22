import {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2} from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/animate-ui/components/radix/dialog';
import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DateTimePicker from './DateTimePicker';
import { eventService } from '@/services/eventService';
import { useGetEventTags } from '@/hooks/useEventTags';
import type {UpdateEventRequest, EventResponse} from '@/api-client';
import { FileUpload } from '@/components/ui/file-upload';

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventResponse;
  onSuccess?: () => void;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 5000;
const LOCATION_MIN_LENGTH = 3;
const LOCATION_MAX_LENGTH = 200;

const formSchema = z.object({
  title: z.string()
    .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
    .max(TITLE_MAX_LENGTH, `Title must be less than ${TITLE_MAX_LENGTH} characters`),
  description: z.string()
    .min(DESCRIPTION_MIN_LENGTH, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`)
    .max(DESCRIPTION_MAX_LENGTH, `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters`),
  location: z.string()
    .min(LOCATION_MIN_LENGTH, `Location must be at least ${LOCATION_MIN_LENGTH} characters`)
    .max(LOCATION_MAX_LENGTH, `Location must be less than ${LOCATION_MAX_LENGTH} characters`),
  eventDateTime: z.date({ message: 'Event start date and time is required' }),
  endDateTime: z.date({ message: 'Event end date and time is required' }),
  registrationDeadline: z.date().optional(),
  maxParticipants: z.number().int().positive().optional(),
  waitlistEnabled: z.boolean(),
  tags: z.array(z.string()).optional(),
})
  .refine((data) => data.endDateTime > data.eventDateTime, {
    message: 'End date must be after start date',
    path: ['endDateTime'],
  })
  .refine((data) => !data.registrationDeadline || data.registrationDeadline < data.eventDateTime, {
    message: 'Registration deadline must be before event start',
    path: ['registrationDeadline'],
  });

type FormValues = z.infer<typeof formSchema>;

const formatDateForBackend = (date: Date): string => {
  return date.toISOString().substring(0, 19);
};

const validateUserPermissions = (): { isValid: boolean; userRole?: string } => {
  const storedUser = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');

  if (!storedUser || !accessToken) {
    return { isValid: false };
  }

  try {
    const user = JSON.parse(storedUser);
    const isValid = user.role === 'EVENT_ORGANIZER' || user.role === 'ADMIN';
    return { isValid, userRole: user.role };
  } catch {
    return { isValid: false };
  }
};

export default function EditEventModal({ open, onOpenChange, onSuccess, event }: EditEventModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  console.log(event);
  const { data: eventTags, isLoading: tagsLoading } = useGetEventTags();
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      waitlistEnabled: false,
      tags: [],
    },
  });

  useEffect(() => {
    if (!event) return;

    form.reset({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      eventDateTime: event.eventDateTime ? new Date(event.eventDateTime) : undefined,
      endDateTime: event.endDateTime ? new Date(event.endDateTime) : undefined,
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : undefined,
      maxParticipants: event.maxParticipants || undefined,
      waitlistEnabled: event.waitlistEnabled ?? false,
      tags: [...event.tags]
    });

    setExistingImages(event.imageUrls || []);
    setFiles([]);
  }, [event, form]);

  const { isSubmitting } = form.formState;

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`);
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`${file.name} exceeds 5MB limit`);
      return false;
    }
    return true;
  };

  const handleFileChange = (newFiles: File[]): void => {
    const validFiles = newFiles.filter(validateFile);
    const combinedFiles = [...files, ...validFiles].slice(0, MAX_IMAGES);

    setFiles(combinedFiles);
  };
  const handleError = (error: unknown): void => {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = err?.response?.status;

    if (status === 401) {
      toast.error('Authentication required', {
        description: 'Your session has expired. Please log in again.',
      });
      localStorage.clear();
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
      return;
    }

    if (status === 400) {
      const errorMessage = err?.response?.data?.message || 'Invalid event data. Please check your inputs.';
      toast.error('Validation error', { description: errorMessage });
      return;
    }

    if (status === 403) {
      const storedUser = localStorage.getItem('user');
      const userRole = storedUser ? JSON.parse(storedUser).role : 'unknown';
      toast.error('Permission denied', {
        description: `You do not have permission to create events. Current role: ${userRole}. Required: EVENT_ORGANIZER or ADMIN.`,
      });
      return;
    }

    const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
    toast.error('Failed to create event', { description: errorMessage });
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    const { isValid, userRole } = validateUserPermissions();

    if (!isValid) {
      toast.error('Authentication required', {
        description: 'Please log in to create events.',
      });
      return;
    }

    if (userRole !== 'EVENT_ORGANIZER' && userRole !== 'ADMIN') {
      toast.error('Permission denied', {
        description: `Only Event Organizers and Admins can create events. Your role: ${userRole}`,
      });
      return;
    }

    try {
      const eventData = {
        title: values.title,
        description: values.description,
        location: values.location,
        eventDateTime: formatDateForBackend(values.eventDateTime),
        endDateTime: formatDateForBackend(values.endDateTime),
        registrationDeadline: values.registrationDeadline
          ? formatDateForBackend(values.registrationDeadline)
          : undefined,
        maxParticipants: values.maxParticipants,
        waitlistEnabled: values.waitlistEnabled,
        tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
      };

      await eventService.updateEvent(event.id, eventData as UpdateEventRequest);

      toast.success('Event updated successfully!', {
        description: 'Your event has been updated',
      });

      form.reset();
      setFiles([]);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new volunteer event. Events require admin approval before being published.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              {files.length < MAX_IMAGES && (
                <FileUpload
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

            <DialogFooter className="gap-2">
              <RippleButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </RippleButton>
              <RippleButton type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </RippleButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

