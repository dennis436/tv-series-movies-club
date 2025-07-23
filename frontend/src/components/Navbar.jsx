// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';


const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="logo">CineClub</span>
      <ul>
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/clubs">Clubs</Link></li>
        <li><Link to="/tracker">My Tracker</Link></li>
        <li><Link to="/watchlist">Watchlist</Link></li>

        {isAuthenticated && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {!isAuthenticated && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="join-btn">Join Now</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
