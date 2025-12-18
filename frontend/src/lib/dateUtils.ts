import { formatDistanceToNow, format } from 'date-fns';

/**
 * Parses a date string as UTC.
 * If the string does not end with 'Z' and doesn't have an offset, it appends 'Z'.
 */
export const parseAsUTC = (dateString: string | undefined | null): Date => {
    if (!dateString) {
        throw new Error('parseAsUTC called with falsy value. Use wrappers like formatDistanceToNowUTC to safely handle optional dates.');
    }

    let dateToParse = dateString;
    if (dateToParse.includes('T') && !dateToParse.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(dateToParse)) {
        dateToParse += 'Z';
    }

    return new Date(dateToParse);
};

export const formatDistanceToNowUTC = (dateString: string | undefined, options?: { addSuffix?: boolean }) => {
    if (!dateString) return '';
    const date = parseAsUTC(dateString);
    return formatDistanceToNow(date, options);
};

export const formatDate = (date: string | Date | undefined, formatStr: string = 'PP') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseAsUTC(date) : date;
    return format(dateObj, formatStr);
};
