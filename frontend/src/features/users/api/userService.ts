import axiosInstance from '@/utils/axiosInstance';
import {Configuration, type PublicUserResponse, UserApi} from "@/api-client";

const config = new Configuration({basePath: ''});
const userApi = new UserApi(config, undefined, axiosInstance);


export const userService = {
    getUserById: async (id: number): Promise<PublicUserResponse> => {
        const response = await userApi.getUserById({id});
        return response.data;
    }
};
