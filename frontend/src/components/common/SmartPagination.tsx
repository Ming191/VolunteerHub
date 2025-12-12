import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal } from "lucide-react";

interface SmartPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const SmartPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className
}: SmartPaginationProps) => {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) {
                pages.push('ellipsis');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('ellipsis');
            }

            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <Pagination className={className}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                                onPageChange(currentPage - 1);
                            }
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                        aria-disabled={currentPage <= 1}
                    />
                </PaginationItem>

                {generatePages().map((pageNum, index) => {
                    if (pageNum === 'ellipsis') {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <span className="flex h-9 w-9 items-center justify-center">
                                    <MoreHorizontal className="h-4 w-4" />
                                </span>
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={pageNum}>
                            <PaginationLink
                                href="#"
                                isActive={currentPage === pageNum}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(pageNum);
                                }}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                                onPageChange(currentPage + 1);
                            }
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                        aria-disabled={currentPage >= totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
