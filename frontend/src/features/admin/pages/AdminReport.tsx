import { useState } from 'react';
import AnimatedPage from '@/components/common/AnimatedPage';
import { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent } from '@/components/animate-ui/components/animate/tabs';
import { AdminUsers } from './AdminUsers';
import { AdminEvents } from './AdminEvents';

export const AdminReport = () => {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Report</h1>
                    <p className="text-muted-foreground">Manage users and events.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[150px]">
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                    </TabsList>

                    <TabsContents className="mt-6">
                        <TabsContent value="users">
                            <AdminUsers isTabbed />
                        </TabsContent>
                        <TabsContent value="events">
                            <AdminEvents />
                        </TabsContent>
                    </TabsContents>
                </Tabs>
            </div>
        </AnimatedPage>
    );
};
