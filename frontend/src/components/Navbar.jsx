// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { resetWatchlistState } from '../features/Watchlist/watchlistSlice'; // Import resetWatchlistState

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action from authSlice
    dispatch(resetWatchlistState()); // NEW: Dispatch resetWatchlistState on logout
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
      <span className="logo text-xl font-bold">CineClub</span>
      <ul className="flex space-x-4 ml-auto items-center">
        {isAuthenticated && (
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        )}
        <li><NavLink to="/feed">Feed</NavLink></li>
        <li><NavLink to="/clubs">Clubs</NavLink></li>
        <li><NavLink to="/watchlist">Watchlist</NavLink></li> {/* Ensure this link exists */}

        {isAuthenticated && (
          <>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {!isAuthenticated && (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register" className="join-btn">Join Now</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
