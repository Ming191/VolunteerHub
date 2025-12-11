import { useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { authService } from '@/features/auth/api/authService';

export type VerificationStatus = 'verifying' | 'success' | 'error';

interface UserInfo {
    name: string;
    email: string;
}

interface UseEmailVerificationReturn {
    status: VerificationStatus;
    message: string;
    userInfo: UserInfo | null;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
    const { token } = useSearch({ from: '/verify-email' });
    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [message, setMessage] = useState('');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await authService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                setUserInfo({
                    name: response.name,
                    email: response.email
                });
            } catch (error: unknown) {
                setStatus('error');
                let errorMessage = 'Failed to verify email. The link may be invalid or expired.';

                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
                    errorMessage = axiosError.response?.data?.message
                        || axiosError.response?.data?.error
                        || errorMessage;
                }

                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [token]);

    return { status, message, userInfo };
};
