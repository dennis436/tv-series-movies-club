// src/features/pages/Feed.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../../components/PostCard';
import '../../styles.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/posts')  // your backend endpoint
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div className="feed-welcome-box">
        <h1 className="feed-title">Welcome to CineClub</h1>
        <p className="feed-subtitle">Connect with fellow movie and TV series enthusiasts</p>
        <div className="feed-buttons">
          <Link to="/register" className="join-btn">Join the Community</Link>
          <Link to="/login" className="login-btn-box">Sign In</Link>
        </div>
      </div>

      <div className="feed-list">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet — be the first to share!</p>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Feed;
