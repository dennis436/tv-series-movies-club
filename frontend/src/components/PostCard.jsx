import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
} from '../features/clubs/clubSlice';
import {
  followUser,
  unfollowUser,
  fetchFollowing,
  fetchFollowers,
} from '../features/auth/authSlice';
import { addToWatchlist, fetchWatchlist } from '../features/Watchlist/watchlistSlice';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, following } = useSelector((state) => state.auth);
  const watchlistItems = useSelector((state) => state.watchlist.items);

  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes?.some((like) => like.user_id === user?.id);
  const isAuthor = post.user_id === user?.id;
  const isFollowingAuthor = following?.some((f) => f.id === post.user_id);

  const alreadyInWatchlist = watchlistItems.some((item) => item.movie_id === post.id);

  const handleLikeToggle = async () => {
    if (!user) {
      console.error('Please log in to like posts.');
      return;
    }

    try {
      const resultAction = await dispatch(toggleLike({ postId: post.id, currentUserId: user.id })).unwrap();
      const newLikedStatus = resultAction.liked;

      if (newLikedStatus && !alreadyInWatchlist) {
        await dispatch(addToWatchlist({ // Await this dispatch to ensure it completes
          movie_id: post.id,
          movie_title: post.movie_title,
          genre: post.club?.name || null,
          status: 'pending',
        }));
        console.log(`Dispatched addToWatchlist for "${post.movie_title}".`);

        // Introduce a small delay before fetching the watchlist
        // This gives the backend a moment to process the new item fully.
        setTimeout(() => {
          if (user?.id) {
            dispatch(fetchWatchlist(user.id));
          }
        }, 300); // 300ms delay (adjust if needed)

      } else if (!newLikedStatus && alreadyInWatchlist) {
        console.log(`User unliked "${post.movie_title}". Not automatically removing from watchlist.`);
      }

      console.log(`Toggled like for post ${post.id}. New status: ${newLikedStatus ? 'Liked' : 'Unliked'}`);
    } catch (error) {
      console.error('Failed to toggle like or add to watchlist:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) {
      console.error("Comment cannot be empty.");
      return;
    }
    try {
      await dispatch(addComment({ postId: post.id, content: newComment })).unwrap();
      setNewComment('');
      setShowComments(true);
      console.log(`Successfully added comment to post ${post.id}`);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      console.error("Please log in to delete comments.");
      return;
    }
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      console.log(`Successfully deleted comment ${commentId}`);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !isAuthor) {
      console.error("You are not authorized to delete this post.");
      return;
    }
    try {
      await dispatch(deletePost(post.id)).unwrap();
      console.log(`Successfully deleted post ${post.id}`);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      console.error("Please log in to follow/unfollow users.");
      return;
    }
    if (user.id === post.user_id) {
      console.log("Cannot follow/unfollow yourself.");
      return;
    }

    try {
      if (isFollowingAuthor) {
        await dispatch(unfollowUser(post.user_id)).unwrap();
        console.log(`Successfully unfollowed user ${post.author_username}`);
      } else {
        await dispatch(followUser(post.user_id)).unwrap();
        console.log(`Successfully followed user ${post.author_username}`);
      }
      if (user?.id) {
        dispatch(fetchFollowing(user.id));
        dispatch(fetchFollowers(user.id));
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      if (error.message && error.message.includes("Not currently following")) {
        console.log("Attempting to correct local state for unfollow.");
        dispatch(unfollowUser.fulfilled(post.user_id));
      }
    }
  };

  return (
    <div className="post-card bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-orange-400 mb-1">{post.movie_title}</h3>
          <div className="flex items-center text-gray-300 text-sm">
            <p className="mr-2">by @{post.author_username}</p>
            {isAuthenticated && !isAuthor && (
              <button
                onClick={handleFollowToggle}
                className={`
                  px-3 py-1 rounded-full font-bold text-xs transition duration-300
                  ${isFollowingAuthor ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white
                `}
              >
                {isFollowingAuthor ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={handleDeletePost}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm transition"
          >
            Delete Post
          </button>
        )}
      </div>

      <p className="text-gray-200 mb-4">{post.content}</p>

      <div className="flex items-center text-gray-400 text-sm mb-4">
        <span className="mr-4">{post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}</span>
        <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}</span>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleLikeToggle}
          className={`
            flex items-center px-4 py-2 rounded-full font-bold text-sm transition
            ${isLiked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          `}
        >
          ❤️ {isLiked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center px-4 py-2 rounded-full bg-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-600 transition"
        >
          💬 {showComments ? 'Hide Comments' : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-200 mb-3">Comments</h4>
          {post.comments?.length > 0 ? (
            <ul className="space-y-3">
              {post.comments.map((comment) => (
                <li key={comment.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="text-gray-100">{comment.content}</p>
                    <p className="text-gray-400 text-xs mt-1">@{comment.username} on {new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs transition"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
          )}

          <form onSubmit={handleAddComment} className="mt-4 flex">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow p-2 rounded-l-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
