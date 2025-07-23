import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import clubReducer from './features/clubs/clubSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    clubs: clubReducer, 
    
  },
  
});

export default store;
