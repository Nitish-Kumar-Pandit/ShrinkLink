import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logoutUser, clearError } from '../store/slices/authSlice';

const AuthStatus = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <div className="flex items-center justify-between">
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={handleClearError}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">Welcome, {user.username || user.name}!</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      Not authenticated
    </div>
  );
};

export default AuthStatus;
