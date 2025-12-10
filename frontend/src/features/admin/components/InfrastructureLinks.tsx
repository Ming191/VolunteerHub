import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, FileCheck, TrendingUp, Settings } from 'lucide-react';
import { MONITORING_URLS } from '../config/monitoring';

export const InfrastructureLinks = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Infrastructure & Monitoring</CardTitle>
                <CardDescription>Direct access to observability tools</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open(MONITORING_URLS.grafana, '_blank')}>
                        <Activity className="h-5 w-5 mb-2 text-orange-500" />
                        <span className="text-sm">Grafana</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open(MONITORING_URLS.loki, '_blank')}>
                        <FileCheck className="h-5 w-5 mb-2 text-blue-500" />
                        <span className="text-sm">View Logs</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open(MONITORING_URLS.tempo, '_blank')}>
                        <TrendingUp className="h-5 w-5 mb-2 text-green-500" />
                        <span className="text-sm">Trace Search</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col hover:bg-muted/50" onClick={() => window.open(MONITORING_URLS.rabbitmq, '_blank')}>
                        <Settings className="h-5 w-5 mb-2 text-red-500" />
                        <span className="text-sm">RabbitMQ</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
