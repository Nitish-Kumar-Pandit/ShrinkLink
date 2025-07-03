import React, { useState } from 'react';
import { getCurrentUser } from '../api/user.api';

const AuthTest = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
      
      <button
        onClick={testAuth}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {user && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <h3 className="font-bold">User Info:</h3>
          <p>ID: {user._id}</p>
          <p>Name: {user.username}</p>
          <p>Email: {user.email}</p>
          <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full mt-2" />
        </div>
      )}
    </div>
  );
};

export default AuthTest;
