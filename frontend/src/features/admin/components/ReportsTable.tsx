import {
    type ReportResponse,
    ReportResponseStatusEnum
} from '@/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye } from 'lucide-react';

interface ReportsTableProps {
    reports: ReportResponse[];
    onReview: (report: ReportResponse) => void;
}

const getStatusBadgeVariant = (status: ReportResponseStatusEnum) => {
    switch (status) {
        case 'PENDING':
            return 'secondary'; // Grey/Yellowish
        case 'UNDER_REVIEW':
            return 'default'; // Blue/Primary
        case 'RESOLVED':
            return 'outline'; // Green usually, but let's stick to outline for resolved to look clean or 'default'
        case 'DISMISSED':
            return 'outline';
        default:
            return 'outline';
    }
};

const getStatusLabel = (status: ReportResponseStatusEnum) => {
    return status.replace('_', ' ');
};

export const ReportsTable = ({ reports, onReview }: ReportsTableProps) => {
    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm border-b">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reason</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reporter</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Target ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                    No reports found.
                                </td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle">
                                        <Badge variant="outline">{report.type}</Badge>
                                    </td>
                                    <td className="p-4 align-middle font-medium">
                                        {report.reason.replace(/_/g, ' ')}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{report.reporter.name}</span>
                                            <span className="text-xs text-muted-foreground">{report.reporter.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className="font-mono text-xs">{report.targetId}</span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={getStatusBadgeVariant(report.status)}>
                                            {getStatusLabel(report.status)}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onReview(report)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Review Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
