// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { followUser, unfollowUser, fetchFollowing } from '../features/auth/authSlice';
import { deletePost, toggleLike, addComment, deleteComment } from '../features/clubs/clubSlice';
import { addToWatchlist } from '../features/Watchlist/watchlistSlice'; // ✅ NEW

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user: currentUser, following: followingListFromRedux, isAuthenticated } = useSelector((state) => state.auth);

  const hasLiked = post.likes && currentUser ? post.likes.some(like => like.user_id === currentUser.id) : false;

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');

  const isFollowing = (followingListFromRedux || []).some(followedUser => followedUser.id === post.author_id);
  const isOwnPost = currentUser && currentUser.id === post.author_id;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchFollowing(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to like posts.");
      return;
    }
    try {
      await dispatch(toggleLike({ postId: post.id, currentUserId: currentUser.id })).unwrap();

      // ✅ If it was not previously liked, add it to watchlist
      const userPreviouslyLiked = post.likes?.some(like => like.user_id === currentUser.id);
      if (!userPreviouslyLiked) {
        dispatch(addToWatchlist({
          id: post.id,
          title: post.movie_title,
          genre: post.genre || 'Unknown',
          status: 'liked',
        }));
      }

      console.log(Successfully toggled like for post ${post.id});
    } catch (error) {
      console.error("Failed to toggle like:", error);
      alert(Failed to toggle like: ${error.message || 'An error occurred.'});
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow users.");
      return;
    }
    if (isOwnPost) {
      alert("You cannot follow yourself.");
      return;
    }
    if (!post.author_id) {
        alert("Cannot follow: Author ID is missing for this post.");
        console.error("PostCard: Missing post.author_id for follow action:", post);
        return;
    }

    try {
      if (isFollowing) {
        await dispatch(unfollowUser(post.author_id)).unwrap();
        console.log(Successfully unfollowed user ${post.author_id});
      } else {
        await dispatch(followUser(post.author_id)).unwrap();
        console.log(Successfully followed user ${post.author_id});
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      alert(Failed to toggle follow: ${error.message || 'An error occurred.'});
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await dispatch(deletePost(post.id)).unwrap();
      alert("Post deleted successfully!");
      console.log(Post ${post.id} deleted successfully.);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(Failed to delete post: ${error.message || 'An error occurred.'});
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to add comments.");
      return;
    }
    if (newCommentContent.trim()) {
      try {
        await dispatch(addComment({ postId: post.id, content: newCommentContent.trim() })).unwrap();
        setNewCommentContent('');
        console.log(Comment added to post ${post.id});
      } catch (error) {
        console.error("Failed to add comment:", error);
        alert(Failed to add comment: ${error.message || 'An error occurred.'});
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      alert("Please log in to delete comments.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      console.log(Comment ${commentId} deleted successfully.);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(Failed to delete comment: ${error.message || 'An error occurred.'});
    }
  };

  return (
    <div className="post-card p-4 rounded-lg bg-[#1a2a44] shadow-md text-white w-full md:max-w-lg lg:max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-[#ff5733] mb-1">
        {post.movie_title}
      </h2>

      <p className="text-gray-200 mb-2">{post.content}</p>

      <div className="post-meta flex justify-between text-sm text-gray-400 mb-4">
        <span>Posted by <strong>@{post.author_username}</strong></span>
        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Invalid Date'}</span>
      </div>

      <div className="post-actions grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={handleToggleLike}
          className={`
            px-4 py-2 rounded-full font-bold shadow-md transition duration-300 ease-in-out
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75
            ${hasLiked ? 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
            text-white
          `}
        >
          {hasLiked ? 'Unlike' : 'Like'} ({post.likes_count || 0})
        </button>

        <button
          onClick={handleFollow}
          className="px-4 py-2 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-md"
          disabled={isOwnPost || !isAuthenticated}
        >
          {isOwnPost ? 'Your Post' : (isFollowing ? 'Unfollow' : 'Follow')}
        </button>

        <button
          onClick={() => setCommentsVisible(prev => !prev)}
          className="px-4 py-2 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 shadow-md"
        >
          {commentsVisible ? 'Hide Comments' : Show Comments (${post.comments ? post.comments.length : 0})}
        </button>

        {isAuthenticated && isOwnPost && (
          <button
            onClick={handleDeletePost}
            className="px-4 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 shadow-md"
          >
            Delete Post
          </button>
        )}
      </div>

      {commentsVisible && (
        <div className="comments-section mt-3">
          <h4 className="text-[#ff5733] font-medium mb-2">Comments</h4>

          {post.comments && post.comments.length === 0 ? (
            <p className="text-gray-400">No comments yet.</p>
          ) : (
            <ul className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {post.comments && post.comments.map((comment) => (
                <li key={comment.id} className="text-sm text-gray-200 flex justify-between items-start p-2 rounded-md bg-[#2c3e50] border border-gray-600 flex-col sm:flex-row sm:items-center">
                  <span className="flex-grow"><strong>@{comment.username}</strong>: {comment.content}</span>
                  {isAuthenticated && currentUser?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="mt-1 sm:mt-0 sm:ml-4 px-2 py-1 rounded-md bg-red-500 text-white text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAuthenticated && (
            <form onSubmit={handleAddComment}>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="w-full p-2 rounded bg-[#2c3e50] text-white border border-gray-600 mb-2 focus:outline-none focus:ring-2 focus:ring-[#ff5733]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 shadow-md"
              >
                Add Comment
              </button>
            </form>
          )}
          {!isAuthenticated && (
            <p className="text-gray-400 text-sm mt-2">Log in to add comments.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;