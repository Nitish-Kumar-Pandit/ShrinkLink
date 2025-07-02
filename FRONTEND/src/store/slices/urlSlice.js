import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for creating short URL
export const createShortUrl = createAsyncThunk(
  'url/createShortUrl',
  async ({ url, customSlug }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url, customSlug }),
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

const initialState = {
  urls: [],
  currentShortUrl: null,
  isLoading: false,
  error: null,
  stats: {
    totalUrls: 0,
    totalClicks: 0,
  },
};

const urlSlice = createSlice({
  name: 'url',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        url.clicks = clicks;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create short URL cases
      .addCase(createShortUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createShortUrl.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShortUrl = action.payload.shortUrl;
        state.urls.unshift(action.payload);
        state.stats.totalUrls += 1;
        state.error = null;
      })
      .addCase(createShortUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
      });
  },
});

export const { clearError, clearCurrentUrl, addUrl, updateUrlStats } = urlSlice.actions;
export default urlSlice.reducer;
