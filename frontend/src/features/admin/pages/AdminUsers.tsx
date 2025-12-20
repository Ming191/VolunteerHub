import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Mail, MoreVertical, Lock, Unlock, Download } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SmartPagination } from '@/components/common/SmartPagination';
import AnimatedPage from '@/components/common/AnimatedPage';
import { UserListItemSkeleton } from '@/components/ui/loaders';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorState } from '@/components/ui/api-error-state';
import { useAdminUsers } from '../hooks/useAdminUsers';

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface AdminUsersProps {
    isTabbed?: boolean;
}

export const AdminUsers = ({ isTabbed = false }: AdminUsersProps) => {
    const {
        users,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        searchQuery,
        setSearchQuery,
        handleToggleLock,
        handleViewUserProfile,
        page,
        setPage,
        totalPages,
        handleExportUsers
    } = useAdminUsers();

    const getRoleBadgeVariant = (role: string): BadgeVariant => {
        switch (role) {
            case 'ADMIN':
                return 'default';
            case 'MODERATOR':
                return 'secondary';
            case 'USER':
            default:
                return 'outline';
        }
    };

    const content = (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users, their roles, and lock status.</CardDescription>
                <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={handleExportUsers} aria-label="Export users to CSV">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {isError ? (
                    <ApiErrorState error={error} onRetry={refetch} />
                ) : isLoading ? (
                    <div className="space-y-1">
                        {[...Array(20)].map((_, i) => (
                            <UserListItemSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className={`space-y-1 transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-4 group"
                            >
                              <Avatar
                                className="h-9 w-9 border cursor-pointer transition-transform transition-shadow
                                 hover:scale-105 hover:shadow-md"
                                onClick={() => handleViewUserProfile(user.id)}
                              >
                                <AvatarImage src={user.profilePictureUrl} />
                                <AvatarFallback>
                                  {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>


                              <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm truncate">{user.name}</h4>
                                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] px-1.5 py-0 h-5 font-normal">
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
                            <EmptyState
                                title="No users found"
                                description="Try adjusting your search terms."
                                className="py-12 border-none bg-transparent"
                            />

                        )}
                        {users.length > 0 && (
                            <SmartPagination
                                currentPage={page + 1}
                                totalPages={totalPages || 0}
                                onPageChange={(p) => setPage(p - 1)}
                                className="mt-4 border-t pt-4"
                            />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (isTabbed) {
        return content;
    }

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {content}
            </div>
        </AnimatedPage>
    );
}
