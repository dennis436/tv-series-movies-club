import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeedPosts } from '../clubs/clubSlice';
import PostCard from '../../components/PostCard';
import '../../styles.css'; // Assuming this is your global CSS, like index.css

const Feed = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { feedPosts, isFeedPostsLoading, feedPostsError } = useSelector((state) => state.clubs);

  const [hasFetchedFeedPosts, setHasFetchedFeedPosts] = useState(false);

  useEffect(() => {
    console.log("Feed useEffect: Checking fetch conditions. isAuthenticated:", isAuthenticated, "hasFetchedFeedPosts:", hasFetchedFeedPosts);

    if (isAuthenticated && !hasFetchedFeedPosts) {
      console.log("Feed useEffect: Authenticated and not yet fetched, dispatching fetchFeedPosts.");
      dispatch(fetchFeedPosts());
      setHasFetchedFeedPosts(true);
    }

    if (!isAuthenticated && hasFetchedFeedPosts) {
        console.log("Feed useEffect: Not authenticated, resetting hasFetchedFeedPosts.");
        setHasFetchedFeedPosts(false);
    }
  }, [isAuthenticated, hasFetchedFeedPosts, dispatch]);

  const sortedFeedPosts = [...feedPosts].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });

  return (
    <div className="page-container">
      {/* Welcome Box Section */}
      <div className="feed-welcome-box">
        <h1 className="feed-title">Welcome to CineClub</h1>
        <p className="feed-subtitle">
          Connect with fellow movie and TV series enthusiasts
        </p>
        {!isAuthenticated ? (
          <div className="feed-buttons">
            <Link to="/register" className="join-btn">
              Join the Community
            </Link>
            <Link to="/login" className="login-btn-box">
              Sign In
            </Link>
          </div>
        ) : (
          <p className="text-green-400 mt-4 text-center">
            👋 Welcome back{user?.username ? `, @${user.username}` : ''}!
          </p>
        )}
      </div>

      {isAuthenticated ? (
        <div className="global-feed-section mt-8 p-6 rounded-lg shadow-lg text-white"> {/* Removed bg-gray-900 */}
          <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Global Posts Feed</h2>

          {isFeedPostsLoading ? (
            <p className="text-blue-400 text-center">Loading posts...</p>
          ) : feedPostsError ? (
            <p className="text-red-500 text-center">Error loading feed: {feedPostsError}</p>
          ) : sortedFeedPosts.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">No posts available yet. Be the first to create one!</p>
          ) : (
            <div className="feed-list space-y-6">
              {sortedFeedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-8 text-gray-400">
          <p>Log in to see the latest posts from the community!</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
