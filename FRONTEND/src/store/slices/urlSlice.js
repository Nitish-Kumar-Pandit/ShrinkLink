import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for creating short URL
export const createShortUrl = createAsyncThunk(
  'url/createShortUrl',
  async ({ url, customSlug, expiration }, { rejectWithValue }) => {
    try {
      console.log('🚀 Frontend: Making API call to create short URL', { url, customSlug, expiration });

      // Prepare the request body - rename customSlug to slug for backend compatibility
      const requestBody = { url };
      if (customSlug) {
        requestBody.slug = customSlug;
      }
      if (expiration) {
        requestBody.expiration = expiration;
      }

      console.log('📤 Request body:', requestBody);

      const response = await fetch('http://localhost:3000/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        console.log('❌ API call failed:', data.message);
        return rejectWithValue(data.message || 'Failed to create short URL');
      }

      console.log('✅ API call successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Network error:', error);
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for getting user's URLs
export const getUserUrls = createAsyncThunk(
  'url/getUserUrls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/urls', {
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

// Async thunk for toggling favorite status
export const toggleFavorite = createAsyncThunk(
  'url/toggleFavorite',
  async (urlId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/create/favorite/${urlId}`, {
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

// Migration: Reset localStorage if it has old data with higher limits
const migrateAnonymousUsage = () => {
  const saved = localStorage.getItem('anonymousLinksCreated');
  if (saved) {
    const savedCount = parseInt(saved, 10) || 0;
    // If saved count is higher than new limit (3), completely reset it
    if (savedCount > 3) {
      localStorage.removeItem('anonymousLinksCreated');
      return 0;
    }
    return savedCount;
  }
  return 0;
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
  },
  anonymousUsage: {
    linksCreated: migrateAnonymousUsage(),
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
        console.log('✅ Redux: Setting currentShortUrl to:', action.payload.shortUrl);
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
