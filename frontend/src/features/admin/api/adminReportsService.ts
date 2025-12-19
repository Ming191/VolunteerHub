import {
    Configuration,
    AdminReportsApi,
    type ReportResponse,
    type ReportStatsResponse,
    ReportResponseTypeEnum,
    ReportResponseStatusEnum,
    type ReviewReportRequest
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

export type { ReportResponse, ReportStatsResponse, ReviewReportRequest };
export { ReportResponseTypeEnum, ReportResponseStatusEnum };

// Initialize API client
const config = new Configuration({ basePath: '' });
const adminReportsApi = new AdminReportsApi(config, '', axiosInstance);

// Extended interface to include deleteContent
export interface ExtendedReviewReportRequest extends ReviewReportRequest {
    deleteContent?: boolean;
}

export const adminReportsService = {
    getAllReports: async (params?: { status?: ReportResponseStatusEnum; page?: number; size?: number }) => {
        const response = await adminReportsApi.getAllReports({
            status: params?.status,
            page: params?.page,
            size: params?.size
        });
        return response.data;
    },

    getReportsForTarget: async (type: ReportResponseTypeEnum, targetId: number) => {
        const response = await adminReportsApi.getReportsForTarget({
            type,
            targetId
        });
        return response.data;
    },

    reviewReport: async (reportId: number, request: ExtendedReviewReportRequest) => {
        const response = await adminReportsApi.reviewReport({
            reportId,
            reviewReportRequest: request as ReviewReportRequest
        });
        return response.data;
    },

    getReportStats: async () => {
        const response = await adminReportsApi.getReportStats();
        return response.data;
    },
};
