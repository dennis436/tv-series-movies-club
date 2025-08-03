import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout, fetchUserPosts } from '../auth/authSlice';

const API_URL = 'https://movie-clubb.onrender.com';


export const fetchAllClubs = createAsyncThunk(
  'clubs/fetchAllClubs',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/clubs/`, { headers });
      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch clubs');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching clubs');
    }
  }
);

export const fetchMyClubs = createAsyncThunk(
  'clubs/fetchMyClubs',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user?.id;
      if (!token || !userId) {
        return rejectWithValue('User not authenticated or ID missing. Cannot fetch user clubs.');
      }
      const response = await fetch(`${API_URL}/users/${userId}/clubs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch my clubs');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching my clubs');
    }
  }
);

export const joinClub = createAsyncThunk(
  'clubs/joinClub',
  async (clubId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to join a club.');

      const response = await fetch(`${API_URL}/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to join club');
      
      const fullClubDetails = await dispatch(fetchClubDetails(clubId)).unwrap();
      return fullClubDetails;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error joining club');
    }
  }
);

export const leaveClub = createAsyncThunk(
  'clubs/leaveClub',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to leave a club.');

      const response = await fetch(`${API_URL}/clubs/${clubId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to leave club');
      return clubId;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error leaving club');
    }
  }
);

export const fetchClubDetails = createAsyncThunk(
  'clubs/fetchClubDetails',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/clubs/${clubId}`, { headers });
      const data = await response.json();

      if (!response.ok) return rejectWithValue(data.message || `Failed to fetch club with ID ${clubId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || `Network error fetching club with ID ${clubId}`);
    }
  }
);


export const fetchClubPosts = createAsyncThunk(
  'clubs/fetchClubPosts',
  async (clubId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/posts/clubs/${clubId}/posts`, { headers });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch club posts');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching club posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'clubs/createPost',
  async ({ clubId, movie_title, content }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to create a post.');

      const response = await fetch(`${API_URL}/posts/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_title, content }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || 'Failed to create post');
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error creating post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'clubs/deletePost',
  async (postId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to delete a post.');

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete post');
      }

      const userId = getState().auth.user?.id;
      if (userId) {
        dispatch(fetchUserPosts(userId)); 
      }

      return postId; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting post');
    }
  }
);

export const fetchFeedPosts = createAsyncThunk(
  'clubs/fetchFeedPosts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/posts/feed`, { headers });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch feed posts');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching feed posts');
    }
  }
);


export const toggleLike = createAsyncThunk(
  'clubs/toggleLike',
  async ({ postId, currentUserId }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const currentUserUsername = getState().auth.user?.username; 
      if (!token) return rejectWithValue('Authentication required to like/unlike a post.');

      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to toggle like');
      }
      return { postId, ...data, currentUserId, currentUserUsername }; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error toggling like');
    }
  }
);


export const addComment = createAsyncThunk(
  'clubs/addComment',
  async ({ postId, content }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to add a comment.');

      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to add comment');
      }
      return { postId, comment: data }; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error adding comment');
    }
  }
);


export const deleteComment = createAsyncThunk(
  'clubs/deleteComment',
  async (commentId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('Authentication required to delete a comment.');

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete comment');
      }
      return commentId; 
    } catch (error) {
      return rejectWithValue(error.message || 'Network error deleting comment');
    }
  }
);



