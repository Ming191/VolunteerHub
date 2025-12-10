import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, FileCheck, TrendingUp, Settings } from 'lucide-react';
import { MONITORING_URLS } from '../config/monitoring';
import { safelyOpenURL } from '../utils/urlValidator';
import { useState } from 'react';

export const InfrastructureLinks = () => {
    const [error, setError] = useState<string | null>(null);

    const handleOpenURL = (url: string) => {
        setError(null);
        safelyOpenURL(url, (errorMessage) => {
            setError(errorMessage);
            // Clear error after 5 seconds for better UX
            setTimeout(() => setError(null), 5000);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Infrastructure & Monitoring</CardTitle>
                <CardDescription>Direct access to observability tools</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col hover:bg-muted/50"
                      onClick={() => handleOpenURL(MONITORING_URLS.grafana)}
                    >
                        <Activity className="h-5 w-5 mb-2 text-orange-500" />
                        <span className="text-sm">Grafana</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col hover:bg-muted/50"
                      onClick={() => handleOpenURL(MONITORING_URLS.loki)}
                    >
                        <FileCheck className="h-5 w-5 mb-2 text-blue-500" />
                        <span className="text-sm">View Logs</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col hover:bg-muted/50"
                      onClick={() => handleOpenURL(MONITORING_URLS.tempo)}
                    >
                        <TrendingUp className="h-5 w-5 mb-2 text-green-500" />
                        <span className="text-sm">Trace Search</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col hover:bg-muted/50"
                      onClick={() => handleOpenURL(MONITORING_URLS.rabbitmq)}
                    >
                        <Settings className="h-5 w-5 mb-2 text-red-500" />
                        <span className="text-sm">RabbitMQ</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
