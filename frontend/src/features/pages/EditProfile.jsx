// src/features/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateUserProfile,
  fetchUserProfile, // To re-fetch updated profile after successful update
  clearError,
} from '../auth/authSlice';

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user, loading, and error states from Redux
  const { user, isLoading, error: authError } = useSelector((state) => state.auth);

  // Local state for form data, initialized with user data from Redux
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    new_password: '', // Add new_password field
  });
  const [localMessage, setLocalMessage] = useState(null); // For success/error messages

  // Redirect if not authenticated or user data is missing
  useEffect(() => {
    if (!user) {
      // If user is null (e.g., page refresh and session not checked yet), try to fetch
      // Or if not authenticated, redirect to login
      if (!isLoading && !user) { // Only redirect if not loading and user is definitively null
        navigate('/login');
      }
    } else {
      // Update form data if user data changes in Redux (e.g., after initial fetch)
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user, isLoading, navigate]);

  // Handle Redux errors and clear them after a delay
  useEffect(() => {
    if (authError) {
      setLocalMessage(`Error: ${authError}`);
      const timer = setTimeout(() => {
        dispatch(clearError());
        setLocalMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage(null); // Clear previous messages

    if (!user?.id) {
      setLocalMessage('User not authenticated. Please log in.');
      return;
    }

    const updateData = {
      username: formData.username,
      email: formData.email,
    };

    // Only include new_password if it's not empty
    if (formData.new_password) {
      updateData.new_password = formData.new_password;
    }

    try {
      // Dispatch the updateUserProfile thunk
      await dispatch(updateUserProfile({ userId: user.id, userData: updateData })).unwrap();
      setLocalMessage('Profile updated successfully!');
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, new_password: '' }));
      // Optionally re-fetch user profile to ensure local state is fresh
      dispatch(fetchUserProfile(user.id));
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/profile'); // Navigate to the user's profile page
      }, 1500);
    } catch (err) {
      // Error handled by extraReducers, but we can set a local message too
      setLocalMessage(`Failed to update profile: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    navigate('/profile'); // Go back to the profile page
  };

  return (
    <div className="form-page min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form
        className="form-container bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">Edit Profile</h2>

        {localMessage && (
          <p className={`text-center mb-4 ${localMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {localMessage}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            // Removed text-white and placeholder-gray-400 to rely on index.css !important
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            style={{ color: 'white' }} // Keeping inline style for maximum override power
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            // Removed text-white and placeholder-gray-400 to rely on index.css !important
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            style={{ color: 'white' }} // Keeping inline style for maximum override power
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="new_password" className="block text-gray-300 text-sm font-bold mb-2">
            New Password (optional)
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            // Removed text-white and placeholder-gray-400 to rely on index.css !important
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            style={{ color: 'white' }} // Keeping inline style for maximum override power
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-between space-x-4">
          <button
            type="submit"
            className={`
              bg-blue-600 hover:bg-blue-700
              text-white font-bold
              py-2 px-4 rounded-lg
              w-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={`
              bg-gray-600 hover:bg-gray-700
              text-white font-bold
              py-2 px-4 rounded-lg
              w-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
