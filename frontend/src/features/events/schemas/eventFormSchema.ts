import { z } from 'zod';

export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const LOCATION_MIN_LENGTH = 3;
export const LOCATION_MAX_LENGTH = 200;

export const eventFormSchema = z.object({
    title: z.string()
        .min(TITLE_MIN_LENGTH, `Title must be at least ${TITLE_MIN_LENGTH} characters`)
        .max(TITLE_MAX_LENGTH, `Title must be less than ${TITLE_MAX_LENGTH} characters`),
    description: z.string()
        .min(DESCRIPTION_MIN_LENGTH, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`)
        .max(DESCRIPTION_MAX_LENGTH, `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters`),
    location: z.string()
        .min(LOCATION_MIN_LENGTH, `Location must be at least ${LOCATION_MIN_LENGTH} characters`)
        .max(LOCATION_MAX_LENGTH, `Location must be less than ${LOCATION_MAX_LENGTH} characters`),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
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

export type EventFormValues = z.infer<typeof eventFormSchema>;
