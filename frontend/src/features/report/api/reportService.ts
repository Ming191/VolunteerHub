import axiosInstance from '@/utils/axiosInstance';

export type ReportType = 'POST' | 'COMMENT';
export type ReportReason =
    | 'SPAM'
    | 'HARASSMENT'
    | 'HATE_SPEECH'
    | 'INAPPROPRIATE_CONTENT'
    | 'MISINFORMATION'
    | 'VIOLENCE'
    | 'OTHER';

export interface ReportRequest {
    type: ReportType;
    targetId: number;
    reason: ReportReason;
    description?: string;
}

export const reportService = {
    submitReport: async (request: ReportRequest) => {
        const { data } = await axiosInstance.post('/api/reports', request);
        return data;
    },
};
