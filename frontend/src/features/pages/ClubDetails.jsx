// src/features/pages/ClubDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const mockClubs = [
  { id: 1, name: 'Thriller Fanatics', description: 'Dive deep into thrilling mysteries and suspense.' },
  { id: 2, name: 'Rom-Com Lovers', description: 'Celebrate romance and comedy with us.' },
  { id: 3, name: 'Sci-Fi Nerds', description: 'Explore galaxies, aliens, and future tech.' },
];

const mockPosts = [
  { id: 1, clubId: 1, movieTitle: 'Gone Girl', content: 'Intense mystery.', author: 'maxwell', date: '2025-07-17' },
  { id: 2, clubId: 1, movieTitle: 'Se7en', content: 'What’s in the box?!', author: 'filmfan', date: '2025-07-16' },
  { id: 3, clubId: 2, movieTitle: 'Notting Hill', content: 'Classic rom-com!', author: 'user12', date: '2025-07-15' },
];

function ClubDetails() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const clubId = parseInt(id);
    setClub(mockClubs.find(c => c.id === clubId));
    setPosts(mockPosts.filter(p => p.clubId === clubId));
  }, [id]);

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

  const toggleFollow = (author) => {
    setFollowing(prev => ({
      ...prev,
      [author]: !prev[author]
    }));
  };

  if (!club) return <p className="center-text">Club not found.</p>;

  return (
    <div className="page-container">
      <h1>{club.name}</h1>
      <p className="club-desc">{club.description}</p>

      <div className="text-right">
        <Link to={`/clubs/${club.id}/create-post`} className="join-btn">+ Create Post</Link>
      </div>

      {posts.length === 0 ? (
        <p className="no-posts-text">No posts in this club yet.</p>
      ) : (
        <div className="feed-list">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <h2 className="text-lg font-semibold">{post.movieTitle}</h2>
              <p>{post.content}</p>
              <div className="post-meta text-sm text-gray-400 flex justify-between items-center">
                <span>By @{post.author}</span>
                <span>{post.date}</span>
              </div>

              <div className="mt-2 flex gap-3 items-center text-sm">
                <button onClick={() => toggleLike(post.id)} className="text-blue-400 hover:underline">
                  ❤️ Like ({likes[post.id] || 0})
                </button>

                <button onClick={() => toggleFollow(post.author)} className="text-purple-400 hover:underline">
                  {following[post.author] ? 'Unfollow' : 'Follow'} @{post.author}
                </button>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-1">💬 Comments:</h4>
                <ul className="text-sm text-gray-300 mb-2">
                  {(comments[post.id] || []).map((cmt, i) => (
                    <li key={i} className="mb-1">- {cmt}</li>
                  ))}
                </ul>

                <input
                  type="text"
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                      addComment(post.id, e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="bg-gray-800 px-2 py-1 rounded w-full text-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
