import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClubCard = ({ club, onJoin, isJoined }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // If the club is already joined, clicking the card navigates to its details page
    if (isJoined) {
      navigate(`/clubs/${club.id}`);
    }
    // If not joined, clicking the card does nothing, only the button handles joining
  };

  return (
    <div
      className={`
        club-card
        bg-gray-700
        rounded-lg
        p-6
        shadow-lg
        flex flex-col
        justify-between
        items-center
        text-center
        transition-all duration-300
        ${isJoined ? 'border-2 border-green-500 cursor-pointer hover:shadow-xl' : 'border-2 border-transparent hover:border-blue-500 hover:shadow-xl'}
      `}
      onClick={handleClick}
    >
      <h3 className="club-title text-xl font-bold text-orange-400 mb-2">{club.name}</h3>
      <p className="club-desc text-gray-300 text-sm mb-4 flex-grow">{club.description}</p>

      {isJoined ? (
        <span className="joined-label bg-green-600 text-white text-sm px-4 py-1 rounded-full font-semibold">
          ✓ Joined
        </span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the parent card's onClick from firing when button is clicked
            onJoin(); 
          }}
          className="
            join-btn
            bg-blue-600 hover:bg-blue-700
            text-white font-bold
            py-2 px-4 rounded-full
            shadow-md transition duration-300 ease-in-out
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
          "
        >
          Join Club
        </button>
      )}
    </div>
  );
};

export default ClubCard;
