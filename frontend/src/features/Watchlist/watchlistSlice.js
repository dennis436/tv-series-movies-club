import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://127.0.0.1:5000'; // Base URL for your backend API

// Async Thunk for adding an item to the watchlist
export const addToWatchlist = createAsyncThunk(
  'watchlist/addToWatchlist',
  async ({ movie_id, movie_title, genre, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id; // Get current user ID
      if (!token || !userId) {
        return rejectWithValue('Authentication required to add to watchlist.');
      }

      const response = await fetch(`${API_URL}/users/${userId}/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_id, movie_title, genre, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to add to watchlist');
      }
      return data; // Return the added watchlist item
    } catch (error) {
      return rejectWithValue(error.message || 'Network error adding to watchlist');
    }
  }
);

// Async Thunk for fetching a user's watchlist
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('Authentication required to fetch watchlist.');
      }

      const response = await fetch(`${API_URL}/users/${userId}/watchlist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch watchlist');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching watchlist');
    }
  }
);

// Async Thunk for updating an item in the watchlist
export const updateWatchlistItem = createAsyncThunk(
  'watchlist/updateWatchlistItem',
  async ({ watchlist_item_id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) {
        return rejectWithValue('Authentication required to update watchlist.');
      }

      const response = await fetch(`${API_URL}/users/${userId}/watchlist/${watchlist_item_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update watchlist item');
      }
      return data; // Return the updated watchlist item
    } catch (error) {
      return rejectWithValue(error.message || 'Network error updating watchlist item');
    }
  }
);

// Async Thunk for deleting an item from the watchlist
export const deleteWatchlistItem = createAsyncThunk(
  'watchlist/deleteWatchlistItem',
  async (watchlist_item_id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) {
        return rejectWithValue('Authentication required to delete watchlist item.');
      }

      const response = await fetch(`${API_URL}/users/${userId}/watchlist/${watchlist_item_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete watchlist item');
      }
      return watchlist_item_id; // Return the ID of the deleted item
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting watchlist item');
    }
  }
);


const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    items: [], // This is where the watchlist data is stored
    isLoading: false,
    error: null,
    hasFetched: false, // Flag to prevent multiple fetches on component mount
  },
  reducers: {
    clearWatchlistError: (state) => {
      state.error = null;
    },
    resetWatchlistState: (state) => {
      state.items = [];
      state.isLoading = false;
      state.error = null;
      state.hasFetched = false; // Reset hasFetched to force a new fetch
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to Watchlist
      .addCase(addToWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure no duplicates before adding (backend should also handle this)
        if (!state.items.some(item => item.movie_id === action.payload.movie_id)) { // Check movie_id for uniqueness
          state.items.push(action.payload);
        }
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetched = true; // Set to true even on error to prevent re-fetch loop
      })
      // Update Watchlist Item
      .addCase(updateWatchlistItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWatchlistItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateWatchlistItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Watchlist Item
      .addCase(deleteWatchlistItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWatchlistItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteWatchlistItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWatchlistError, resetWatchlistState } = watchlistSlice.actions;
export default watchlistSlice.reducer;