const clubSlice = createSlice({
  name: 'clubs',
  initialState: {
    allClubs: [],
    myClubs: [],
    currentClub: null,
    currentClubPosts: [],
    feedPosts: [],
    isAllClubsLoading: false,
    isMyClubsLoading: false,
    isCurrentClubLoading: false,
    isLoading: false,
    error: null,
    postCreationStatus: 'idle',
    postCreationError: null,
    postDeletionStatus: 'idle',
    postDeletionError: null,
    isFeedPostsLoading: false,
    feedPostsError: null,
    
    hasFetchedAllClubs: false,
    hasFetchedMyClubs: false,
    hasFetchedClubPosts: false,
    hasFetchedFeedPosts: false,
  },
  reducers: {
    clearClubError: (state) => {
      state.error = null;
    },
    clearCurrentClubPosts: (state) => {
      state.currentClubPosts = [];
    },
    clearCurrentClub: (state) => {
      state.currentClub = null;
      state.currentClubPosts = [];
    },
    setPostCreationStatus: (state, action) => {
      state.postCreationStatus = action.payload;
    },
    clearPostCreationError: (state) => {
      state.postCreationError = null;
    },
    setPostDeletionStatus: (state, action) => {
      state.postDeletionStatus = action.payload;
    },
    clearPostDeletionError: (state) => {
      state.postDeletionError = null;
    },
    resetClubState: (state) => {
      
      state.allClubs = [];
      state.myClubs = [];
      state.currentClub = null;
      state.currentClubPosts = [];
      state.feedPosts = [];
      state.isAllClubsLoading = false;
      state.isMyClubsLoading = false;
      state.isCurrentClubLoading = false;
      state.isLoading = false;
      state.error = null;
      state.postCreationStatus = 'idle';
      state.postCreationError = null;
      state.postDeletionStatus = 'idle';
      state.postDeletionError = null;
      state.isFeedPostsLoading = false;
      state.feedPostsError = null;
      state.hasFetchedAllClubs = false;
      state.hasFetchedMyClubs = false;
      state.hasFetchedClubPosts = false;
      state.hasFetchedFeedPosts = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllClubs.pending, (state) => {
        state.isAllClubsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllClubs.fulfilled, (state, action) => {
        state.isAllClubsLoading = false;
        state.allClubs = action.payload;
        state.hasFetchedAllClubs = true; 
      })
      .addCase(fetchAllClubs.rejected, (state, action) => {
        state.isAllClubsLoading = false;
        state.error = action.payload;
        state.hasFetchedAllClubs = true; 
      })
      .addCase(fetchMyClubs.pending, (state) => {
        state.isMyClubsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyClubs.fulfilled, (state, action) => {
        state.isMyClubsLoading = false;
        state.myClubs = action.payload;
        state.hasFetchedMyClubs = true; 
      })
      .addCase(fetchMyClubs.rejected, (state, action) => {
        state.isMyClubsLoading = false;
        state.error = action.payload;
        state.hasFetchedMyClubs = true; 
      })
      .addCase(joinClub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinClub.fulfilled, (state, action) => {
        state.isLoading = false;
        const joinedClub = action.payload;
        if (!state.myClubs.some(club => club.id === joinedClub.id)) {
          state.myClubs.push(joinedClub);
        }
        state.allClubs = state.allClubs.map(club =>
          club.id === joinedClub.id ? joinedClub : club
        );
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(leaveClub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveClub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myClubs = state.myClubs.filter(club => club.id !== action.payload);
        if (state.currentClub && state.currentClub.id === action.payload) {
          state.currentClub = null;
          state.currentClubPosts = [];
        }
        state.allClubs = state.allClubs.map(club =>
          club.id === action.payload ? { ...club, is_joined: false } : club
        );
      })
      .addCase(leaveClub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClubDetails.pending, (state) => {
        state.isCurrentClubLoading = true;
        state.error = null;
        state.currentClub = null;
      })
      .addCase(fetchClubDetails.fulfilled, (state, action) => {
        state.isCurrentClubLoading = false;
        state.currentClub = action.payload;
      })
      .addCase(fetchClubDetails.rejected, (state, action) => {
        state.isCurrentClubLoading = false;
        state.error = action.payload;
        state.currentClub = null;
      })
      .addCase(fetchClubPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClubPosts = action.payload;
        state.hasFetchedClubPosts = true; 
      })
      .addCase(fetchClubPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.hasFetchedClubPosts = true; 
      })
      .addCase(createPost.pending, (state) => {
        state.postCreationStatus = 'pending';
        state.postCreationError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.postCreationStatus = 'succeeded';
        state.currentClubPosts.unshift(action.payload);
        if (!state.feedPosts.some(post => post.id === action.payload.id)) {
            state.feedPosts.unshift(action.payload);
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.postCreationStatus = 'failed';
        state.postCreationError = action.payload;
      })
      .addCase(deletePost.pending, (state) => {
        state.postDeletionStatus = 'pending';
        state.postDeletionError = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.postDeletionStatus = 'succeeded';
        const deletedPostId = action.payload;
        state.currentClubPosts = state.currentClubPosts.filter(post => post.id !== deletedPostId);
        state.feedPosts = state.feedPosts.filter(post => post.id !== deletedPostId);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.postDeletionStatus = 'failed';
        state.postDeletionError = action.payload;
      })
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isFeedPostsLoading = true;
        state.feedPostsError = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isFeedPostsLoading = false;
        state.feedPosts = action.payload;
        state.hasFetchedFeedPosts = true; 
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isFeedPostsLoading = false;
        state.feedPostsError = action.payload;
        state.hasFetchedFeedPosts = true; 
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes_count, liked, currentUserId, currentUserUsername } = action.payload; 
        
        
        const updatePostLikes = (post) => {
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
        };

        
        state.feedPosts = state.feedPosts.map(post =>
          post.id === postId ? updatePostLikes(post) : post
        );
        
        state.currentClubPosts = state.currentClubPosts.map(post =>
          post.id === postId ? updatePostLikes(post) : post
        );
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        state.feedPosts = state.feedPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), comment], 
            };
          }
          return post;
        });
        state.currentClubPosts = state.currentClubPosts.map(post => {
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
        state.feedPosts = state.feedPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId) 
            };
          }
          return post;
        });
        state.currentClubPosts = state.currentClubPosts.map(post => {
          if (post.comments && post.comments.some(comment => comment.id === deletedCommentId)) {
            return {
              ...post,
              comments: post.comments.filter(comment => comment.id !== deletedCommentId) 
            };
          }
          return post;
        });
      })
      .addCase(logout, (state) => {
        console.log("clubSlice: Handling logout, resetting club state.");
        state.allClubs = [];
        state.myClubs = [];
        state.currentClub = null;
        state.currentClubPosts = [];
        state.feedPosts = [];
        state.isAllClubsLoading = false;
        state.isMyClubsLoading = false;
        state.isCurrentClubLoading = false;
        state.isLoading = false;
        state.error = null;
        state.postCreationStatus = 'idle';
        state.postCreationError = null;
        state.postDeletionStatus = 'idle';
        state.postDeletionError = null;
        state.isFeedPostsLoading = false;
        state.feedPostsError = null;
        state.hasFetchedAllClubs = false;
        state.hasFetchedMyClubs = false;
        state.hasFetchedClubPosts = false;
        state.hasFetchedFeedPosts = false;
      });
  },
});

export const {
  clearClubError,
  clearCurrentClubPosts,
  clearCurrentClub,
  setPostCreationStatus,
  clearPostCreationError,
  setPostDeletionStatus,
  clearPostDeletionError,
  resetClubState
} = clubSlice.actions;

export default clubSlice.reducer;
