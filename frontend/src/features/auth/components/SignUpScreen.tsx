import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import AnimatedPage from '@/components/common/AnimatedPage';

const formSchema = z
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

interface SignUpScreenProps {
    isTabbed?: boolean;
}

export default function SignUpScreen({ isTabbed = false }: SignUpScreenProps) {
    const { register } = useAuth();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await register(values);
            toast.success('Registration successful!', {
                description: 'Please check your email to verify your account.',
            });
            navigate('/signin');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error && 'response' in error
                ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed. Please try again.')
                : 'Registration failed. Please try again.';
            toast.error(errorMessage);
        }
    }

    const cardContent = (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Join VolunteerHub to find or create events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                            <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>I am a...</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                                            <SelectItem value="EVENT_ORGANIZER">Event Organizer</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>
                </Form>
                {!isTabbed && (
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/signin" className="underline">
                            Sign in
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return isTabbed ? cardContent : (
        <AnimatedPage className="flex items-center justify-center min-h-screen py-12">
            {cardContent}
        </AnimatedPage>
    );
}
