import axios from "axios";

// Use environment variable or fallback to local development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

export default axiosInstance;