import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Inject Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn('Unauthorized! Logging out...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Optional: Redirect to login or refresh store
        // window.location.href = '/login';
      }
    }

    const errorMessage = (error.response?.data as any)?.error || error.message || 'An unexpected error occurred';
    console.error('API Error:', errorMessage);

    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default apiClient;
