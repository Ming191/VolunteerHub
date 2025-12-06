import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type UserResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, MoreVertical, Lock, Unlock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import AnimatedPage from '@/components/common/AnimatedPage';

interface PageUserResponse {
    content: UserResponse[];
    totalElements: number;
    totalPages: number;
}

import { useDebounce } from '@/hooks/useDebounce';

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const queryClient = useQueryClient();

    // Fetch users
    const { data: usersPage, isLoading } = useQuery({
        queryKey: ['admin-users', debouncedSearchQuery],
        queryFn: async () => {
            const response = await axiosInstance.get<PageUserResponse>('/api/admin/users/search', {
                params: {
                    q: debouncedSearchQuery,
                    page: 0,
                    size: 100, // Fetch 100 for now
                }
            });
            return response.data;
        },
    });

    const users = usersPage?.content || [];

    // Lock/Unlock user mutation
    const toggleLockMutation = useMutation({
        mutationFn: async ({ userId, isLocked }: { userId: number; isLocked: boolean }) => {
            const endpoint = isLocked ? 'unlock' : 'lock';
            await axiosInstance.patch(`/api/admin/users/${userId}/${endpoint}`);
        },
        onSuccess: () => {
            toast.success('User status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            toast.error('Failed to update user status');
        },
    });

    const handleToggleLock = (userId: number, isLocked: boolean) => {
        const action = isLocked ? 'unlock' : 'lock';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            toggleLockMutation.mutate({ userId, isLocked });
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'default';
            case 'EVENT_ORGANIZER': return 'secondary';
            case 'VOLUNTEER': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Users Directory</CardTitle>
                                <CardDescription>
                                    {usersPage?.totalElements || 0} users found
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-8 h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-4 group"
                                    >
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage src={user.profilePictureUrl} />
                                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-sm truncate">{user.name}</h4>
                                                <Badge variant={getRoleBadgeVariant(user.role) as any} className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                                    {user.role.replace('_', ' ')}
                                                </Badge>
                                                {user.isLocked && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                                                        LOCKED
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                        Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleLock(user.id, user.isLocked);
                                                    }}>
                                                        {user.isLocked ? (
                                                            <>
                                                                <Unlock className="mr-2 h-4 w-4" />
                                                                Unlock User
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="mr-2 h-4 w-4" />
                                                                Lock User
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground text-sm">
                                        No users found
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
}
