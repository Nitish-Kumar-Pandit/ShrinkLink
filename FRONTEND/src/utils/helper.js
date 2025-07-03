
import { getCurrentUser } from "../api/user.api.js";
import { setUser } from "./../store/slices/authSlice.js";
import { redirect } from "@tanstack/react-router";

export const checkAuth = async ({ context }) => {
  try {
    const { queryClient, store } = context;
    const response = await queryClient.ensureQueryData({
      queryKey: ["currentUser"],
      queryFn: getCurrentUser,
    });

    if(!response || !response.user) {
      throw new Error("No user found");
    }

    store.dispatch(setUser(response.user));
    const {isAuthenticated} = store.getState().auth;
    if(!isAuthenticated) {
      throw new Error("Authentication failed");
    }
    return true;

  } catch (error) {
    // Redirect to login if unauthorized
    throw redirect({ to: "/auth" });
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
