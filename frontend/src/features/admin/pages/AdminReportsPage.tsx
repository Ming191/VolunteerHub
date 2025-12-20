import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    adminReportsService,
    type ReportResponse,
    ReportResponseStatusEnum
} from '../api/adminReportsService';
import AnimatedPage from '@/components/common/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Archive } from 'lucide-react';
import { ReportsTable } from '../components/ReportsTable';
import { ReportReviewDialog } from '../components/ReportReviewDialog';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminReportsPage = () => {
    const [page] = useState(0); // setPage unused for now until pagination is fully implemented
    const [statusFilter, setStatusFilter] = useState<ReportResponseStatusEnum | 'ALL'>('ALL');
    const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const {
        data: reports,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['admin-reports', page, statusFilter],
        queryFn: () => adminReportsService.getAllReports({
            page,
            size: 20,
            status: statusFilter === 'ALL' ? undefined : statusFilter
        })
    });

    const { data: stats } = useQuery({
        queryKey: ['admin-report-stats'],
        queryFn: adminReportsService.getReportStats
    });

    const handleReview = (report: ReportResponse) => {
        setSelectedReport(report);
        setIsReviewOpen(true);
    };

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Content Reports</h1>
                        <p className="text-muted-foreground mt-2">Manage and review user-submitted reports.</p>
                    </div>
                    <div className="w-[200px]">
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as ReportResponseStatusEnum | 'ALL')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.Pending}>Pending</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.UnderReview}>Under Review</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.Resolved}>Resolved</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.Dismissed}>Dismissed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pendingReports || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.underReviewReports || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.resolvedReports || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
                            <Archive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.dismissedReports || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {isError ? (
                            <div className="p-6">
                                <ApiErrorState error={error} onRetry={refetch} />
                            </div>
                        ) : isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <ReportsTable
                                    reports={reports || []}
                                    onReview={handleReview}
                                />
                                {(!reports || reports.length === 0) && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No reports found matching criteria.
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ReportReviewDialog
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                report={selectedReport}
            />
        </AnimatedPage>
    );
};
