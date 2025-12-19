import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogPopup,
    AlertDialogTitle,
} from '@/components/animate-ui/components/base/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { reportService, type ReportType, type ReportReason } from '@/features/report/api/reportService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ReportDialogProps {
    open: boolean;
    onClose: () => void;
    targetId: number;
    targetType: ReportType;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: 'SPAM', label: 'Spam' },
    { value: 'HARASSMENT', label: 'Harassment' },
    { value: 'HATE_SPEECH', label: 'Hate Speech' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'MISINFORMATION', label: 'Misinformation' },
    { value: 'VIOLENCE', label: 'Violence' },
    { value: 'OTHER', label: 'Other' },
];

export const ReportDialog = ({ open, onClose, targetId, targetType }: ReportDialogProps) => {
    const [reason, setReason] = useState<ReportReason | undefined>(undefined);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!reason) {
            toast.error("Please select a reason for the report.");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportService.submitReport({
                type: targetType,
                targetId: targetId,
                reason: reason,
                description: description.trim() || undefined,
            });
            toast.success("Thank you for reporting. We will review it shortly.");
            onClose();
            // Reset form
            setReason(undefined);
            setDescription('');
        } catch (error) {
            console.error('Failed to submit report:', error);
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogPopup>
                <AlertDialogHeader>
                    <AlertDialogTitle>Report {targetType === 'POST' ? 'Post' : 'Comment'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Help us understand what's happening. Please select a reason for reporting this content.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select value={reason} onValueChange={(val) => setReason(val as ReportReason)}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide any additional details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting} onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={isSubmitting || !reason} onClick={handleSubmit}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogPopup>
        </AlertDialog>
    );
};
