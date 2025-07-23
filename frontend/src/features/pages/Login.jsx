import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../auth/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  console.log("Login Component Rendered."); 
  console.log("Login State - isAuthenticated:", isAuthenticated); 
  console.log("Login State - isLoading:", isLoading); 
  console.log("Login State - error:", error); 

  useEffect(() => {
    console.log("Login useEffect [isAuthenticated, navigate] triggered."); 
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/feed';
      sessionStorage.removeItem('redirectAfterLogin');
      console.log("Login: Authenticated, navigating to:", redirectPath); 
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log("Login useEffect [dispatch, formData] triggered, clearing error."); 
    dispatch(clearError());
  }, [dispatch, formData]);

  const handleChange = (e) => {
    console.log("Login: handleChange - Name:", e.target.name, "Value:", e.target.value); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Crucial: Prevents default form submission
    console.log("Login: handleSubmit called."); 
    dispatch(clearError());
    console.log("Login.jsx: Dispatching loginUser with:", formData.username);
    dispatch(loginUser({
      username: formData.username,
      password: formData.password,
    }));
  };

  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}
        
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <p>Don't have an account? <Link to="/register">Join the Community</Link></p>
      </form>
    </div>
  );
};

export default Login;
