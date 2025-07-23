import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import {
  fetchClubPosts,
  clearClubError,
  clearCurrentClubPosts, 
} from '../clubs/clubSlice'; 

// PostCard component to display individual posts (updated to include interactive elements)
const PostCard = ({ post, toggleLike, addComment, toggleFollow, likes, comments, following }) => {
  return (
    <div className="forum-post-card">
      <h2 className="text-xl font-bold text-blue-400 mb-2">
        {post.movie_title}
      </h2>
      <p className="text-gray-300 mb-3">{post.content}</p>
      <div className="post-meta text-sm text-gray-400 flex justify-between items-center">
        {/* Use author_username from backend and created_at_formatted */}
        <span>By @{post.author_username || "Unknown"}</span>
        <span>{new Date(post.created_at_formatted).toLocaleDateString()}</span>
      </div>

      <div className="mt-2 flex gap-3 items-center text-sm">
        <button
          onClick={() => toggleLike(post.id)}
          className="text-blue-400 hover:underline"
        >
          Like ({likes[post.id] || 0}) {/* Removed emoji */}
        </button>

        {/* Use post.author_username for following logic */}
        <button
          onClick={() => toggleFollow(post.author_username)}
          className="text-purple-400 hover:underline"
        >
          {following[post.author_username] ? "Unfollow" : "Follow"} @
          {post.author_username}
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-1">Comments:</h4>
        <ul className="text-sm text-gray-300 mb-2">
          {(comments[post.id] || []).map((cmt, i) => (
            <li key={i} className="mb-1">
              - {cmt}
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="Add a comment..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim() !== "") {
              addComment(post.id, e.target.value.trim());
              e.target.value = "";
            }
          }}
          className="bg-gray-800 px-2 py-1 rounded w-full text-white"
        />
      </div>
    </div>
  );
};

function ClubDetails() {
  const { id } = useParams(); // Get club ID from URL
  const dispatch = useDispatch(); 

  // State for likes, comments, and following
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [following, setFollowing] = useState({});

  // Redux state selectors
  const { allClubs, currentClubPosts, isLoading, error } = useSelector((state) => state.clubs);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const club = allClubs.find(c => c.id === parseInt(id));

  // Effect to fetch posts for this specific club
  useEffect(() => {
    if (id) {
      dispatch(clearClubError()); 
      dispatch(fetchClubPosts(parseInt(id))); 
    }
    return () => {
      dispatch(clearCurrentClubPosts());
    };
  }, [id, dispatch]); 

  // Effect to check authentication and user data
  const toggleLike = (postId) => {
    setLikes(prev => ({
      ...prev,
      [postId]: prev[postId] ? prev[postId] + 1 : 1
    }));
  };

  const addComment = (postId, text) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), text]
    }));
  };

  const toggleFollow = (authorUsername) => { // Changed to authorUsername for clarity
    setFollowing(prev => ({
      ...prev,
      [authorUsername]: !prev[authorUsername]
    }));
  };

  // Loading, error, and club not found checks (your version)
  if (isLoading && !club && currentClubPosts.length === 0) {
    return <p className="text-blue-400 text-center mt-8">Loading club details and posts...</p>;
  }

  if (error) {
    return <p className="error text-red-500 text-center mt-8">Error: {error}</p>;
  }

  if (!club) {
    return <p className="text-gray-400 text-center mt-8">Club not found or not loaded.</p>;
  }

  return (
    <div className="page-container p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-orange-400 mb-2">{club.name}</h1>
      <p className="club-desc text-gray-300 text-lg mb-4">{club.description}</p>

      {isAuthenticated && ( // Only show create post button if authenticated
        <div className="text-right mb-6">
          <Link
            to={`/clubs/${club.id}/create-post`}
            className="
              bg-blue-600 hover:bg-blue-700
              text-white font-bold
              py-2 px-4 rounded-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            "
          >
            + Create Post
          </Link>
        </div>
      )}

      {isLoading && currentClubPosts.length === 0 ? (
        <p className="text-blue-400 text-center">Loading posts for this club...</p>
      ) : currentClubPosts.length === 0 ? (
        <p className="no-posts-text text-gray-400 text-center mt-8">No posts in this club yet.</p>
      ) : (
        <div className="feed-list mt-8">
          {currentClubPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              toggleLike={toggleLike}
              addComment={addComment}
              toggleFollow={toggleFollow}
              likes={likes}
              comments={comments}
              following={following}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
