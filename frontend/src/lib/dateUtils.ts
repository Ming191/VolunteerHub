import { formatDistanceToNow, format } from 'date-fns';

/**
 * Parses a date string as UTC.
 * If the string does not end with 'Z' and doesn't have an offset, it appends 'Z'.
 */
export const parseAsUTC = (dateString: string | undefined | null): Date => {
    if (!dateString) {
        throw new Error('parseAsUTC called with falsy value. Use wrappers like formatDistanceToNowUTC to safely handle optional dates.');
    }

    // If string already has Z or timezone offset, use as-is
    // Regex checks for 'Z' or timezone offset (e.g., +05:00, -03:00, +0530) at the end
    const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(dateString);
    
    let dateToParse = dateString;
    // If it's an ISO format (has 'T') without timezone info, append 'Z' to parse as UTC
    if (dateString.includes('T') && !hasTimezone) {
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

/**
 * Checks if an event has ended based on its end date/time
 */
export const isEventEnded = (endDateTime: string | undefined): boolean => {
    if (!endDateTime) return false;
    const endDate = parseAsUTC(endDateTime);
    return endDate.getTime() < Date.now();
};

/**
 * Checks if registration is closed based on the registration deadline
 */
export const isRegistrationClosed = (registrationDeadline: string | undefined): boolean => {
    if (!registrationDeadline) return false;
    const deadline = parseAsUTC(registrationDeadline);
    return deadline.getTime() <= Date.now();
};

