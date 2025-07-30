// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import clubReducer from './features/clubs/clubSlice';
import watchlistReducer from './features/Watchlist/watchlistSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    clubs: clubReducer,
    watchlist: watchlistReducer,
  },
});

export default store;