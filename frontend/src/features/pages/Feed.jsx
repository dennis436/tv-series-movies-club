// src/features/pages/Feed.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles.css';

const Feed = () => {
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

      <div className="text-center mt-8 text-gray-400">
        <p>Explore clubs or join one to see and create posts!</p>
      </div>
    </div>
  );
};

export default Feed;
