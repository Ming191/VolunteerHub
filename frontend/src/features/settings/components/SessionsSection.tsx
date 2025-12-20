import { LogOut, Laptop, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowUTC } from '@/lib/dateUtils';
import type { ActiveSessionResponse } from '@/api-client';

interface SessionsSectionProps {
    sessions: ActiveSessionResponse[];
    isLoading: boolean;
    isRevoking: boolean;
    revokeSession: (sessionId: number) => void;
    revokeAllOtherSessions: () => void;
}

export const SessionsSection = ({
    sessions,
    isLoading,
    isRevoking,
    revokeSession,
    revokeAllOtherSessions
}: SessionsSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start gap-2">
                    <LogOut className="h-5 w-5" />
                    Active Sessions
                </CardTitle>
                <CardDescription>
                    Manage your active login sessions
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No active sessions</div>
                ) : (
                    <>
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                                <div className="flex items-start gap-3">
                                    {session.userAgent?.toLowerCase().includes('mobile') ? (
                                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Laptop className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="font-medium flex items-start gap-2">
                                            {session.userAgent?.slice(0, 50) || 'Unknown Device'}
                                            {session.isCurrent && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {session.ipAddress || 'Unknown IP'} • {
                                                session.createdAt
                                                    ? formatDistanceToNowUTC(session.createdAt, { addSuffix: true })
                                                    : 'Unknown time'
                                            }
                                        </div>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeSession(session.id!)}
                                        disabled={isRevoking}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))}
                        {sessions.length > 1 && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => revokeAllOtherSessions()}
                                disabled={isRevoking}
                            >
                                Revoke All Other Sessions
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
