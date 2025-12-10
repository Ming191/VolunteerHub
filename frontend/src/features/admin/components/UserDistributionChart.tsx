import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserDistributionChartProps {
    roleCounts: { [key: string]: number };
    totalUsers: number;
}

export const UserDistributionChart = ({ roleCounts, totalUsers }: UserDistributionChartProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">User Distribution</CardTitle>
                <CardDescription>Role breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(roleCounts).map(([role, count]) => (
                    <div key={role} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{role.toLowerCase().replace('_', ' ')}</span>
                            <span className="font-medium">{String(count)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-foreground transition-all"
                                style={{ width: `${(Number(count) / Number(totalUsers || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
