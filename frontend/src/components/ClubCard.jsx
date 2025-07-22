// src/components/ClubCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClubCard = ({ club, onJoin, isJoined }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isJoined) {
      navigate(`/clubs/${club.id}`);
    }
  };

  return (
    <div
      className={`club-card ${isJoined ? 'joined' : ''}`}
      onClick={handleClick}
      style={{ cursor: isJoined ? 'pointer' : 'default' }}
    >
      <h3 className="club-title">{club.name}</h3>
      <p className="club-desc">{club.description}</p>

      {isJoined ? (
        <span className="joined-label">✓ Joined</span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          className="join-btn"
        >
          Join Club
        </button>
      )}
    </div>
  );
};

export default ClubCard;
