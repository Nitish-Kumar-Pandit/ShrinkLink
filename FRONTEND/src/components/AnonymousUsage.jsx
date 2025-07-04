import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { fetchAnonymousUsage } from '../store/slices/urlSlice.js';

const AnonymousUsage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { anonymousUsage } = useSelector((state) => state.url);
  const navigate = useNavigate();

  // Load anonymous usage from backend on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(fetchAnonymousUsage());
    }
  }, [dispatch, isAuthenticated]);

  // Calculate usage directly from Redux state
  const usage = {
    current: anonymousUsage.linksCreated,
    limit: anonymousUsage.maxLinks,
    remaining: Math.max(0, anonymousUsage.maxLinks - anonymousUsage.linksCreated)
  };

  // Don't show anything for authenticated users
  if (isAuthenticated) {
    return null;
  }

  const handleSignInClick = () => {
    navigate({ to: '/auth' });
  };



  return (
    <div className="bg-gradient-to-r from-gray-900/5 to-gray-800/5 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 mb-6">
      <div className="text-center">
        <div className="text-gray-600 text-sm mb-1">
          Anonymous usage: {usage.current}/{usage.limit} links
        </div>
        <div className="text-xs text-gray-500 mb-3">
          <button
            onClick={handleSignInClick}
            className="underline cursor-pointer"
          >
            Sign in
          </button>
          {' '}to remove limits and unlock more features
        </div>
      </div>

      {usage.remaining <= 1 && (
        <div className="mt-2 text-xs text-orange-600 text-center">
          {usage.remaining === 0
            ? (
              <>
                You've reached your limit!{' '}
                <button
                  onClick={handleSignInClick}
                  className="underline cursor-pointer"
                >
                  Sign in
                </button>
                {' '}to create more links.
              </>
            )
            : `Only ${usage.remaining} link${usage.remaining === 1 ? '' : 's'} remaining.`
          }
        </div>
      )}


    </div>
  );
};

export default AnonymousUsage;
