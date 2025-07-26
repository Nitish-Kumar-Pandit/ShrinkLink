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

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;