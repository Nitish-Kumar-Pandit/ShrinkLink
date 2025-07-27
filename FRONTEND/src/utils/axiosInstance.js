import axios from "axios";

// API Base URL Configuration
// For separate backend/frontend deployment on Render
const getBaseURL = () => {
    // If VITE_API_URL is explicitly set, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In production, use the backend service URL
    if (import.meta.env.PROD) {
        // This will be set during build or runtime
        return import.meta.env.VITE_BACKEND_URL || '';
    }

    // In development, use local backend
    return "http://localhost:5000";
};

const baseURL = getBaseURL();

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
            console.log(`🔧 Base URL: ${baseURL}`);
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