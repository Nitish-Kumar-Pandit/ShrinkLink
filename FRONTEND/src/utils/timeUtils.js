/**
 * Utility functions for time and date formatting
 */

/**
 * Calculate time remaining until expiration
 * @param {string|Date} expiresAt - The expiration date
 * @returns {string|null} - Formatted time remaining string like "(6 days)" or "(4 hours)" or null if expired/invalid
 */
export const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null

  const now = new Date()
  const expiry = new Date(expiresAt)
  if (isNaN(expiry.getTime())) return null

  const diffMs = expiry.getTime() - now.getTime()
  
  // If already expired
  if (diffMs <= 0) return null

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `(${diffDays} day${diffDays === 1 ? '' : 's'})`
  } else if (diffHours > 0) {
    return `(${diffHours} hour${diffHours === 1 ? '' : 's'})`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `(${Math.max(1, diffMinutes)} minute${diffMinutes === 1 ? '' : 's'})`
  }
}

/**
 * Format expiration date for display
 * @param {string|Date} expiresAt - The expiration date
 * @returns {string|null} - Formatted date string like "Jul 17, 2025" or null if invalid
 */
export const formatExpirationDate = (expiresAt) => {
  if (!expiresAt) return null

  const date = new Date(expiresAt)
  if (isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format creation date for display
 * @param {string|Date} createdAt - The creation date
 * @returns {string|null} - Formatted date string like "Jul 3, 2025" or null if invalid
 */
export const formatDate = (createdAt) => {
  if (!createdAt) return null

  const date = new Date(createdAt)
  if (isNaN(date.getTime())) return null

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get a human-readable status description with time context
 * @param {string} status - The URL status ('active', 'expiring_soon', 'expired')
 * @param {string|Date} expiresAt - The expiration date
 * @returns {string} - Status description with time context
 */
export const getStatusWithTime = (status, expiresAt) => {
  const timeRemaining = getTimeRemaining(expiresAt)
  
  switch (status) {
    case 'expired':
      return 'Expired'
    case 'expiring_soon':
      return timeRemaining ? `Expiring Soon ${timeRemaining}` : 'Expiring Soon'
    case 'active':
    default:
      return timeRemaining ? `Active ${timeRemaining}` : 'Active'
  }
}
