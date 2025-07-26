import axiosInstance from "../utils/axiosInstance";

export const loginUser = async (email, password) => {
    const {data} = await axiosInstance.post("/api/auth/login", {email, password})
    return data;
}
export const registerUser = async (name, email, password) => {
    const {data} = await axiosInstance.post("/api/auth/register", {name, email, password})
    return data;
}
export const logoutUser = async () => {
    const {data} = await axiosInstance.post("/api/auth/logout")
    return data;
}

export const getCurrentUser = async () => {
    try {
        const {data} = await axiosInstance.get("/api/auth/me")
        return data;
    } catch (error) {
        // If axios fails, try with fetch and Authorization header
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/api/auth/me` : '/api/auth/me';

        const headers = {};
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get current user');
        }

        return await response.json();
    }
}