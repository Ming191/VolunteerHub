import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { settingsService } from '../api/settingsService';
import { toast } from 'sonner';

interface DangerZoneSectionProps {
    onAccountDeleted: () => void;
}

export const DangerZoneSection = ({ onAccountDeleted }: DangerZoneSectionProps) => {
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        try {
            await settingsService.deleteAccount({
                password: deletePassword,
                confirmationText: deleteConfirmation,
            });
            toast.success('Account deleted successfully');
            setDeleteDialogOpen(false);
            onAccountDeleted();
        } catch {
            toast.error('Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDeleteDialogOpen(open);
        if (!open) {
            // Reset form when dialog closes
            setDeletePassword('');
            setDeleteConfirmation('');
        }
    };

    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-start gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible and destructive actions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={deleteDialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove all your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="delete-password">Enter your password</Label>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Your password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delete-confirmation">
                                    Type <span className="font-bold">DELETE</span> to confirm
                                </Label>
                                <Input
                                    id="delete-confirmation"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="DELETE"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};
