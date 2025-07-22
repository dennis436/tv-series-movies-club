// 📁 src/features/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../../components/PostCard';

const mockPosts = [
  { id: 1, movieTitle: 'Inception', content: 'Mind-blowing plot!', clubName: 'Sci-Fi Nerds', date: '2025-07-15', likes: 5, comments: [] },
  { id: 2, movieTitle: 'Titanic', content: 'So emotional.', clubName: 'Rom-Com Lovers', date: '2025-07-14', likes: 3, comments: [] },
];

const mockJoinedClubs = [
  { id: 3, name: 'Sci-Fi Nerds', description: 'Explore galaxies, aliens, and future tech.' },
  { id: 5, name: 'Rom-Com Lovers', description: 'Celebrate romance and comedy with us.' },
];

const mockFollowing = [
  { id: 1, username: 'filmfan' },
  { id: 2, username: 'cinebuff' },
];

const mockFollowers = [
  { id: 3, username: 'user123' },
  { id: 4, username: 'tvlover' },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Unknown',
    email: 'not set',
    bio: '',
  };

  const [following, setFollowing] = useState(mockFollowing);
  const [followers] = useState(mockFollowers);

  const handleUnfollow = (userId) => {
    setFollowing(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div className="dashboard-container">
      <div className="feed-welcome-box">
        <h1 className="text-3xl font-bold mb-3 text-[#ff5733]">🎬 Welcome, {user.username}!</h1>
        <p className="text-gray-300">Manage your clubs, posts, and more below.</p>
        <div className="user-info-box mt-6">
          <h2 className="text-lg font-semibold mb-2 text-white">👤 Profile Info</h2>
          <p className="text-gray-300"><strong>Username:</strong> {user.username}</p>
          <p className="text-gray-300"><strong>Email:</strong> {user.email}</p>
          {user.bio && <p className="text-gray-300"><strong>Bio:</strong> {user.bio}</p>}
          <Link to="/profile" className="join-btn mt-4 inline-block">Edit Profile</Link>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">📝 My Posts</h2>
        {mockPosts.length === 0 ? (
          <p className="text-gray-400">You haven’t created any posts yet.</p>
        ) : (
          <div className="feed-list">
            {mockPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">🎥 My Clubs</h2>
        {mockJoinedClubs.length === 0 ? (
          <p className="text-gray-400">You haven't joined any clubs yet.</p>
        ) : (
          <div className="club-grid mt-4">
            {mockJoinedClubs.map(club => (
              <div key={club.id} className="club-card joined">
                <h3 className="club-title">{club.name}</h3>
                <p className="club-desc">{club.description}</p>
                <Link to={`/clubs/${club.id}`} className="join-btn mt-3 inline-block">Go to Club</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">👥 People I’m Following</h2>
        {following.length === 0 ? (
          <p className="text-gray-400">You're not following anyone yet.</p>
        ) : (
          <ul className="feed-list">
            {following.map(user => (
              <li key={user.id} className="post-card">
                <p className="text-white">@{user.username}</p>
                <button className="post-btn mt-2" onClick={() => handleUnfollow(user.id)}>Unfollow</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">👤 My Followers</h2>
        {followers.length === 0 ? (
          <p className="text-gray-400">You don't have any followers yet.</p>
        ) : (
          <ul className="feed-list">
            {followers.map(user => (
              <li key={user.id} className="post-card">
                <p className="text-white">@{user.username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
