import axios from "axios";

// Use environment variable or fallback to local development
// In production, VITE_API_URL will be empty, so we use relative paths
const baseURL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "" : "http://localhost:3000");

// Export the base URL for use in fetch requests
export const getApiBaseUrl = () => baseURL;

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging and auth
axiosInstance.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }

        // Add Authorization header if token exists
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
        }

        // Clear token on 401 errors
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;