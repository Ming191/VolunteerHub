import { z } from 'zod';
import { loginSchema } from '../schemas/loginSchema';

export type LoginFormValues = z.infer<typeof loginSchema>;
