import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/common/AnimatedPage';
import { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent } from '@/components/animate-ui/components/animate/tabs';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

export default function TabbedAuthScreen() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('login');

    useEffect(() => {
        if (location.pathname === '/signup') {
            setActiveTab('signup');
        } else {
            setActiveTab('login');
        }
    }, [location.pathname]);

    return (
        <AnimatedPage className="flex items-center justify-center min-h-screen py-12">
            <div className="w-full max-w-md">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Floating Tabs */}
                    <div className="flex justify-start mb-6">
                        <TabsList className="bg-background/80 backdrop-blur-sm border border-border shadow-lg">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContents>
                        <TabsContent value="login">
                            <LoginScreen isTabbed />
                        </TabsContent>
                        
                        <TabsContent value="signup">
                            <SignUpScreen isTabbed />
                        </TabsContent>
                    </TabsContents>
                </Tabs>
            </div>
        </AnimatedPage>
    );
}
