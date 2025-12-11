import { useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fadeOnly, fadeTransition } from '@/lib/fadeAnimations';
import { useEmailVerification } from '../hooks/useEmailVerification';
import AnimatedPage from '@/components/common/AnimatedPage';

export const EmailVerificationScreen = () => {
    const navigate = useNavigate();
    const { status, message, userInfo } = useEmailVerification();

    const handleContinueToLogin = () => {
        navigate({ to: '/signin' });
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <motion.div
                        className="flex flex-col items-center justify-center space-y-4"
                        variants={fadeOnly}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={fadeTransition}
                    >
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <h2 className="text-2xl font-semibold">Verifying your email...</h2>
                        <p className="text-muted-foreground text-center">
                            Please wait while we verify your email address.
                        </p>
                    </motion.div>
                );

            case 'success':
                return (
                    <motion.div
                        className="flex flex-col items-center justify-center space-y-4"
                        variants={fadeOnly}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={fadeTransition}
                    >
                        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400">
                            Email Verified!
                        </h2>
                        {userInfo && (
                            <div className="text-center">
                                <p className="text-lg font-medium">{userInfo.name}</p>
                                <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                            </div>
                        )}
                        <p className="text-muted-foreground text-center max-w-md">
                            {message}
                        </p>
                        <p className="text-sm text-muted-foreground text-center">
                            Your account is now active. You can log in and start exploring VolunteerHub!
                        </p>
                        <Button onClick={handleContinueToLogin} size="lg" className="mt-4">
                            Continue to Login
                        </Button>
                    </motion.div>
                );

            case 'error':
                return (
                    <motion.div
                        className="flex flex-col items-center justify-center space-y-4"
                        variants={fadeOnly}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={fadeTransition}
                    >
                        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
                            Verification Failed
                        </h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            {message}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <Button onClick={handleContinueToLogin} variant="outline">
                                Go to Login
                            </Button>
                            <Button asChild>
                                <Link to="/signup">Create New Account</Link>
                            </Button>
                        </div>
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Need help?</p>
                                    <p className="text-sm text-muted-foreground">
                                        If you believe this is an error, please contact support or try registering again.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <AnimatedPage className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <motion.div
                        variants={fadeOnly}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={fadeTransition}
                    >
                        <CardTitle className="text-3xl font-bold">
                            Email Verification
                        </CardTitle>
                        <CardDescription className="mt-2">
                            VolunteerHub Account Verification
                        </CardDescription>
                    </motion.div>
                </CardHeader>
                <CardContent className="py-8">
                    {renderContent()}
                </CardContent>
            </Card>
        </AnimatedPage>
    );
};

