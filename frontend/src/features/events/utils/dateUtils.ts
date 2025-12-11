import { format } from 'date-fns';

export const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), 'PPP');
    } catch {
        return dateString;
    }
};

export const formatTime = (dateString: string) => {
    try {
        return format(new Date(dateString), 'p');
    } catch {
        return dateString;
    }
};
