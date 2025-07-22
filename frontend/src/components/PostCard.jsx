// src/components/PostCard.jsx
import React, { useState } from 'react';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleFollow = () => {
    setIsFollowing(prev => !prev);
    // Backend call can go here
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const commentObj = {
        id: Date.now(),
        text: newComment,
        author: 'you' // Replace with real user
      };
      setComments([...comments, commentObj]);
      setNewComment('');
    }
  };

  return (
    <div className="post-card p-4 rounded-lg bg-[#1a2a44] shadow-md text-white">
      <h2 className="text-xl font-semibold text-[#ff5733] mb-1">
        {post.title || post.movieTitle}
      </h2>

      <p className="text-gray-200 mb-2">{post.comment || post.content}</p>

      <div className="post-meta flex justify-between text-sm text-gray-400 mb-4">
        <span>Posted by <strong>@{post.username || post.author}</strong></span>
        <span>{post.created_at || post.date}</span>
      </div>

      {/* Buttons */}
      <div className="post-actions flex gap-3 mb-4 flex-wrap">
        <button onClick={handleLike} className="post-btn">
          {liked ? '💔 Unlike' : '❤️ Like'} ({likes})
        </button>

        <button onClick={handleFollow} className="post-btn">
          {isFollowing ? 'Unfollow' : 'Follow'} @{post.username || post.author}
        </button>

        <button onClick={() => setCommentsVisible(prev => !prev)} className="post-btn">
          {commentsVisible ? 'Hide Comments' : 'Show Comments'}
        </button>
      </div>

      {/* Comments Section */}
      {commentsVisible && (
        <div className="comments-section mt-3">
          <h4 className="text-[#ff5733] font-medium mb-2">💬 Comments</h4>

          {comments.length === 0 ? (
            <p className="text-gray-400">No comments yet.</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {comments.map((c) => (
                <li key={c.id} className="text-sm text-gray-200">
                  <strong>@{c.author}</strong>: {c.text}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full p-2 rounded bg-[#2c3e50] text-white border border-gray-600 mb-2"
            />
            <button
              type="submit"
              className="post-btn"
            >
              Add Comment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
