import apiClient from "./api/apiClient";

export const paymentService = {
  createSlotOrder: async () => {
    const response = await apiClient.post("/payments/create-slot-order");
    return response.data;
  },

  createPlanOrder: async () => {
    const response = await apiClient.post("/payments/create-plan-order");
    return response.data;
  },

  verifyPayment: async (paymentDetails: any) => {
    const response = await apiClient.post("/payments/verify", paymentDetails);
    return response.data;
  }
};
