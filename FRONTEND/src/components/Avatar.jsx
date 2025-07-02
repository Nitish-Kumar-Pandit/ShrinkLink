import React, { useState } from 'react';
import { getUserAvatar } from '../utils/gravatar';

/**
 * Avatar component that displays user avatar with Gravatar fallback
 */
const Avatar = ({ 
  user, 
  size = 40, 
  className = '', 
  showTooltip = false,
  gravatarOptions = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine avatar URL
  const getAvatarUrl = () => {
    return getUserAvatar(user, {
      size: size * 2, // Use 2x size for retina displays
      default: 'identicon',
      ...gravatarOptions
    });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const avatarElement = (
    <div className={`relative inline-block ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"
          style={avatarStyle}
        />
      )}
      <img
        src={getAvatarUrl()}
        alt={user?.username || 'User avatar'}
        className={`rounded-full object-cover border-2 border-gray-200 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={avatarStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {/* Online indicator (optional) */}
      {user?.isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && user?.username) {
    return (
      <div className="group relative">
        {avatarElement}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {user.username}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return avatarElement;
};

/**
 * Avatar group component for displaying multiple avatars
 */
export const AvatarGroup = ({ users = [], maxDisplay = 3, size = 32, className = '' }) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          user={user}
          size={size}
          className="ring-2 ring-white"
          showTooltip={true}
        />
      ))}
      {remainingCount > 0 && (
        <div 
          className="flex items-center justify-center bg-gray-500 text-white text-xs font-medium rounded-full ring-2 ring-white"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
