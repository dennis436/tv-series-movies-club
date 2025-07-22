// src/features/pages/ClubPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClubCard from '../../components/ClubCard';

const mockClubs = [
  { id: 1, name: 'Thriller Fanatics', description: 'Dive deep into thrilling mysteries and suspense.' },
  { id: 2, name: 'Rom-Com Lovers', description: 'Celebrate romance and comedy with us.' },
  { id: 3, name: 'Sci-Fi Nerds', description: 'Explore galaxies, aliens, and future tech.' },
  { id: 4, name: 'Horror Vault', description: 'Spine-chilling horror films and creepy tales await.' },
  { id: 5, name: 'Action Addicts', description: 'Explosions, fights, and adrenaline-pumping scenes all day.' },
  { id: 6, name: 'Anime Alliance', description: 'From classics to new-gen anime – all in one club.' },
  { id: 7, name: 'Drama Queens', description: 'All about emotions, tears, and powerful performances.' },
  { id: 8, name: 'Documentary Diggers', description: 'Explore real-world stories and truths through documentaries.' },
  { id: 9, name: 'Fantasy Realm', description: 'Dragons, magic, and epic quests from middle-earth to Westeros.' },
  { id: 10, name: 'Classic Cinema', description: 'Discuss timeless masterpieces from the golden age of film.' },
];

const ClubPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [joinedClubs, setJoinedClubs] = useState([]);

  const handleJoin = (club) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingJoinClubId', club.id);
      sessionStorage.setItem('redirectAfterLogin', '/club');
      alert('Please login to join this club.');
      navigate('/login');
    } else {
      if (!joinedClubs.find(c => c.id === club.id)) {
        setJoinedClubs([...joinedClubs, club]);
        alert(`You have joined the ${club.name} club!`);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const pendingClubId = sessionStorage.getItem('pendingJoinClubId');
      if (pendingClubId) {
        const club = mockClubs.find(c => c.id === Number(pendingClubId));
        if (club) {
          setJoinedClubs(prevClubs => {
            if (!prevClubs.find(c => c.id === club.id)) {
              alert(`You have joined the ${club.name} club!`);
              return [...prevClubs, club];
            }
            return prevClubs;
          });
        }
        sessionStorage.removeItem('pendingJoinClubId');
      }
    }
  }, [isAuthenticated]);

  const availableClubs = mockClubs.filter(club => !joinedClubs.some(j => j.id === club.id));

  return (
    <div className="club-page">
      <div className="feed-welcome-box">
        <h1 className="text-xl font-bold mb-2">🎮 Join a Club</h1>
        <p className="text-gray-300">Find a community that shares your taste in TV shows and movies!</p>
      </div>

      {isAuthenticated && joinedClubs.length > 0 && (
        <div className="my-clubs-section">
          <h2 className="text-lg font-semibold mb-3">📂 My Clubs</h2>
          <div className="club-grid">
            {joinedClubs.map(club => (
              <ClubCard key={club.id} club={club} isJoined />
            ))}
          </div>
        </div>
      )}

      <div className="all-clubs-section mt-8">
        <h2 className="text-lg font-semibold mb-3">🌐 Explore All Clubs</h2>
        <div className="club-grid">
          {availableClubs.map(club => (
            <ClubCard key={club.id} club={club} onJoin={() => handleJoin(club)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubPage;
