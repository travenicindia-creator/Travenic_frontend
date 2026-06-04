import apiClient from './api/apiClient';
import { User } from './auth.service';

export interface UpgradeResponse {
  message: string;
  user: User;
}

export const subscriptionService = {
  upgrade: async (): Promise<UpgradeResponse> => {
    const response = await apiClient.post('/subscription/upgrade');
    return response.data;
  },
};
