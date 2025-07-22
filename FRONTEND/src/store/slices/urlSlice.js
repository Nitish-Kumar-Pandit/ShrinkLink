import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for creating short URL
export const createShortUrl = createAsyncThunk(
  'url/createShortUrl',
  async ({ url, customSlug, expiration }, { rejectWithValue }) => {
    try {
      // Prepare the request body - rename customSlug to slug for backend compatibility
      const requestBody = { url };
      if (customSlug) {
        requestBody.slug = customSlug;
      }
      if (expiration) {
        requestBody.expiration = expiration;
      }

      const response = await fetch('/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create short URL');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for getting user's URLs
export const getUserUrls = createAsyncThunk(
  'url/getUserUrls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/urls', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch URLs');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for getting user stats
export const getUserStats = createAsyncThunk(
  'url/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch stats');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for fetching real anonymous usage from backend
export const fetchAnonymousUsage = createAsyncThunk(
  'url/fetchAnonymousUsage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/create/anonymous-usage', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch anonymous usage');
      }

      return data.usage;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for toggling favorite status
export const toggleFavorite = createAsyncThunk(
  'url/toggleFavorite',
  async (urlId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/create/favorite/${urlId}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to toggle favorite');
      }

      return { urlId, isFavorite: data.isFavorite };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Migration: Load anonymous usage with date checking
const loadInitialAnonymousUsage = () => {
  const saved = localStorage.getItem('anonymousLinksCreated');
  const savedDate = localStorage.getItem('anonymousLinksDate');
  const today = new Date().toDateString();

  if (saved && savedDate) {
    // Check if the saved date is different from today
    if (savedDate !== today) {
      // Date has changed, reset the count
      localStorage.setItem('anonymousLinksCreated', '0');
      localStorage.setItem('anonymousLinksDate', today);
      return 0;
    } else {
      // Same date, load the saved count
      const savedCount = parseInt(saved, 10) || 0;
      // If saved count exceeds new limit, reset it
      if (savedCount > 3) {
        localStorage.setItem('anonymousLinksCreated', '0');
        return 0;
      }
      return savedCount;
    }
  } else {
    // No saved data or missing date, initialize with current date
    const count = parseInt(saved, 10) || 0;
    localStorage.setItem('anonymousLinksDate', today);
    return count > 3 ? 0 : count;
  }
};

const initialState = {
  urls: [],
  currentShortUrl: null,
  isLoading: false,
  error: null, // For URL loading errors
  createError: null, // For URL creation errors
  stats: {
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    expiredUrls: 0,
    expiringUrls: 0,
    clickRate: 0,
    avgClicksPerUrl: 0,
    clickedUrls: 0
  },
  anonymousUsage: {
    linksCreated: loadInitialAnonymousUsage(),
    maxLinks: 3,
  },
};

const urlSlice = createSlice({
  name: 'url',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    setCreateError: (state, action) => {
      state.createError = action.payload;
    },
    clearAllErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearCurrentUrl: (state) => {
      state.currentShortUrl = null;
    },
    addUrl: (state, action) => {
      state.urls.unshift(action.payload);
      state.stats.totalUrls += 1;
    },
    updateUrlStats: (state, action) => {
      const { urlId, clicks } = action.payload;
      const url = state.urls.find(u => u.id === urlId);
      if (url) {
        const oldClicks = url.clicks;
        url.clicks = clicks;
        // Update total clicks in stats
        if (state.stats) {
          state.stats.totalClicks = state.stats.totalClicks - oldClicks + clicks;
        }
      }
    },
    incrementAnonymousUsage: (state) => {
      state.anonymousUsage.linksCreated += 1;
      const today = new Date().toDateString();
      // Save to localStorage with current date
      localStorage.setItem('anonymousLinksCreated', state.anonymousUsage.linksCreated.toString());
      localStorage.setItem('anonymousLinksDate', today);
    },
    loadAnonymousUsage: (state) => {
      const saved = localStorage.getItem('anonymousLinksCreated');
      const savedDate = localStorage.getItem('anonymousLinksDate');
      const today = new Date().toDateString(); // Get current date as string (e.g., "Thu Jul 04 2025")

      if (saved && savedDate) {
        // Check if the saved date is different from today
        if (savedDate !== today) {
          // Date has changed, reset the count
          state.anonymousUsage.linksCreated = 0;
          localStorage.setItem('anonymousLinksCreated', '0');
          localStorage.setItem('anonymousLinksDate', today);
        } else {
          // Same date, load the saved count
          const savedCount = parseInt(saved, 10) || 0;
          // If saved count exceeds new limit, reset it
          if (savedCount > state.anonymousUsage.maxLinks) {
            state.anonymousUsage.linksCreated = 0;
            localStorage.setItem('anonymousLinksCreated', '0');
          } else {
            state.anonymousUsage.linksCreated = savedCount;
          }
        }
      } else {
        // No saved data or missing date, initialize with current date
        state.anonymousUsage.linksCreated = parseInt(saved, 10) || 0;
        localStorage.setItem('anonymousLinksDate', today);
      }
    },
    resetAnonymousUsage: (state) => {
      state.anonymousUsage.linksCreated = 0;
      localStorage.removeItem('anonymousLinksCreated');
      localStorage.removeItem('anonymousLinksDate');
    },
    refreshAllAnonymousLinks: (state) => {
      // Reset all anonymous usage tracking
      state.anonymousUsage.linksCreated = 0;
      localStorage.removeItem('anonymousLinksCreated');
      localStorage.removeItem('anonymousLinksDate');
      // Clear current short URL if it exists
      state.currentShortUrl = null;
    },
    forceResetAnonymousUsage: (state) => {
      // Force reset to ensure proper sync with new limits
      state.anonymousUsage.linksCreated = 0;
      localStorage.removeItem('anonymousLinksCreated');
      localStorage.removeItem('anonymousLinksDate');
      // Also clear current short URL to start fresh
      state.currentShortUrl = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create short URL cases
      .addCase(createShortUrl.pending, (state) => {
        state.isLoading = true;
        state.createError = null;
      })
      .addCase(createShortUrl.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShortUrl = action.payload.shortUrl;
        // Note: URLs list will be refreshed by getUserUrls action after creation
        state.createError = null;
      })
      .addCase(createShortUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.createError = action.payload;
      })
      // Get user URLs cases
      .addCase(getUserUrls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserUrls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls = action.payload.urls || [];
        state.stats = action.payload.stats || state.stats;
        state.error = null;
      })
      .addCase(getUserUrls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user stats cases
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats || state.stats;
        state.error = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Toggle favorite cases
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { urlId, isFavorite } = action.payload;
        const url = state.urls.find(url => url.id === urlId);
        if (url) {
          url.isFavorite = isFavorite;
        }
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch anonymous usage cases
      .addCase(fetchAnonymousUsage.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAnonymousUsage.fulfilled, (state, action) => {
        state.anonymousUsage.linksCreated = action.payload.current;
        state.anonymousUsage.maxLinks = action.payload.limit;
        state.error = null;
      })
      .addCase(fetchAnonymousUsage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCreateError,
  setCreateError,
  clearAllErrors,
  clearCurrentUrl,
  addUrl,
  updateUrlStats,
  incrementAnonymousUsage,
  loadAnonymousUsage,
  resetAnonymousUsage,
  refreshAllAnonymousLinks,
  forceResetAnonymousUsage
} = urlSlice.actions;
export default urlSlice.reducer;
