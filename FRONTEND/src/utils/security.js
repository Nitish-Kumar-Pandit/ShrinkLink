// Security utilities for frontend

// XSS protection - sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate URL format
export const isValidUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Check for suspicious URLs
export const isSuspiciousUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Block common malicious patterns
    const suspiciousPatterns = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', // Other URL shorteners
      'localhost', '127.0.0.1', '0.0.0.0', // Local addresses
      'file://', 'ftp://', 'data:', 'javascript:', // Dangerous protocols
    ];
    
    return suspiciousPatterns.some(pattern => 
      hostname.includes(pattern) || url.toLowerCase().includes(pattern)
    );
  } catch {
    return true; // Invalid URLs are suspicious
  }
};

// Validate custom slug
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  
  // Check length
  if (slug.length < 3 || slug.length > 50) return false;
  
  // Check format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return false;
  
  // Check for reserved words
  const reserved = ['api', 'admin', 'www', 'mail', 'ftp', 'localhost', 'health', 'auth', 'create', 'urls'];
  if (reserved.includes(slug.toLowerCase())) return false;
  
  return true;
};

// Rate limiting for client-side
class ClientRateLimit {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  isAllowed() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if under limit
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
  
  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
    
    return Math.max(0, timeUntilReset);
  }
}

// Create rate limiter instances
export const urlCreationLimiter = new ClientRateLimit(5, 60000); // 5 requests per minute
export const authLimiter = new ClientRateLimit(3, 300000); // 3 requests per 5 minutes

// Content Security Policy helpers
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure storage helpers
export const secureStorage = {
  set: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// CSRF protection
export const generateCSRFToken = () => {
  return generateNonce();
};

// Input validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 128) return false;
  
  // Check for required character types
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  
  return hasLower && hasUpper && hasNumber && hasSpecial;
};

export const validateUsername = (username) => {
  if (!username || username.length < 2 || username.length > 50) return false;
  return /^[a-zA-Z\s]+$/.test(username);
};

// Security headers check (for development)
export const checkSecurityHeaders = async () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    const response = await fetch('/health', { method: 'HEAD' });
    const headers = response.headers;
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy'
    ];
    
    const missing = securityHeaders.filter(header => !headers.get(header));
    
    if (missing.length > 0) {
      console.warn('Missing security headers:', missing);
    }
  } catch (error) {
    console.error('Failed to check security headers:', error);
  }
};
