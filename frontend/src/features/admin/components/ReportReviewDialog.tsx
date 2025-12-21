import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    adminReportsService,
    type ReportResponse,
    ReportResponseStatusEnum,
    type ReviewReportRequest
} from '../api/adminReportsService';

interface ReportReviewDialogProps {
    report: ReportResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ReportReviewDialog = ({ report, open, onOpenChange }: ReportReviewDialogProps) => {
    const queryClient = useQueryClient();
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<ReportResponseStatusEnum>(ReportResponseStatusEnum.Resolved);
    const [deleteContent, setDeleteContent] = useState(false);

    const reviewMutation = useMutation({
        mutationFn: (data: ReviewReportRequest & { deleteContent?: boolean }) => {
            if (!report) throw new Error('No report selected');
            return adminReportsService.reviewReport(report.id, data);
        },
        onSuccess: () => {
            toast.success('Report reviewed successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            onOpenChange(false);
            setNote('');
            setStatus(ReportResponseStatusEnum.Resolved);
            setDeleteContent(false);
        },
        onError: (error) => {
            console.error('Failed to review report:', error);
            toast.error('Failed to submit review');
        }
    });

    const handleSubmit = () => {
        reviewMutation.mutate({
            status,
            reviewNote: note,
            deleteContent: deleteContent && status === ReportResponseStatusEnum.Resolved
        });
    };

    if (!report) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Report #{report.id}</DialogTitle>
                    <DialogDescription>
                        Reviewing {report.type.toLowerCase()} report submitted by {report.reporter.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Reason</Label>
                        <div className="col-span-3 font-medium">
                            {report.reason.replace(/_/g, ' ')}
                        </div>
                    </div>

                    {report.description && (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">Description</Label>
                            <div className="col-span-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                {report.description}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Action
                        </Label>
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as ReportResponseStatusEnum)}
                        >
                            <SelectTrigger className="col-span-3" id="status">
                                <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent className="z-[200]">
                                <SelectItem value={ReportResponseStatusEnum.Resolved}>Resolve (Valid Report)</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.Dismissed}>Dismiss (Invalid Report)</SelectItem>
                                <SelectItem value={ReportResponseStatusEnum.UnderReview}>Mark Under Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {status === ReportResponseStatusEnum.Resolved && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-start-2 col-span-3 flex items-center space-x-2">
                                <Checkbox
                                    id="deleteContent"
                                    checked={deleteContent}
                                    onCheckedChange={(checked) => setDeleteContent(checked as boolean)}
                                />
                                <Label htmlFor="deleteContent" className="text-sm font-normal cursor-pointer">
                                    Delete reported content?
                                </Label>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="note" className="text-right mt-2">
                            Review Note
                        </Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add internal notes about this review..."
                            className="col-span-3"
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={reviewMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
