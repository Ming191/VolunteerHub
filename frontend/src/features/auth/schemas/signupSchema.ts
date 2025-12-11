import { z } from 'zod';

export const signUpSchema = z
    .object({
        username: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
        email: z.email({ message: 'Please enter a valid email.' }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters.' })
            .max(100, { message: 'Password must be no more than 100 characters.' })
            .regex(/.*[A-Z].*/, { message: 'Password must contain at least one uppercase letter.' })
            .regex(/.*[a-z].*/, { message: 'Password must contain at least one lowercase letter.' })
            .regex(/.*\d.*/, { message: 'Password must contain at least one digit.' })
            .regex(/.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-].*/, {
                message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
            }),
        confirmPassword: z.string(),
        role: z.enum(['VOLUNTEER', 'EVENT_ORGANIZER'], {
            message: 'You need to select a role.',
        }),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
            message: 'Gender is required.',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });
