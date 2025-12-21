import {
  Configuration,
  RegistrationsApi,
  type RegistrationStatusResponse,
  type RegistrationResultResponse, UserProfileApi, type RegistrationResponse,
} from '@/api-client';
import axiosInstance from '@/utils/axiosInstance.ts';

const config = new Configuration({ basePath: '' });
const registrationsApi = new RegistrationsApi(config, undefined, axiosInstance);
const userProfileApi = new UserProfileApi(config, undefined, axiosInstance);

/**
 * Register for an event
 */
const registerForEvent = async (eventId: number): Promise<RegistrationResultResponse> => {
  try {
    const response = await registrationsApi.registerForEvent({ eventId });
    return response.data;
  } catch (error) {
    console.error('Failed to register for event:', error);
    throw error;
  }
};

/**
 * Check registration status for an event
 */
const getRegistrationStatus = async (eventId: number): Promise<RegistrationStatusResponse> => {
  try {
    const response = await registrationsApi.getRegistrationStatus({ eventId });
    return response.data;
  } catch (error) {
    console.error('Failed to get registration status:', error);
    throw error;
  }
};

/**
 * Get user's registrations with pagination
 */
const getMyRegistrationEvents = async (): Promise<Array<RegistrationResponse> | undefined> => {
  try {
    const res = await userProfileApi.getMyRegistrations(
      {
        pageable: {},
      } as any,
      {
        params: {
          page: 0,
          size: 100,
        },
      }
    );

    return res.data.content;
  } catch (err: any) {
    console.error('Failed to get my registrations:', {
      code: err.code,
      status: err.response?.status,
      data: err.response?.data,
    });
    throw err;
  }
};



/**
 * Cancel a registration
 */
const cancelRegistration = async (eventId: number): Promise<void> => {
  try {
    await registrationsApi.cancelRegistration({ eventId });
  } catch (error) {
    console.error('Failed to cancel registration:', error);
    throw error;
  }
};



export const registrationService = {
  registerForEvent,
  getRegistrationStatus,
  getMyRegistrationEvents,
  cancelRegistration
};
