import { z } from 'zod';
import { signUpSchema } from '../schemas/signupSchema';

export type SignUpFormValues = z.infer<typeof signUpSchema>;
