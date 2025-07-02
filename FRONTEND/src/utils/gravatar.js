import CryptoJS from 'crypto-js';

/**
 * Generate Gravatar URL from email address
 * @param {string} email - User's email address
 * @param {object} options - Gravatar options
 * @param {number} options.size - Image size (default: 200)
 * @param {string} options.default - Default image type (default: 'identicon')
 * @param {string} options.rating - Content rating (default: 'pg')
 * @returns {string} Gravatar URL
 */
export const generateGravatarUrl = (email, options = {}) => {
  const {
    size = 200,
    default: defaultImage = 'identicon',
    rating = 'pg'
  } = options;

  if (!email) {
    return `https://ui-avatars.com/api/?name=User&size=${size}&background=6366f1&color=ffffff`;
  }

  // Normalize email: trim whitespace and convert to lowercase
  const normalizedEmail = email.trim().toLowerCase();
  
  // Create MD5 hash of the email
  const hash = CryptoJS.MD5(normalizedEmail).toString();
  
  // Build Gravatar URL with parameters
  const params = new URLSearchParams({
    s: size.toString(),
    d: defaultImage,
    r: rating
  });
  
  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
};

/**
 * Gravatar default image options:
 * - '404': Return 404 if no image found
 * - 'mp': Mystery person (simple cartoon-style silhouette)
 * - 'identicon': Geometric pattern based on email hash
 * - 'monsterid': Generated monster with different colors, faces, etc
 * - 'wavatar': Generated faces with differing features and backgrounds
 * - 'retro': 8-bit arcade-style pixelated faces
 * - 'robohash': Generated robot with different colors, faces, etc
 * - 'blank': Transparent PNG image
 */

/**
 * Get user avatar with Gravatar fallback
 * @param {object} user - User object with email and optional avatar
 * @param {object} options - Gravatar options
 * @returns {string} Avatar URL
 */
export const getUserAvatar = (user, options = {}) => {
  // If user has custom avatar, use it
  if (user?.avatar && user.avatar !== '') {
    return user.avatar;
  }
  
  // Otherwise, generate Gravatar URL
  if (user?.email) {
    return generateGravatarUrl(user.email, options);
  }
  
  // Fallback to UI Avatars with username
  const name = user?.username || user?.name || 'User';
  const size = options.size || 200;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=6366f1&color=ffffff`;
};

/**
 * Check if Gravatar exists for email
 * @param {string} email - User's email address
 * @returns {Promise<boolean>} True if Gravatar exists
 */
export const checkGravatarExists = async (email) => {
  try {
    const gravatarUrl = generateGravatarUrl(email, { default: '404' });
    const response = await fetch(gravatarUrl, { method: 'HEAD' });
    return response.status === 200;
  } catch (error) {
    console.error('Error checking Gravatar:', error);
    return false;
  }
};

/**
 * Gravatar profile URL
 * @param {string} email - User's email address
 * @returns {string} Gravatar profile URL
 */
export const getGravatarProfileUrl = (email) => {
  if (!email) return null;
  
  const normalizedEmail = email.trim().toLowerCase();
  const hash = CryptoJS.MD5(normalizedEmail).toString();
  return `https://gravatar.com/${hash}`;
};
