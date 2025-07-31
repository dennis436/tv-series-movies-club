import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toggleLike, addComment, deleteComment } from '../clubs/clubSlice';
import { resetWatchlistState } from '../Watchlist/watchlistSlice'; // Import resetWatchlistState

const API_URL = 'http://127.0.0.1:5000'; // Base URL for your backend API

// --- Async Thunks ---
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error during registration');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }
      if (data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
      }
      dispatch(resetWatchlistState()); // Dispatch resetWatchlistState on successful login
      return { ...data, id: data.user_id };
    } catch (error) {
      console.error("loginUser Thunk: Catch block error:", error);
      return rejectWithValue(error.message || 'Network error during login');
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return rejectWithValue('No token found');

      const response = await fetch(`${API_URL}/auth/check_session`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        localStorage.removeItem('jwt_token');
        return rejectWithValue(data.message || 'Session invalid');
      }
      dispatch(resetWatchlistState()); // Dispatch resetWatchlistState on successful session check
      return { ...data, id: data.user_id };
    } catch (error) {
      localStorage.removeItem('jwt_token');
      return rejectWithValue(error.message || 'Network error during session check');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication required to fetch profile.');
      }
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user profile');
      }
      return { ...data, id: data.id || data.user_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication required to update profile.');
      }
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update user profile');
      }
      return { ...data, id: data.id || data.user_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error updating user profile');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'auth/fetchUserPosts',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch user posts');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching user posts');
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'auth/fetchFollowing',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/following`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch following list');
      }
      return data.map(user => ({ id: user.id, username: user.username }));
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching following list');
    }
  }
);

export const followUser = createAsyncThunk(
  'auth/followUser',
  async (userIdToFollow, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userIdToFollow}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to follow user');
      }
      return { id: userIdToFollow, username: data.username || 'Unknown' };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error following user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'auth/unfollowUser',
  async (userIdToUnfollow, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userIdToUnfollow}/unfollow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        console.warn(`Unfollow API returned error for user ${userIdToUnfollow}: ${data.message}`);
        return rejectWithValue(data.message || 'Failed to unfollow user');
      }
      return userIdToUnfollow;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error unfollowing user');
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'auth/fetchFollowers',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('jwt_token');
      if (!token) {
        return rejectWithValue('Authentication token missing.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/followers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch followers list');
      }
      return data.map(user => ({ id: user.id, username: user.username }));
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching followers list');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to send password reset email.');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error during password reset request.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('jwt_token') || null,
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    isLoading: false,
    error: null,
    userPosts: [],
    isUserPostsLoading: false,
    hasFetchedUserPosts: false,
    following: [],
    isFollowingLoading: false,
    followingError: null,
    hasFetchedFollowing: false,
    followers: [],
    isFollowersLoading: false,
    followersError: null,
    hasFetchedFollowers: false,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.userPosts = [];
      state.isUserPostsLoading = false;
      state.hasFetchedUserPosts = false;
      state.following = [];
      state.isFollowingLoading = false;
      state.followingError = null;
      state.hasFetchedFollowing = false;
      state.followers = [];
      state.isFollowersLoading = false;
      state.followersError = null;
      state.hasFetchedFollowers = false;
      // The resetWatchlistState will be dispatched from the component that calls logout
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = { ...action.payload, id: action.payload.user_id || action.payload.id };
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; state.error = null; state.hasFetchedUserPosts = true; state.hasFetchedFollowing = true; state.hasFetchedFollowers = true; })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.hasFetchedUserPosts = false;
        state.hasFetchedFollowing = false;
        state.hasFetchedFollowers = false;
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; state.user = null; state.token = null; state.isAuthenticated = false; })

      .addCase(checkSession.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload, id: action.payload.user_id };
        state.token = localStorage.getItem('jwt_token');
        state.isAuthenticated = true;
        state.hasFetchedUserPosts = false;
        state.hasFetchedFollowing = false;
        state.hasFetchedFollowers = false;
      })
      .addCase(checkSession.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; state.user = null; state.token = null; state.isAuthenticated = false; })

      .addCase(fetchUserProfile.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => { state.isLoading = false; state.user = { ...action.payload, id: action.payload.id || action.payload.user_id }; })
      .addCase(fetchUserProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(updateUserProfile.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateUserProfile.fulfilled, (state, action) => { state.isLoading = false; state.user = { ...action.payload, id: action.payload.id || action.payload.user_id }; })
      .addCase(updateUserProfile.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(fetchUserPosts.pending, (state) => { state.isUserPostsLoading = true; state.error = null; })
      .addCase(fetchUserPosts.fulfilled, (state, action) => { state.isUserPostsLoading = false; state.userPosts = action.payload; state.hasFetchedUserPosts = true; })
      .addCase(fetchUserPosts.rejected, (state, action) => { state.isUserPostsLoading = false; state.error = action.payload; state.hasFetchedUserPosts = true; })

      .addCase(fetchFollowing.pending, (state) => { state.isFollowingLoading = true; state.followingError = null; })
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.isFollowingLoading = false; state.following = action.payload; state.hasFetchedFollowing = true; })
      .addCase(fetchFollowing.rejected, (state, action) => { state.isFollowingLoading = false; state.followingError = action.payload; state.following = []; state.hasFetchedFollowing = true; })

      .addCase(followUser.pending, (state) => { state.error = null; })
      .addCase(followUser.fulfilled, (state, action) => {
        const newFollowedUser = action.payload;
        if (!state.following.some(u => u.id === newFollowedUser.id)) { state.following = [...state.following, newFollowedUser]; }
      })
      .addCase(followUser.rejected, (state, action) => { state.error = action.payload; })

      .addCase(unfollowUser.pending, (state) => { state.error = null; })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const unfollowedUserId = action.payload;
        state.following = state.following.filter(user => user.id !== unfollowedUserId);
      })
      .addCase(unfollowUser.rejected, (state, action) => { state.error = action.payload; })

      .addCase(fetchFollowers.pending, (state) => { state.isFollowersLoading = true; state.followersError = null; })
      .addCase(fetchFollowers.fulfilled, (state, action) => { state.isFollowersLoading = false; state.followers = action.payload; state.hasFetchedFollowers = true; })
      .addCase(fetchFollowers.rejected, (state, action) => { state.isFollowersLoading = false; state.followersError = action.payload; state.followers = []; state.hasFetchedFollowers = true; })

      .addCase(forgotPassword.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => { state.isLoading = false; state.error = null; })
      .addCase(forgotPassword.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes_count, liked, currentUserId, currentUserUsername } = action.payload;
        state.userPosts = state.userPosts.map(post => {
          if (post.id === postId) {
            let updatedLikes = post.likes ? [...post.likes] : [];
            if (liked) {
              if (!updatedLikes.some(like => like.user_id === currentUserId)) {
                updatedLikes.push({ user_id: currentUserId, username: currentUserUsername || 'Unknown' });
              }
            } else {
              updatedLikes = updatedLikes.filter(like => like.user_id !== currentUserId);
            }
            return {
              ...post,
              likes_count: likes_count,
              likes: updatedLikes
            };
          }
          return post;
        });
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state.userPosts = state.userPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), comment],
            };
          }
          return post;
        });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        state.userPosts = state.userPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId)
            };
          }
          return post;
        });
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
