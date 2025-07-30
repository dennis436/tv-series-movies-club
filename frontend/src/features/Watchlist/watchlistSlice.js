// src/features/Watchlist/watchlistSlice.js

import { createSlice } from '@reduxjs/toolkit';

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    movies: [],
  },
  reducers: {
    addToWatchlist: (state, action) => {
      const movie = action.payload;
      const exists = state.movies.some((m) => m.id === movie.id);
      if (!exists) {
        state.movies.push({
          ...movie,
          status: 'planned', // default status when adding
        });
      }
    },
    removeFromWatchlist: (state, action) => {
      state.movies = state.movies.filter(movie => movie.id !== action.payload);
    },
    toggleWatchedStatus: (state, action) => {
      const movie = state.movies.find((m) => m.id === action.payload);
      if (movie) {
        movie.status = movie.status === 'watched' ? 'planned' : 'watched';
      }
    },
  },
});

export const {
  addToWatchlist,
  removeFromWatchlist,
  toggleWatchedStatus,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;