import { formatDate as formatUTCDate } from '@/lib/dateUtils';

export const formatDate = (dateString: string) => {
    try {
        return formatUTCDate(dateString, 'PPP');
    } catch {
        return dateString;
    }
};

export const formatTime = (dateString: string) => {
    try {
        return formatUTCDate(dateString, 'p');
    } catch {
        return dateString;
    }
};
