import {
    type ReportResponse,
    ReportResponseStatusEnum
} from '@/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ReportsTableProps {
    reports: ReportResponse[];
    onReview: (report: ReportResponse) => void;
}

const getStatusBadgeVariant = (status: ReportResponseStatusEnum): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'PENDING':
            return 'secondary';
        case 'UNDER_REVIEW':
            return 'default';
        case 'RESOLVED':
            return 'outline';
        case 'DISMISSED':
            return 'outline';
        default:
            return 'outline';
    }
};

const getStatusBadgeStyle = (status: ReportResponseStatusEnum) => {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'UNDER_REVIEW':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'RESOLVED':
            return 'bg-green-50 text-green-700 border-green-200';
        case 'DISMISSED':
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return '';
    }
};

const getStatusLabel = (status: ReportResponseStatusEnum) => {
    return status.replace(/_/g, ' ');
};

export const ReportsTable = ({ reports, onReview }: ReportsTableProps) => {
    if (reports.length === 0) {
        return (
            <div className="bg-white p-8 text-center">
                <p className="text-muted-foreground">No reports found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white">
            {/* Header Row */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 border-t-0 border-x-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-6 gap-4">
                        <div className="text-xs font-semibold text-gray-700 border-0">Type</div>
                        <div className="text-xs font-semibold text-gray-700 border-0">Reason</div>
                        <div className="text-xs font-semibold text-gray-700 border-0">Reporter</div>
                        <div className="text-xs font-semibold text-gray-700 border-0">Target ID</div>
                        <div className="text-xs font-semibold text-gray-700 border-0">Date</div>
                        <div className="text-xs font-semibold text-gray-700 border-0">Status</div>
                    </div>
                    <div className="w-24 shrink-0"></div>
                </div>
            </div>

            {/* Data Rows */}
            {reports.map((report, index) => (
                <div
                    key={report.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-x-0 ${index !== reports.length - 1 ? 'border-b border-gray-200 border-t-0' : 'border-0'
                        }`}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                            {/* Type */}
                            <div className="min-w-0">
                                <Badge variant="outline">{report.type}</Badge>
                            </div>

                            {/* Reason */}
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                    {report.reason.replace(/_/g, ' ')}
                                </div>
                            </div>

                            {/* Reporter */}
                            <div className="min-w-0">
                                <div className="text-sm">
                                    <div className="font-semibold text-gray-900 truncate">{report.reporter.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{report.reporter.email}</div>
                                </div>
                            </div>

                            {/* Target ID */}
                            <div className="min-w-0">
                                <div className="font-mono text-xs font-medium text-gray-700 truncate">{report.targetId}</div>
                            </div>

                            {/* Date */}
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-700 truncate">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="min-w-0">
                                <Badge
                                    variant="outline"
                                    className={getStatusBadgeStyle(report.status)}
                                >
                                    {getStatusLabel(report.status)}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions */}
                        {(report.status === ReportResponseStatusEnum.UnderReview || report.status === ReportResponseStatusEnum.Pending) ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReview(report)}
                                className="shrink-0 w-24"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                            </Button>
                        ) : (
                            <div className="w-24 shrink-0"></div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
