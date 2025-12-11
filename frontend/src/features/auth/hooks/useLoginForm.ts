import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema } from '../schemas/loginSchema';
import type { LoginFormValues } from '../types/ui-login';

export function useLoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(values: LoginFormValues) {
        try {
            await login(values);
            toast.success('Login successful!');
            navigate({ to: '/dashboard' });
        } catch (error: unknown) {
            let errorMessage = 'Login failed. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                const response = (error as { response?: { data?: { message?: string } } }).response;
                if (response?.data?.message) {
                    errorMessage = response.data.message;
                }
            }
            toast.error(errorMessage);
        }
    }

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isSubmitting,
    };
}
