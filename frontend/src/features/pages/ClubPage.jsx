import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import ClubCard from '../../components/ClubCard';
import {
  fetchAllClubs,
  fetchMyClubs,
  joinClub,
  clearClubError, 
} from '../clubs/clubSlice'; 
import { checkSession } from '../auth/authSlice';

const ClubPage = () => {
  const dispatch = useDispatch(); 
  const navigate = useNavigate();

  const { isAuthenticated, user, token, isLoading: authLoading } = useSelector((state) => state.auth);
  const { allClubs, myClubs, isLoading: clubsLoading, error } = useSelector((state) => state.clubs);
  const [message, setMessage] = useState(null);

  // Effect to log state changes for debugging
  useEffect(() => {
    console.log("ClubPage Render - isAuthenticated:", isAuthenticated);
    console.log("ClubPage Render - user:", user);
    console.log("ClubPage Render - user?.id:", user?.id);
    console.log("ClubPage Render - authLoading:", authLoading);
    console.log("ClubPage Render - allClubs count:", allClubs.length);
    console.log("ClubPage Render - myClubs count:", myClubs.length);
    console.log("ClubPage Render - clubsLoading:", clubsLoading);
    console.log("ClubPage Render - error:", error);
  }, [isAuthenticated, user, authLoading, allClubs.length, myClubs.length, clubsLoading, error]);


  // Effect to ensure session is checked on load 
  useEffect(() => {
    if (!isAuthenticated && !authLoading && !user) {
      console.log("ClubPage: Dispatching checkSession on initial load.");
      dispatch(checkSession());
    }
  }, [dispatch, isAuthenticated, authLoading, user]);

  // Effect to fetch all clubs and my clubs when component mounts or auth state changes
  useEffect(() => {
    dispatch(clearClubError()); 
    console.log("ClubPage: Dispatching fetchAllClubs."); 
    dispatch(fetchAllClubs());

    if (isAuthenticated && user?.id) { 
      console.log("ClubPage: Dispatching fetchMyClubs for user ID:", user.id);
      dispatch(fetchMyClubs()); 
    } else if (!isAuthenticated && !authLoading) {
      console.log("ClubPage: Not authenticated or auth loading, clearing myClubs state.");
      dispatch({ type: 'clubs/fetchMyClubs/fulfilled', payload: [] });
    }
  }, [dispatch, isAuthenticated, user?.id, authLoading]); 

  // Effect to handle pending club join after login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const pendingClubId = sessionStorage.getItem('pendingJoinClubId');
      if (pendingClubId) {
        console.log("ClubPage: Processing pending join for club ID:", pendingClubId, "with user ID:", user.id);
        sessionStorage.removeItem('pendingJoinClubId'); 
        setMessage(null); 

        dispatch(joinClub(Number(pendingClubId)))
          .unwrap() 
          .then(() => {
            setMessage('Club joined successfully!');
            dispatch(fetchMyClubs());
          })
          .catch((err) => {
            setMessage(`Failed to join club: ${err}`);
          });
      }
    }
  }, [isAuthenticated, user?.id, dispatch]);

  // Effect to display Redux errors
  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  const handleJoin = async (clubId) => {
    console.log("handleJoin called for club ID:", clubId);
    console.log("handleJoin - isAuthenticated:", isAuthenticated);
    console.log("handleJoin - user:", user);
    console.log("handleJoin - user?.id:", user?.id);

    if (!isAuthenticated) {
      sessionStorage.setItem('pendingJoinClubId', clubId);
      sessionStorage.setItem('redirectAfterLogin', '/clubs'); 
      setMessage('Please login to join this club.'); 
      navigate('/login');
    } else if (!user?.id) {
        setMessage('User data not fully loaded. Please try again.');
        console.log("handleJoin: User ID missing, re-dispatching checkSession.");
        dispatch(checkSession());
    } else {
      setMessage(null); 
      try {
        console.log("handleJoin: Attempting to join club with user ID:", user.id);
        await dispatch(joinClub(clubId)).unwrap(); 
        setMessage('You have joined the club!');
        dispatch(fetchMyClubs());
      } catch (err) {
        setMessage(`Failed to join club: ${err}`);
      }
    }
  };

  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  return (
    <div className="club-page">
      <div className="feed-welcome-box">
        <h1 className="text-xl font-bold mb-2">Join a Club</h1> 
        <p className="text-gray-300">Find a community that shares your taste in TV shows and movies!</p>
      </div>

      {(authLoading || clubsLoading) && <p className="text-blue-400 text-center">Loading clubs...</p>}
      {message && <p className="error text-red-500 text-center">{message}</p>} 

      {isAuthenticated && myClubs.length > 0 ? (
        <div className="my-clubs-section mt-8">
          <h2 className="text-lg font-semibold mb-3">My Clubs</h2> 
          <div className="club-grid">
            {myClubs.map((club) => (
              <ClubCard key={club.id} club={club} isJoined={true} />
            ))}
          </div>
        </div>
      ) : (
        // Display a message if no clubs are joined and not loading
        !clubsLoading && !authLoading && isAuthenticated && myClubs.length === 0 && (
          <p className="text-gray-400 text-center mt-4">You haven't joined any clubs yet. Explore below!</p>
        )
      )}

      <div className="all-clubs-section mt-8">
        <h2 className="text-lg font-semibold mb-3">Explore All Clubs</h2> 
        <div className="club-grid">
          {clubsLoading && <p className="text-blue-400 text-center">Loading clubs to explore...</p>}
          {allClubs.length > 0 ? (
            availableClubs.map((club) => (
              <ClubCard key={club.id} club={club} onJoin={() => handleJoin(club.id)} />
            ))
          ) : (
            !clubsLoading && <p className="text-gray-400 text-center">No clubs available to explore.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubPage;
